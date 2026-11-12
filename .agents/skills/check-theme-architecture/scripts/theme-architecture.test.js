const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const { runThemeLint, maskNonExecutableLiquid } = require('./lint-theme.js');
const { parseCss, selectorSubjects } = require('./lib/css-syntax');
const {
    getLiquidSyntaxFailures,
    isRubyCompatibilityFallback,
    runLiquidSyntaxLint,
} = require('./lint-liquid-syntax.js');
const {
    extractBlocks,
    lineAt,
    runEmbeddedCompatLint,
    virtualEmbeddedJsPath,
} = require('./lint-embedded-compat.cjs');

const THEME_LINT_SCRIPT = path.join(__dirname, 'lint-theme.js');
const LIQUID_SYNTAX_SCRIPT = path.join(__dirname, 'lint-liquid-syntax.js');
const EMBEDDED_COMPAT_SCRIPT = path.join(__dirname, 'lint-embedded-compat.cjs');

const MATCHING_ESLINT_CONFIG = `module.exports = [{
  files: ['assets/*.js'],
  languageOptions: { ecmaVersion: 2022, sourceType: 'script' },
  rules: { 'no-alert': 'error' }
}];`;

function writeFile(root, relativePath, content) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
}

function withTempTheme(fn) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-theme-architecture-'));

    try {
        fn(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

async function withTempThemeAsync(fn) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-theme-architecture-'));

    try {
        await fn(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

function runScript(scriptPath, root) {
    return spawnSync(process.execPath, [scriptPath, '--root', root], {
        cwd: path.join(__dirname, '../../../../'),
        encoding: 'utf8',
        env: process.env,
    });
}

function failureMessages(failures) {
    return failures.map((entry) => entry.message).join('\n');
}

async function methodFailures(files, checkId) {
    let result;
    await withTempThemeAsync(async (root) => {
        for (const [file, content] of Object.entries(files)) writeFile(root, file, content);
        result = (await runThemeLint(root)).filter((failure) => failure.checkId === checkId);
    });
    return result;
}

const VIEWPORT_CHECK = 'forbidden-viewport-unit';

test('viewport units use decoded dimensions, including zero, negatives, escapes and scientific notation', async () => {
    for (const value of ['0vh', '-2LVH', '+3Vh', '.5vh', '1e2lvh', '2v\\68', '3\\6c vh', 'calc(2rem + 3vh)', 'var(--size, clamp(1rem, 20lvh, 40rem))']) {
        const failures = await methodFailures({ 'assets/base.css': `.x { --size: ${value}; }` }, VIEWPORT_CHECK);
        assert.equal(failures.length, 1, value);
    }
});

test('viewport units ignore permitted dimensions, strings, URLs, comments and selector text', async () => {
    const css = `/* height: 20vh */
        [data-size="80vh"], .vh, .h-\\[20vh\\] { content: "20vh"; background: url(/20vh.png); --url: url('20lvh'); }
        .safe {height:100svh;min-height:100dvh;width:20vw;gap:1rem;--cap:30cqi;--name:twentyvh;}
        @supports selector([data-size="80vh"]) { .safe {display:block;} }`;
    assert.equal((await methodFailures({ 'assets/base.css': css }, VIEWPORT_CHECK)).length, 0);
});

test('viewport units inspect dimension-bearing at-rule conditions, not arbitrary selector names', async () => {
    const fixtures = [
        '@media (height > 20vh) {.x{display:block}}',
        '@supports (height: 20lvh) {.x{display:block}}',
        '@container stage (height > 20vh) {.x{display:block}}',
        '@custom-media --short (height < 20lvh);',
        '@import url("20vh.css") (height > 20vh);',
    ];
    for (const css of fixtures) assert.equal((await methodFailures({ 'tailwind/test.css': css }, VIEWPORT_CHECK)).length, 1, css);
    assert.equal((await methodFailures({ 'tailwind/test.css': '@import url("20vh.css"); @layer my20vh {.x{height:20svh}}' }, VIEWPORT_CHECK)).length, 0);
});

test('viewport units parse actual embedded style and stylesheet nodes, excluding Liquid comments and docs', async () => {
    for (const tag of ['style', 'stylesheet']) {
        const source = `{% ${tag} %}\n.x {height:20vh;}\n{% end${tag} %}`;
        const failures = await methodFailures({ 'sections/test.liquid': source }, VIEWPORT_CHECK);
        assert.deepEqual(failures.map(({ file, line }) => ({ file, line })), [{ file: 'sections/test.liquid', line: 2 }]);
        for (const comment of ['comment', 'doc']) assert.equal((await methodFailures({ 'sections/test.liquid': `{% ${comment} %}${source}{% end${comment} %}` }, VIEWPORT_CHECK)).length, 0);
    }
    assert.equal((await methodFailures({ 'sections/test.liquid': '{% style %}{% comment %}.x{height:20vh}{% endcomment %}.x{height:20svh}{% endstyle %}' }, VIEWPORT_CHECK)).length, 0);
});

test('viewport units follow literal Liquid style branches and local style construction', async () => {
    const sources = [
        `{% assign amount = '20' %}{% style %}.x{height:{{ amount }}vh}{% endstyle %}`,
        `{% assign unit = 'vh' %}{% style %}.x{height:20{{ unit }}}{% endstyle %}`,
        `{% assign size = '20' | append: 'vh' %}<div style="height:{{ size }}"></div>`,
        `{% if active %}{% assign size = '20vh' %}{% else %}{% assign size = '1rem' %}{% endif %}<div style="height:{{ size }}"></div>`,
        `{% style %}.x{height:{% if active %}20vh{% else %}1rem{% endif %}}{% endstyle %}`,
        `<div style="{% unless active %}height:20lvh{% endunless %}"></div>`,
        `<div style="height:{% case size %}{% when 'large' %}20vh{% else %}1rem{% endcase %}"></div>`,
        `{% style %}{% for size in sizes %}.x{height:{{ size }}vh}{% endfor %}{% endstyle %}`,
    ];
    for (const source of sources) assert.equal((await methodFailures({ 'sections/test.liquid': source }, VIEWPORT_CHECK)).length, 1, source);
});

test('viewport units expose literal suffixes without inventing dynamic unit values', async () => {
    for (const size of ['{{ amount }}vh', '{{ amount }}LVH', '{{ amount }}v\\68']) {
        assert.equal((await methodFailures({ 'sections/test.liquid': `{% style %}.x{height:${size}}{% endstyle %}` }, VIEWPORT_CHECK)).length, 1, size);
        assert.equal((await methodFailures({ 'sections/test.liquid': `<div style="height:${size}"></div>` }, VIEWPORT_CHECK)).length, 1, size);
    }
    for (const size of ['{{ amount }}{{ unit }}', '20{{ unit }}', '{{ merchant_style }}', 'var(--unknown)', 'url("{{ amount }}vh")', '"{{ amount }}vh"']) {
        assert.equal((await methodFailures({ 'sections/test.liquid': `<div style='height:${size}'></div>` }, VIEWPORT_CHECK)).length, 0, size);
    }
});

test('viewport units decode numeric HTML attribute entities and retain source line attribution', async () => {
    const source = `<div\n style="\nheight:20v&#104;;\nwidth:2&#x6c;vh;\ncontent:&quot;20vh&quot;;\n"></div>`;
    assert.deepEqual((await methodFailures({ 'sections/test.liquid': source }, VIEWPORT_CHECK)).map((failure) => failure.line), [3, 4]);
    assert.equal((await methodFailures({ 'sections/test.liquid': `<div class="h-[20v&#104;]"></div>` }, VIEWPORT_CHECK)).length, 1);
    assert.equal((await methodFailures({ 'sections/test.liquid': '<div style class></div><div style="" class=""></div>' }, VIEWPORT_CHECK)).length, 0);
});

test('viewport correction R1 preserves signs and numeric fragments around an unresolved magnitude', async () => {
    const values = ['-{{ amount }}vh', '+{{ amount }}LVH', '1{{ decimal }}lvh', '{{ amount }}0vh', '1e{{ exponent }}vh', '{{ amount }}e-2vh', '-{{ amount }}v\\68', 'translateY(-{{ amount }}lvh)'];
    for (const value of values) {
        for (const source of [`<div style="top:${value}"></div>`, `{% style %}\n.x{top:${value}}\n{% endstyle %}`]) {
            const failures = await methodFailures({ 'sections/test.liquid': source }, VIEWPORT_CHECK);
            assert.equal(failures.length, 1, source);
            assert.equal(failures[0].line, source.startsWith('<') ? 1 : 2, source);
        }
    }
    for (const value of ['-{{ amount }}svh', '1{{ decimal }}dvh', '{{ amount }}{{ unit }}', '-{{ amount }}{{ unit }}', '1e{{ amount }}{{ unit }}', 'prefix{{ amount }}vh', '--{{ amount }}vh', '\\31 {{ amount }}vh', '{{ amount }}vh-name', 'url("-{{ amount }}vh")', '"1{{ amount }}lvh"']) {
        assert.equal((await methodFailures({ 'sections/test.liquid': `<div style='--value:${value}'></div>` }, VIEWPORT_CHECK)).length, 0, value);
    }
});

test('viewport correction R2 resolves only bounded assignments inside a Liquid statement wrapper', async () => {
    const source = `{% style %}{% liquid
  # height:20lvh in a comment is not CSS
  assign first = 'v'
  assign unit = first | append: 'h'
%}
.x{height:20{{ unit }}}
{% endstyle %}`;
    assert.deepEqual((await methodFailures({ 'sections/test.liquid': source }, VIEWPORT_CHECK)).map((failure) => failure.line), [6]);
    for (const wrapper of ["# assign unit = 'vh'", "assign unit = merchant.unit", "assign unit = 'svh'"]) {
        const safe = `{% style %}{% liquid\n${wrapper}\n%}.x{height:20{{ unit }}}{% endstyle %}`;
        assert.equal((await methodFailures({ 'sections/test.liquid': safe }, VIEWPORT_CHECK)).length, 0, safe);
    }
});

test('viewport correction R3 preserves raw CSS and source locations without executing apparent Liquid', async () => {
    const source = `{% style %}
{% raw %}
.x{height:20vh}
{% endraw %}
{% endstyle %}`;
    assert.deepEqual((await methodFailures({ 'sections/test.liquid': source }, VIEWPORT_CHECK)).map((failure) => failure.line), [3]);
    const safe = `{% style %}
{% assign unit = 'svh' %}
{% raw %}
/* {% assign unit = 'vh' %} */
.raw{content:"{{ unit }}vh";height:20svh}
{% endraw %}
.after{height:20{{ unit }}}
{% comment %}.comment{height:20vh}{% endcomment %}
{% doc %}.doc{height:20lvh}{% enddoc %}
{% endstyle %}`;
    assert.equal((await methodFailures({ 'sections/test.liquid': safe }, VIEWPORT_CHECK)).length, 0);
});

test('viewport correction R4 matches HTML attribute case without widening B3 or Liquid named arguments', async () => {
    for (const attribute of ['STYLE="height:20vh"', 'sTyLe="height:20lvh"', 'CLASS="h-screen"', 'cLaSs="h-screen"', ':STYLE="{height: \'20vh\'}"', 'X-BIND:style="\'height:20vh\'"', ':CLASS="\'h-screen\'"', 'x-BIND:CLASS="{\'h-screen\':active}"']) {
        assert.equal((await methodFailures({ 'snippets/test.liquid': `<div ${attribute}></div>` }, VIEWPORT_CHECK)).length, 1, attribute);
    }
    const upper = `<div CLASS="own mt-2 relative" STYLE="margin:2px" :CLASS="'mt-4'"></div>{% stylesheet %}.own{display:block}{% endstylesheet %}`;
    for (const id of ['content-outer-margin', 'mixed-element']) {
        assert.equal((await methodFailures({ 'snippets/test.liquid': upper }, id)).length, 0, id);
        assert.equal((await methodFailures({ 'snippets/test.liquid': upper.replaceAll('CLASS', 'class').replaceAll('STYLE', 'style') }, id)).length, 1, id);
    }
    const generated = `{% form 'product', product, STYLE: 'height:20vh', CLASS: 'h-screen' %}{% endform %}{{ image | image_tag: STYLE: 'height:20vh', CLASS: 'h-screen' }}`;
    assert.equal((await methodFailures({ 'sections/test.liquid': generated }, VIEWPORT_CHECK)).length, 0);
});

test('viewport units cover generated Shopify form and image style arguments at their use sites', async () => {
    const source = `{% assign styles = 'height:20vh' %}
{% form 'product', product,
  style: styles %}{% endform %}
{{ image | image_tag:
  style: styles }}`;
    assert.deepEqual((await methodFailures({ 'snippets/test.liquid': source }, VIEWPORT_CHECK)).map((failure) => failure.line), [3, 5]);
});

test('viewport units cover bounded literal Alpine styles without executing runtime expressions', async () => {
    for (const expression of ["'height:20vh'", "active ? 'height:20vh' : 'height:1rem'", "{minHeight: '20lvh'}", "{height: active ? '20vh' : '1rem'}", "active ? {height:'20vh'} : {}", "{height: &quot;20vh&quot;}"]) {
        const failures = await methodFailures({ 'sections/test.liquid': `<div :style="${expression}"></div>` }, VIEWPORT_CHECK);
        assert.equal(failures.length, 1, expression);
    }
    for (const expression of ['styles', "makeStyles('20vh')", "{height: size}", "{[property]: '20vh'}", "false ? 'height:20vh' : 'height:1rem'", "{content: '&quot;20vh&quot;'}"]) {
        assert.equal((await methodFailures({ 'sections/test.liquid': `<div x-bind:style="${expression}"></div>` }, VIEWPORT_CHECK)).length, 0, expression);
    }
});

test('viewport units recognize implicit screen utilities and preserve full arbitrary variant candidates', async () => {
    for (const candidate of ['h-screen', 'min-h-screen', 'max-h-screen', 'hover:h-screen', 'h-[20vh]', 'h-[calc(20vh_-_2rem)]', '[height:20lvh]', '[@media(height>20vh)]:block', 'supports-[height:20vh]:block', 'min-[20lvh]:block', 'h-[var(--size,20vh)]']) {
        assert.equal((await methodFailures({ 'sections/test.liquid': `<div class="${candidate}"></div>` }, VIEWPORT_CHECK)).length, 1, candidate);
    }
    const source = `<div class="[&[data-size='80vh']]:block unknownvh h-screenish h-[20svh] h-dvh h-lvh-name"></div><p>h-screen 20vh</p>`;
    assert.equal((await methodFailures({ 'sections/test.liquid': source }, VIEWPORT_CHECK)).length, 0);
});

test('viewport units compile project utilities and custom variants from their actual definitions', async () => {
    const css = '@theme {--breakpoint-tablet:48rem;} @utility owned {display:block;} @custom-variant can-hover {@media(hover:hover){@slot;}}';
    for (const candidate of ['[@media(height>20vh)]:owned', 'tablet:h-screen', 'can-hover:h-screen']) {
        assert.equal((await methodFailures({ 'tailwind/test.css': css, 'sections/test.liquid': `<div class="${candidate}"></div>` }, VIEWPORT_CHECK)).length, 1, candidate);
    }
    assert.equal((await methodFailures({ 'tailwind/test.css': css, 'sections/test.liquid': `<div class="[@media(height>20vh)]:unknown"></div>` }, VIEWPORT_CHECK)).length, 0);
});

test('viewport units reconstruct complete apply candidates including nested brackets and variants', async () => {
    const css = `@utility owned {display:block;} .x {
  @apply h-[calc(20vh_-_2rem)]
    [@media(height>20lvh)]:owned;
}`;
    const failures = await methodFailures({ 'tailwind/test.css': css }, VIEWPORT_CHECK);
    assert.deepEqual(failures.map((failure) => failure.line), [2, 3]);
    assert.match(failures[0].message, /h-\[calc\(20vh_-_2rem\)\]/);
    const parsed = await parseCss('.x {@apply hover:mt-2 w-[calc(100%_-_1rem)] !block;}');
    assert.deepEqual(parsed.rules[1].apply, ['hover:mt-2', 'w-[calc(100%_-_1rem)]', '!block']);
    assert.equal((await methodFailures({ 'tailwind/test.css': `.x{@apply h-[20svh] [&[data-size='80vh']]:block;}` }, VIEWPORT_CHECK)).length, 0);
});

test('viewport units retain Liquid and Alpine class alternatives and generated class sinks', async () => {
    const sources = [
        `<div class="{% if active %}h-screen{% else %}h-svh{% endif %}"></div>`,
        `<div :class="active ? 'h-screen' : 'h-svh'"></div>`,
        `<div :class="{'h-screen':active}"></div>`,
        `{% assign classes = 'h-' | append: 'screen' %}<div class="{{ classes }}"></div>`,
        `{% form 'product', product, class: 'h-screen' %}{% endform %}`,
        `{{ image | image_tag: class: 'h-screen' }}`,
    ];
    for (const source of sources) assert.equal((await methodFailures({ 'sections/test.liquid': source }, VIEWPORT_CHECK)).length, 1, source);
    assert.equal((await methodFailures({ 'sections/test.liquid': `<div :class="{'h-screen':false}"></div>` }, VIEWPORT_CHECK)).length, 0);
    assert.equal((await methodFailures({ 'sections/test.liquid': `{% render 'item', style: 'height:20vh', class: 'h-screen' %}`, 'snippets/item.liquid': '<div style="{{ style }}" class="{{ class }}"></div>' }, VIEWPORT_CHECK)).length, 2);
});

test('viewport units report exact CSS and markup lines and honor only adjacent reason-bearing suppressions', async () => {
    const css = `.x{\n/* lint-allow forbidden-viewport-unit: fixture */\nheight:20vh;\nwidth:20vh;\n}`;
    const markup = `{% # lint-allow forbidden-viewport-unit: fixture %}\n<div class="h-screen"></div>\n<div\n style="height:20vh"></div>`;
    const failures = await methodFailures({ 'assets/base.css': css, 'sections/test.liquid': markup }, VIEWPORT_CHECK);
    assert.deepEqual(failures.map(({ file, line }) => ({ file, line })).sort((a, b) => a.file.localeCompare(b.file)), [{ file: 'assets/base.css', line: 4 }, { file: 'sections/test.liquid', line: 4 }]);
    const embedded = '{% style %}\n/* lint-allow forbidden-viewport-unit: fixture */\n.x{height:20vh}\n.y{height:20lvh}\n{% endstyle %}';
    assert.deepEqual((await methodFailures({ 'sections/test.liquid': embedded }, VIEWPORT_CHECK)).map((failure) => failure.line), [4]);
});

test('viewport units preserve B3 input boundaries and support disabled configuration', async () => {
    const files = { 'snippets/test.liquid': `{% style %}.x{margin:2px;font-size:4cqi}{% endstyle %}<div :style="{margin:'2px'}"></div>{{ image | image_tag: style: 'margin:2px' }}` };
    for (const check of ['stylesheet-spacing', 'content-outer-margin', 'cqi-font-floor']) assert.equal((await methodFailures(files, check)).length, 0, check);
    const { collectCssMethodFailures } = require('./lib/css-method-lint');
    const { parseLiquidAst } = require('./lib/liquid-ast');
    const text = '{% style %}.x{height:20vh}{% endstyle %}<div class="h-screen" style="height:20vh"></div>';
    for (const enabled of [false, true]) {
        const failures = [];
        await collectCssMethodFailures([{ file: 'sections/test.liquid', text, ast: parseLiquidAst(text).ast, allowsByLine: new Map() }], [], failures, { [VIEWPORT_CHECK]: { enabled } });
        assert.equal(failures.length, enabled ? 2 : 0);
    }
});

test('viewport units retain the first-party CSS inventory and exclude generated and vendor files', async () => {
    const failures = await methodFailures({ 'assets/tailwind.output.css': '.x{height:20vh}', 'assets/vendor-demo.css': '.x{height:20vh}', 'assets/other.css': '.x{height:20vh}', 'assets/gift-card.css': '.x{height:20vh}', 'tailwind/nested/demo.css': '.x{height:20vh}' }, VIEWPORT_CHECK);
    assert.deepEqual(failures.map((failure) => failure.file).sort(), ['assets/gift-card.css', 'tailwind/nested/demo.css']);
});

test('spacing tokenizer finds absolute lengths through functions, escapes and scientific notation', async () => {
    const values = [
        ['padding-inline-start', 'calc(1rem + 2px)'],
        ['gap', 'var(--gap, min(1rem, 1e2p\\78))'],
        ['margin-block', 'clamp(0rem, 2cqi, 1cm)'],
        ['padding', 'max(1em, -2pt)'],
        ['p\\61 dding', '1Q'],
    ];
    for (const [property, value] of values) {
        const failures = await methodFailures({ 'assets/base.css': `.x { ${property}: ${value}; }` }, 'stylesheet-spacing');
        assert.equal(failures.length, 1, `${property}: ${value}`);
    }
    const failures = await methodFailures({
        'assets/base.css': '.x { padding: 0 -0px 1rem 2em; gap: var(--gap); margin-inline: 2%; content: "padding: 2px"; /* gap: 4px */ }',
        'snippets/example.liquid': '{% stylesheet %}.x { padding: calc(1em + 0px); }{% endstylesheet %}',
    }, 'stylesheet-spacing');
    assert.equal(failures.length, 0);
});

test('mixed element analysis keeps sink identity, dynamic alternatives and stylesheet subjects', async () => {
    const failures = await methodFailures({
        'snippets/example.liquid': `<div class="owned" :class="busy ? 'relative' : 'btn'"></div>
<div class="relative"></div><div class="owned"></div>
<input class="peer relative"><span class="child"></span>
<div :class="busy ? 'owned' : 'relative'"></div>
<div class="owned btn"></div>
{% stylesheet %}:where(.owned) { display:block; } .peer:checked ~ .child { display:block; }{% endstylesheet %}`,
        'tailwind/fixture.css': '@utility btn { display: inline-flex; }',
    }, 'mixed-element');
    assert.equal(failures.length, 1);
    assert.equal(failures[0].line, 1);
});

test('selector ownership handles functional subjects, grouping rules and custom-property case', async () => {
    const css = await parseCss(':where(.ancestor .child) { --Floor:1rem; } .own { @media (hover:hover) { &:hover { padding:1em; } } }');
    assert.equal(css.declarations[0].property, '--Floor');
    assert.deepEqual([...selectorSubjects(css.rules[1])[0].classes], ['child']);
    assert.deepEqual([...selectorSubjects(css.rules.at(-1))[0].classes], ['own']);
});

test('mixed generated image resolves local Liquid construction and a sink-specific exception', async () => {
    const source = `{% liquid
assign fit = 'cover'
assign classes = classes | default: '' | append: ' object-' | append: fit
assign classes = 'image_img ' | append: classes
%}
{{ picture | image_tag: class: classes }}
<div class="own relative"></div>
{% stylesheet %}.image_img { width:100%; } .own { display:block; }{% endstylesheet %}`;
    assert.equal((await methodFailures({ 'snippets/example.liquid': source }, 'mixed-element')).length, 2);
    const allowed = source.replace('{{ picture', '{% # lint-allow mixed-element: Preserve explicit caller image-fit classes. %}\n{{ picture');
    const failures = await methodFailures({ 'snippets/example.liquid': allowed }, 'mixed-element');
    assert.equal(failures.length, 1);
    assert.match(failures[0].message, /relative/);
});

test('content margins distinguish root branches, interior rhythm, layout primitives and resets', async () => {
    const failures = await methodFailures({
        'blocks/heading.liquid': '{% if content %}<h2 class="mt-2">X</h2>{% else %}<p style="margin-inline:1em">X</p>{% endif %}',
        'snippets/interior.liquid': '<div class="root"><p class="mt-2">X</p></div>{% stylesheet %}.root { margin:0; } .root p { margin-block:1em; }{% endstylesheet %}',
        'snippets/container.liquid': '<div class="mx-auto"></div>',
        'blocks/group.liquid': '<div class="mx-auto"></div>',
        'snippets/reset.liquid': '<div class="m-0" style="margin:0px 0"></div>',
        'snippets/flex-content.liquid': '<div class="flex mt-2"></div>',
    }, 'content-outer-margin');
    assert.equal(failures.length, 3);
    assert.deepEqual(new Set(failures.map((failure) => failure.file)), new Set(['blocks/heading.liquid', 'snippets/flex-content.liquid']));
});

test('content margins follow shared utility and CSS subjects and literal render arguments', async () => {
    const failures = await methodFailures({
        'snippets/one.liquid': '<div class="own"></div>{% stylesheet %}:where(.own) { margin-block:1em; }{% endstylesheet %}',
        'snippets/two.liquid': '<div class="detail"></div>',
        'tailwind/fixture.css': '@utility detail { margin-block-end: 1em; }',
        'snippets/three.liquid': '<div class="{{ class }}"></div>',
        'sections/caller.liquid': "{% render 'three', class: 'tablet:!mt-2' %}",
    }, 'content-outer-margin');
    assert.equal(failures.length, 3);
});

test('Shopify forms are real roots and capture bodies are roots only when emitted', async () => {
    const failures = await methodFailures({
        'snippets/form.liquid': "{% form 'product', product %}<div class='mt-2'></div>{% endform %}",
        'snippets/form-margin.liquid': "{% form 'product', product, class: 'mt-2' %}<div></div>{% endform %}",
        'snippets/capture.liquid': "{% capture sample %}<div class='mt-2'></div>{% endcapture %}<div></div>",
        'snippets/emitted.liquid': "{% capture sample %}<div class='mt-2'></div>{% endcapture %}{{ sample }}",
    }, 'content-outer-margin');
    assert.deepEqual(new Set(failures.map((failure) => failure.file)), new Set(['snippets/form-margin.liquid', 'snippets/emitted.liquid']));
});

test('cqi fonts require an actual rem floor on every reachable path', async () => {
    const valid = ['clamp(1rem, 4cqi, 8rem)', 'clamp(calc(2 * 1rem), min(2cqi, 3rem), 8rem)', 'clamp(1rem, clamp(0px, 4cqi, 8rem), 8rem)', 'var(--unresolved)'];
    const invalid = ['4cqi', 'clamp(1px, 4cqi, 8rem)', 'clamp(min(1rem, 1cqi), 4cqi, 8rem)', 'clamp(var(--font-heading-floor-fake), 4cqi, 8rem)', 'clamp(calc(1rem + 2px), 4cqi, 8rem)'];
    for (const [values, expected] of [[valid, 0], [invalid, 1]]) {
        for (const value of values) {
            const failures = await methodFailures({ 'assets/base.css': `.x { font-size:${value}; width:10cqi; }` }, 'cqi-font-floor');
            assert.equal(failures.length, expected, value);
        }
    }
});

test('cqi aliases retain case and scoped definitions, fallbacks and cyclic reachable paths', async () => {
    const fixtures = [
        ['.x { --Floor:1rem; --size:clamp(var(--Floor),4cqi,8rem); font-size:var(--size); }', 0],
        ['.x { --Floor:1rem; --size:clamp(var(--floor),4cqi,8rem); font-size:var(--size); }', 1],
        ['.x { --size:4cqi; } .x { font-size:var(--size); }', 1],
        ['.x { --a:var(--b); --b:var(--a,4cqi); font-size:var(--a); }', 1],
        ['.x { --a:var(--b); --b:var(--a); font-size:var(--a); }', 0],
        ['.x { --size:clamp(1rem,4cqi,8rem); font-size:var(--size,5cqi); }', 1],
        ['@utility first { --size:4cqi; font-size:var(--size); } @utility second { --size:clamp(1rem,4cqi,8rem); font-size:var(--size); }', 1],
    ];
    for (const [css, expected] of fixtures) assert.equal((await methodFailures({ 'tailwind/fixture.css': css }, 'cqi-font-floor')).length, expected, css);
});

test('cqi floor proof comes from emitted root tokens with finite literal keys, not names or comments', async () => {
    const source = `{% style %}:root {
{% assign type_step_keys = '0,1' | split: ',' %}
{% for step_key in type_step_keys %}--font-heading-floor-{{ step_key }}: {{ low_r | round: 4 }}rem;{% endfor %}
--font-heading-scale: {{ settings.heading_scale | divided_by: 100.0 }};
}{% endstyle %}`;
    const css = '@utility title { --size:clamp(calc(var(--font-heading-scale) * var(--font-heading-floor-0)),4cqi,8rem); font-size:var(--size); }';
    const variants = [
        [source, css, 0],
        [source.replace('}}rem;', '}}px;'), css, 1],
        [source.replace("'0,1'", "'1,2'"), css, 1],
        [source.replace(':root', '.local'), css, 1],
        [`{% comment %}${source}{% endcomment %}`, css, 1],
        [source, css.replace('--size:', '--font-heading-floor-0:1px; --size:'), 1],
    ];
    for (const [tokens, consumer, expected] of variants) {
        const failures = await methodFailures({ 'snippets/css-variables.liquid': tokens, 'tailwind/fixture.css': consumer }, 'cqi-font-floor');
        assert.equal(failures.length, expected, tokens + consumer);
    }
});

test('R1 descendant utility and nested CSS margins do not become content-root margins', async () => {
    const failures = await methodFailures({
        'snippets/detail.liquid': '<div class="detail"><p>X</p></div>',
        'snippets/space.liquid': '<div class="space-y-2"><p>X</p><p>Y</p></div>',
        'snippets/rte.liquid': '<div class="rte"><div>X</div></div>',
        'snippets/host.liquid': '<div class="host"></div>',
        'tailwind/fixture.css': '@utility detail { & p { margin-block:1em; } } .rte { > div { margin-block:1em; } } @utility host { &:hover { margin-block:1em; } }',
    }, 'content-outer-margin');
    assert.deepEqual(failures.map((failure) => failure.file), ['snippets/host.liquid']);
});

test('R2 class alternatives and complementary Alpine conditions cannot invent co-occurrence', async () => {
    assert.equal((await methodFailures({
        'snippets/choice.liquid': '<div :class="active ? \'a\' : \'b\'"></div>{% stylesheet %}.a.b { margin:1em; }{% endstylesheet %}',
    }, 'content-outer-margin')).length, 0);
    const failures = await methodFailures({
        'snippets/choice.liquid': `<div class="owned" :class="{relative:false}"></div>
<div :class="{owned:active,relative:!active}"></div>
<div :class="{owned:active,relative:active}"></div>
{% stylesheet %}.owned { display:block; }{% endstylesheet %}`,
    }, 'mixed-element');
    assert.equal(failures.length, 1);
    assert.equal(failures[0].line, 3);
});

test('R3 literal Liquid conditional class branches are checked as per-element alternatives', async () => {
    const files = {
        'snippets/choice.liquid': `<div class="owned {% if active %}relative{% endif %}"></div>
<div class="{% unless active %}mt-2{% endunless %}"></div>
<div class="{% case mode %}{% when 'wide' %}mb-2{% else %}m-0{% endcase %}"></div>
{% stylesheet %}.owned { display:block; }{% endstylesheet %}`,
    };
    assert.equal((await methodFailures(files, 'mixed-element')).length, 1);
    assert.equal((await methodFailures(files, 'content-outer-margin')).length, 2);
});

test('R4 full functional-selector and grouping identities preserve cqi variable scopes', async () => {
    const css = ':where(.safe){--floor:1rem;font-size:clamp(var(--floor),4cqi,8rem)} :where(.other){--floor:1px} @media (hover:hover){.safe{--floor:1rem;font-size:clamp(var(--floor),4cqi,8rem)}} @media (hover:none){.safe{--floor:1px}}';
    assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, 0);
});

test('R5 root descendants and conditional roots cannot certify an unconditional global floor', async () => {
    for (const source of [':root .other{--floor:1rem}', '@media (hover:hover){:root{--floor:1rem}}', '.other{:root{--floor:1rem}}']) {
        const css = `${source} .target{font-size:clamp(var(--floor),4cqi,8rem)}`;
        assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, 1, source);
    }
    const css = '@layer base{:root{--floor:1rem}} .target{font-size:clamp(var(--floor),4cqi,8rem)}';
    assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, 0);
    const conditional = '@media (hover:hover){:root{--floor:1rem}.target{font-size:clamp(var(--floor),4cqi,8rem)}}';
    assert.equal((await methodFailures({ 'assets/base.css': conditional }, 'cqi-font-floor')).length, 0);
});

test('R6 bounded scalar/rem arithmetic rejects zero and negative computed floors', async () => {
    const invalid = ['calc(0 * 1rem)', 'calc(1rem - 2rem)', 'calc(8rem / 2 * -1)', 'calc(1rem + 1rem - 2rem)', 'calc(var(--positive) - 1rem)', 'var(--positive, 0rem)'];
    const valid = ['calc(2 * 1rem)', 'calc(2rem - 1rem)', 'calc(8rem / 2 * 2)', 'max(-1rem, 1rem)'];
    for (const [values, count] of [[invalid, 1], [valid, 0]]) for (const floor of values) {
        const css = `.x{--positive:1rem;font-size:clamp(${floor},4cqi,8rem)}`;
        assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, count, floor);
    }
    const files = {
        'snippets/css-variables.liquid': '{% style %}:root{--floor:{{ 0 }}rem;}{% endstyle %}',
        'assets/base.css': '.x{font-size:clamp(var(--floor),4cqi,8rem)}',
    };
    assert.equal((await methodFailures(files, 'cqi-font-floor')).length, 1);
});

test('R7 metadata elements are not reusable content roots', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'snippets/metadata.liquid', '<meta class="mt-2"><title class="mt-2">X</title><link class="mt-2" href="/"><div>X</div>');
        const failures = await runThemeLint(root);
        assert.equal(failures.metrics.contentRoots, 1);
        assert.equal(failures.filter((failure) => failure.checkId === 'content-outer-margin').length, 0);
    });
});

test('additional R5 cycle traces conditional root definitions, defaults and intermediate aliases', async () => {
    const sources = [
        '@media (width > 40rem){:root{--size:4cqi}}',
        '@supports (display:grid){:root{--size:4cqi}}',
        ':root{--size:1rem} @media (width > 40rem){:root{--size:4cqi}}',
        ':root{--size:var(--fluid)} @media (width > 40rem){:root{--fluid:4cqi}}',
        ':root{--size:var(--fluid);--fluid:1rem} @media (width > 40rem){:root{--fluid:4cqi}}',
        ':root{--size:var(--fluid);--fluid:1rem} @supports (display:grid){:root{--fluid:4cqi}}',
        ':root{--size:var(--alias);--alias:var(--fluid);--fluid:1rem} @media (width > 40rem){:root{--fluid:4cqi}}',
    ];
    for (const source of sources) {
        const css = `${source} .target{font-size:var(--size)}`;
        assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, 1, source);
    }
});

test('additional R5 cycle separates potential overrides from available positive floors', async () => {
    const fixtures = [
        ['@media (width > 40rem){:root{--size:clamp(1rem,4cqi,8rem)}} .target{font-size:var(--size)}', 0],
        ['@supports (display:grid){:root{--floor:1rem;--size:clamp(var(--floor),4cqi,8rem)}} .target{font-size:var(--size)}', 0],
        [':root{--size:1rem} @media (width > 40rem){:root{--floor:1rem;--size:clamp(var(--floor),4cqi,8rem)}} .target{font-size:var(--size)}', 0],
        [':root{--size:var(--fluid);--fluid:1rem} @media (width > 40rem){:root{--fluid:clamp(1rem,4cqi,8rem)}} .target{font-size:var(--size)}', 0],
        [':root{--floor:var(--base)} @media (width > 40rem){:root{--base:1rem;--size:clamp(var(--floor),4cqi,8rem)}} .target{font-size:var(--size)}', 0],
        [':root{--floor:var(--base);--size:clamp(var(--floor),4cqi,8rem)} @supports (display:grid){:root{--base:1rem;--alias:var(--size)}} .target{font-size:var(--alias)}', 0],
        [':root{--floor:1rem} @media (width > 40rem){:root{--floor:2rem}} .target{font-size:clamp(var(--floor),4cqi,8rem)}', 0],
        ['@media (width > 40rem){:root{--floor:1rem}} .target{font-size:clamp(var(--floor),4cqi,8rem)}', 1],
        ['@supports (display:grid){:root{--floor:1rem}} .target{font-size:clamp(var(--floor),4cqi,8rem)}', 1],
        [':root{--floor:1rem} @media (width > 40rem){:root{--floor:1px}} .target{font-size:clamp(var(--floor),4cqi,8rem)}', 1],
        [':root{--floor:1rem} @supports (display:grid){:root{--floor:0rem}} .target{font-size:clamp(var(--floor),4cqi,8rem)}', 1],
        [':root{--floor:var(--base);--base:1rem} @media (width > 40rem){:root{--base:1px}} .target{font-size:clamp(var(--floor),4cqi,8rem)}', 1],
    ];
    for (const [css, expected] of fixtures) {
        assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, expected, css);
    }
});

test('additional R5 cycle preserves local shadows, cycles, fallback paths and outer guards', async () => {
    const fixtures = [
        ['@media (width > 40rem){:root{--size:4cqi}} .target{--size:1rem;font-size:var(--size)}', 0],
        [':root{--floor:1rem} @media (width > 40rem){:root{--floor:1px}} .target{--floor:2rem;font-size:clamp(var(--floor),4cqi,8rem)}', 0],
        ['@media (width > 40rem){:root{--size:4cqi}} .target{font-size:clamp(1rem,var(--size),8rem)}', 0],
        [':root{--size:var(--alias);--alias:var(--size)} @media (width > 40rem){:root{--alias:4cqi}} .target{font-size:var(--size)}', 1],
        ['@media (width > 40rem){:root{--size:var(--missing,4cqi)}} .target{font-size:var(--size)}', 1],
        ['@media (width > 40rem){:root{--size:clamp(1rem,var(--missing,4cqi),8rem)}} .target{font-size:var(--size)}', 0],
    ];
    for (const [css, expected] of fixtures) {
        assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, expected, css);
    }
});

test('R5 completion permits positive rem fallbacks for absent and conditional definitions', async () => {
    const sources = ['', '@media (width > 40rem){:root{--floor:1rem}}', '@supports (display:grid){:root{--floor:2rem}}'];
    const floors = ['var(--floor,1rem)', 'var(--floor,var(--other,1rem))', 'var(--floor,var(--floor,1rem))', 'calc(2 * var(--floor,1rem))'];
    for (const source of sources) for (const floor of floors) {
        const css = `${source} .target{font-size:clamp(${floor},4cqi,8rem)}`;
        assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, 0, css);
    }
    const css = '@media (width > 40rem){:root{--floor:1rem}} @supports (display:grid){:root{--other:2rem}} .target{font-size:clamp(var(--floor,var(--other,1rem)),4cqi,8rem)}';
    assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, 0);
});

test('R5 completion safe fallbacks cannot conceal unsafe or unproven defined replacements', async () => {
    const replacements = ['1px', '0rem', '-1rem', 'calc(0 * 1rem)', 'calc(1rem - 2rem)', 'var(--unproven)', 'var(--floor,1rem)'];
    for (const replacement of replacements) for (const condition of ['@media (width > 40rem)', '@supports (display:grid)']) {
        const css = `${condition}{:root{--floor:${replacement}}} .target{font-size:clamp(var(--floor,1rem),4cqi,8rem)}`;
        assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, 1, css);
    }
    const css = ':root{--floor:1rem} @media (width > 40rem){:root{--floor:var(--bad);--bad:1px}} .target{font-size:clamp(var(--floor,1rem),4cqi,8rem)}';
    assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, 1);
});

test('R5 completion validates nested fallback values and preserves local alias and cycle guards', async () => {
    const fixtures = [
        ['.target{font-size:clamp(var(--floor,1px),4cqi,8rem)}', 1],
        ['.target{font-size:clamp(var(--floor,0rem),4cqi,8rem)}', 1],
        ['.target{font-size:clamp(var(--floor,-1rem),4cqi,8rem)}', 1],
        ['.target{font-size:clamp(var(--floor,var(--other,1px)),4cqi,8rem)}', 1],
        ['.target{font-size:clamp(var(--floor,var(--other)),4cqi,8rem)}', 1],
        ['@media (width > 40rem){:root{--floor:1rem}} .target{font-size:clamp(var(--floor,var(--other,1cqi)),4cqi,8rem)}', 1],
        ['@media (width > 40rem){:root{--floor:1px}} .target{--floor:2rem;font-size:clamp(var(--floor,1rem),4cqi,8rem)}', 0],
        [':root{--floor:var(--other,1rem)} .target{font-size:clamp(var(--floor,1rem),4cqi,8rem)}', 0],
        [':root{--floor:var(--other);--other:var(--floor)} .target{font-size:clamp(var(--floor,1rem),4cqi,8rem)}', 1],
    ];
    for (const [css, expected] of fixtures) {
        assert.equal((await methodFailures({ 'assets/base.css': css }, 'cqi-font-floor')).length, expected, css);
    }
});

test('assign over protected runtime name fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div>{% assign product = 'override' %}</div>\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not assign over protected Shopify Liquid runtime name "product"/,
        );
    });
});

test('liquid block assign over protected runtime name fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            ['{% liquid', "assign product = 'override'", '%}', ''].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not assign over protected Shopify Liquid runtime name "product"/,
        );
    });
});

test('capture over protected runtime name fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div>{% capture cart %}content{% endcapture %}</div>\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not capture over protected Shopify Liquid runtime name "cart"/,
        );
    });
});

test('liquid block capture over protected runtime name fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            ['{% liquid', 'capture cart', '  content', 'endcapture', '%}'].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not capture over protected Shopify Liquid runtime name "cart"/,
        );
    });
});

test('content_for_header shadowing fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `{% assign content_for_header = 'override' %}\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not assign over protected Shopify Liquid runtime name "content_for_header"/,
        );
    });
});

test('metaobjects shadowing fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `{% capture metaobjects %}content{% endcapture %}\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not capture over protected Shopify Liquid runtime name "metaobjects"/,
        );
    });
});

test('comment and doc examples do not fail runtime name lint', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% comment %}',
                "{% assign product = 'example' %}",
                '{% endcomment %}',
                '{% doc %}',
                '{% capture cart %}example{% endcapture %}',
                '{% enddoc %}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('local assign passes theme lint', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div>{% assign local_value = 'ok' %}</div>\n`,
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('tab with literal aria attributes passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<button role="tab" aria-selected="false" aria-controls="panel-1">Tab</button>\n`,
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('tab with x-bind aria attributes passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<button role="tab" x-bind:aria-selected="isActive" x-bind:aria-controls="panelId">Tab</button>\n`,
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('tab missing aria-selected fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<button role="tab" aria-controls="panel-1">Tab</button>\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /role="tab" is missing aria-selected/);
    });
});

for (const [label, markup, reason] of [
    ['semicolon', `<div @click="close(); reset()"></div>`, /not a single expression/],
    ['declaration', `<div @click="let link = $event.target"></div>`, /not a single expression/],
    ['control flow', `<div @keydown.escape.window="if (open) close()"></div>`, /not a single expression/],
    ['control flow behind a comment', `<div @click="if/*x*/(open) close()"></div>`, /not a single expression/],
    ['unterminated string', `<div @click="say('a; b)"></div>`, /not a single expression/],
    ['arrow function', `<div x-init="$nextTick(() => focus())"></div>`, /contains a function/],
    ['function', `<div x-data="{ toggle: function () {} }"></div>`, /contains a function/],
    ['method shorthand', `<div x-data="{ toggle() { open = !open } }"></div>`, /contains a function/],
    ['comma sequence', `<div @click="close(), reset()"></div>`, /contains a comma sequence/],
    ['wrapper escape', `<div @click="a); if (open) close(); (b"></div>`, /not a single expression/],
    ['wrapper escape into a sum', `<div @click="a) + (b"></div>`, /not a single expression/],
    [
        'comma sequence in the x-for source',
        `<template x-for="item in (items, moreItems)"></template>`,
        /contains a comma sequence/,
    ],
    ['Liquid value', `<p x-text="errors['{{ item.key }}']"></p>`, /contains Liquid/],
    ['bare x-bind', `<div x-bind="close(); reset()"></div>`, /"x-bind" contains statements/],
    ['plugin directive', `<div x-intersect="if (visible) load()"></div>`, /"x-intersect" contains statements/],
    [
        'conditional attribute',
        `<div {% if open %}@click="close(); reset()"{% endif %}></div>`,
        /"@click" contains statements/,
    ],
    [
        'template literal interpolation',
        '<div :class="`item ${list.map((item) => item.id)}`"></div>',
        /contains a function/,
    ],
    ['unreadable entity', `<div @click="say(&#x110000;)"></div>`, /HTML entity this check cannot read/],
    ['unknown named entity', `<div @click="say(&copy;)"></div>`, /HTML entity this check cannot read/],
]) {
    test(`alpine attribute with ${label} fails`, async () => {
        await withTempThemeAsync(async (root) => {
            writeFile(root, 'sections/fixture.liquid', `${markup}\n`);

            const failures = await runThemeLint(root);
            assert.match(failureMessages(failures), reason);
        });
    });
}

test('simple alpine expressions pass', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                `<div x-data="accordion" data-initial-active="{{ index }}" @click.away="close()">`,
                `    <button @click="onNavClick($event)" :aria-expanded="isActive($el.dataset.index)"></button>`,
                `    <p x-show="errors[$el.dataset.lineKey]" :style="'margin: 0; padding: 0'"></p>`,
                `    <span`,
                `        :class="{`,
                `            'is-selected': selected === $el.dataset.value,`,
                `            'is-unavailable': !available,`,
                `        }"`,
                `    ></span>`,
                `    <span :class="isSuccess ? 'is-success' : available ? 'is-ready' : ''"></span>`,
                `    <button @click="say(&quot;hi&quot;)" x-on:focus="say(&#34;a; b&#34;)"></button>`,
                '    <span :class="`item-${index} is-${state}`" x-text="\'don\\\'t; stop\'"></span>',
                `    <div x-cloak x-ref="panel"></div>`,
                `    <button @click="doThis&nbsp;()" x-on:blur="doThis&NewLine;()" :title="label /* note; () => */"></button>`,
                `    <template x-for="(item, index) in items"><span x-text="item"></span></template>`,
                `    <template x-for="i in 10"></template>`,
                `    <span x-text="await getLabel()" x-init="await load()"></span>`,
                `    <span :class="(open && ready) ? 'is-open' : ''" x-text="(a) + (b)"></span>`,
                `    <div x-data="{ open: false, count: 0 }" @click="open = !open"></div>`,
                `</div>`,
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failureMessages(failures), '');
    });
});

test('tab missing aria-controls fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<button role="tab" aria-selected="false">Tab</button>\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /role="tab" is missing aria-controls/);
    });
});

test('maskNonExecutableLiquid preserves line breaks and length', () => {
    const source = ['line1', '{% comment %}', 'hidden', '{% endcomment %}', 'line5', ''].join('\n');
    const masked = maskNonExecutableLiquid(source);

    assert.equal(masked.split('\n').length, source.split('\n').length);
    assert.equal(masked.length, source.length);
});

test('quoted liquid filter argument name fails syntax lint', () => {
    const invalid = "{{ media | model_viewer_tag: 'camera-controls': true }}";
    const failures = getLiquidSyntaxFailures(invalid);

    assert.equal(failures.length, 1);
});

test('hyphenated liquid filter argument name passes syntax lint', () => {
    const valid = '{{ media | model_viewer_tag: camera-controls: true }}';
    const failures = getLiquidSyntaxFailures(valid);

    assert.equal(failures.length, 0);
});

test('ordinary valid liquid passes syntax lint', () => {
    const valid = `<p>{{ product.title | escape }}</p>`;
    const failures = getLiquidSyntaxFailures(valid);

    assert.equal(failures.length, 0);
});

test('ruby compatibility fallback accepts empty append argument', () => {
    assert.equal(isRubyCompatibilityFallback('product.title | append: '), true);
    assert.equal(getLiquidSyntaxFailures('{{ product.title | append: }}').length, 0);
});

test('ruby compatibility fallback accepts trailing comma before next filter', () => {
    assert.equal(isRubyCompatibilityFallback('value | append: item,'), true);
    assert.equal(getLiquidSyntaxFailures('{{ value | append: item, }}').length, 0);
});

test('liquid syntax lint runs against temp theme root', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `{{ media | model_viewer_tag: 'camera-controls': true }}\n`,
        );

        const failures = await runLiquidSyntaxLint(root);
        assert.equal(failures.length, 1);
    });
});

test('embedded compat extracts stylesheet and javascript blocks', () => {
    const source = [
        '<div>',
        '{% stylesheet %}',
        '.ok { color: red; }',
        '{% endstylesheet %}',
        '{% javascript %}',
        'console.log("ok");',
        '{% endjavascript %}',
        '</div>',
        '',
    ].join('\n');

    assert.equal(extractBlocks(source, 'stylesheet').length, 1);
    assert.equal(extractBlocks(source, 'javascript').length, 1);
});

test('embedded js virtual path matches assets/*.js eslint config', () => {
    assert.equal(
        virtualEmbeddedJsPath('sections/fixture.liquid', 0),
        'assets/__embedded-sections-fixture-liquid-0.js',
    );
});

test('embedded js lint uses matching eslint config and flags alert', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'eslint.config.cjs', MATCHING_ESLINT_CONFIG);
        writeFile(root, 'stylelint.config.cjs', `module.exports = { rules: {} };`);
        writeFile(
            root,
            'sections/fixture.liquid',
            ['{% javascript %}', "alert('x');", '{% endjavascript %}', ''].join('\n'),
        );

        const virtualPath = virtualEmbeddedJsPath('sections/fixture.liquid', 0);
        assert.equal(fs.existsSync(path.join(root, virtualPath)), false);

        const { issues } = await runEmbeddedCompatLint(root);

        assert.ok(issues.length >= 1);
        assert.match(issues[0].message, /no-alert/);
        assert.equal(issues[0].file, 'sections/fixture.liquid');
        assert.equal(issues[0].line, 2);
        assert.equal(fs.existsSync(path.join(root, virtualPath)), false);
    });
});

test('embedded js lint passes valid code with matching eslint config', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'eslint.config.cjs', MATCHING_ESLINT_CONFIG);
        writeFile(root, 'stylelint.config.cjs', `module.exports = { rules: {} };`);
        writeFile(
            root,
            'sections/fixture.liquid',
            ['{% javascript %}', 'console.log("ok");', '{% endjavascript %}', ''].join('\n'),
        );

        const { issues } = await runEmbeddedCompatLint(root);
        assert.equal(issues.length, 0);
    });
});

test('embedded compat maps stylesheet issue lines back to liquid source', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'eslint.config.cjs', MATCHING_ESLINT_CONFIG);
        writeFile(
            root,
            'stylelint.config.cjs',
            `module.exports = { rules: { 'color-no-invalid-hex': true } };`,
        );
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<div>',
                '{% stylesheet %}',
                '.bad { color: #zzzzzz; }',
                '{% endstylesheet %}',
                '</div>',
                '',
            ].join('\n'),
        );

        const { issues } = await runEmbeddedCompatLint(root);
        assert.ok(issues.length >= 1);
        assert.equal(issues[0].file, 'sections/fixture.liquid');
        assert.equal(issues[0].line, 3);
    });
});

test('lineAt helper maps offsets to source lines', () => {
    const source = 'a\nb\nc\n';
    assert.equal(lineAt(source, 0), 1);
    assert.equal(lineAt(source, 2), 2);
    assert.equal(lineAt(source, 4), 3);
});

test('multiple stylesheet tags fail', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.one { color: #111111; }',
                '{% endstylesheet %}',
                '{% stylesheet %}',
                '.two { color: #222222; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Only one {% stylesheet %} tag is allowed per file \(found 2\)/,
        );
    });
});

test('multiple javascript tags fail', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% javascript %}',
                "console.log('one');",
                '{% endjavascript %}',
                '{% javascript %}',
                "console.log('two');",
                '{% endjavascript %}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Only one {% javascript %} tag is allowed per file \(found 2\)/,
        );
    });
});

test('liquid inside stylesheet block fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.ok { color: {{ settings.color }}; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Liquid output tags are not allowed inside {% stylesheet %} blocks/,
        );
    });
});

test('liquid inside javascript block fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% javascript %}',
                "console.log({{ cart.item_count }});",
                '{% endjavascript %}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Liquid output tags are not allowed inside {% javascript %} blocks/,
        );
    });
});

test('theme lint cli accepts --root without auto-running on import', () => {
    withTempTheme((root) => {
        writeFile(root, 'sections/fixture.liquid', `<div>{% assign local_value = 'ok' %}</div>\n`);

        const result = runScript(THEME_LINT_SCRIPT, root);
        const output = `${result.stdout}${result.stderr}`;

        assert.equal(result.status, 0, output);
        assert.match(output, /Theme architecture lint passed\./);
    });
});

test('liquid syntax cli accepts --root without auto-running on import', () => {
    withTempTheme((root) => {
        writeFile(root, 'sections/fixture.liquid', `<p>{{ product.title | escape }}</p>\n`);

        const result = runScript(LIQUID_SYNTAX_SCRIPT, root);
        const output = `${result.stdout}${result.stderr}`;

        assert.equal(result.status, 0, output);
        assert.match(output, /Liquid syntax lint passed\./);
    });
});

test('invalid rgb alpha syntax fails in stylesheet blocks', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<section>',
                '{% stylesheet %}',
                '.muted {',
                '    color: rgb(var(--color-foreground) / 0.8);',
                '}',
                '{% endstylesheet %}',
                '</section>',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        const rgbAlphaFailures = failures.filter((failure) =>
            failure.message.includes('rgba(var(--color-*), alpha)'),
        );

        assert.equal(rgbAlphaFailures.length, 1);
        assert.equal(rgbAlphaFailures[0].file, 'sections/fixture.liquid');
        assert.equal(rgbAlphaFailures[0].line, 4);
    });
});

test('invalid rgb alpha syntax fails in first-party css files', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            ['.muted {', '    color: rgb(var(--color-border) / 0.2);', '}', ''].join('\n'),
        );

        const failures = await runThemeLint(root);
        const rgbAlphaFailures = failures.filter((failure) =>
            failure.message.includes('rgba(var(--color-*), alpha)'),
        );

        assert.equal(rgbAlphaFailures.length, 1);
        assert.equal(rgbAlphaFailures[0].file, 'tailwind/fixture.css');
        assert.equal(rgbAlphaFailures[0].line, 2);
    });
});

test('invalid rgb alpha syntax fails for variable alpha', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            [
                '.muted {',
                '    color: rgb(var(--color-foreground) / var(--opacity));',
                '}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        const rgbAlphaFailures = failures.filter((failure) =>
            failure.message.includes('rgba(var(--color-*), alpha)'),
        );

        assert.equal(rgbAlphaFailures.length, 1);
        assert.equal(rgbAlphaFailures[0].file, 'tailwind/fixture.css');
        assert.equal(rgbAlphaFailures[0].line, 2);
    });
});

test('invalid rgb alpha syntax fails for rgba slash spelling', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            [
                '.muted {',
                '    color: rgba(var(--color-foreground) / 0.5);',
                '}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        const rgbAlphaFailures = failures.filter((failure) =>
            failure.message.includes('rgba(var(--color-*), alpha)'),
        );

        assert.equal(rgbAlphaFailures.length, 1);
        assert.equal(rgbAlphaFailures[0].file, 'tailwind/fixture.css');
        assert.equal(rgbAlphaFailures[0].line, 2);
    });
});

test('valid rgba scheme color syntax passes rgb alpha lint', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            [
                '.muted {',
                '    color: rgba(var(--color-foreground), 0.8);',
                '    border-color: rgba(var(--color-border), 0.2);',
                '}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        const rgbAlphaFailures = failures.filter((failure) =>
            failure.message.includes('rgba(var(--color-*), alpha)'),
        );

        assert.equal(rgbAlphaFailures.length, 0);
    });
});

// The layout renders the entry scripts snippet, which holds the import map.
function writeEntryScripts(root, importsJson) {
    writeFile(root, 'layout/theme.liquid', `<head>\n{% render 'scripts' %}\n</head>\n`);
    writeFile(root, 'snippets/scripts.liquid', `<script type="importmap">\n${importsJson}\n</script>\n`);
}

function writeMinimalImportMap(root) {
    writeEntryScripts(root, `{"imports":{"accordion":"{{ 'accordion.js' | asset_url }}"}}`);
}

test('settings chain liquid class font-medium fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="font-medium">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /settings typography\/color chain/);
    });
});

test('settings chain liquid class body-md passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="body-md">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('settings chain css typography literal fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {\n    font-size: 18px;\n}\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Typography property "font-size"/);
    });
});

test('settings chain css typography var passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            `.ok { font-size: calc(var(--font-body-size)); }\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
        );
    });
});

test('settings chain css color hex fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {\n    color: #112233;\n}\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Color property "color"/);
    });
});

test('settings chain css color token passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            `.ok { color: rgb(var(--color-foreground)); }\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Color property')).length,
            0,
        );
    });
});

test('heading-h tier on div fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<div class="heading-h2">Title</div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /title-\* tiers belong on h1–h6/);
    });
});

test('heading-h tier on h2 passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<h2 class="heading-h2">Title</h2>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('body tier on heading fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<h2 class="body-md">Title</h2>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /copy-\* tiers belong on non-heading/);
    });
});

test('body tier on paragraph passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="body-md">Copy</p>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('stylesheet directive @apply fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            ['{% stylesheet %}', '@apply text-theme-text;', '{% endstylesheet %}', ''].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /plain CSS only/);
    });
});

test('stylesheet plain css passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.ok { color: rgb(var(--color-foreground)); }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('liquid style tag fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<style>.x{}</style>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /ad-hoc <style>/);
    });
});

test('executable inline script fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<script>alert(1)</script>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /executable inline <script>/);
    });
});

test('importmap script passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<script type="importmap">{"imports":{}}</script>\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('executable inline')).length,
            0,
        );
    });
});

test('raw svg in liquid fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<svg viewBox="0 0 1 1"></svg>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /raw SVG/);
    });
});

test('bare img fails outside image snippet', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<img src="/x" alt="">\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /bare <img>/);
    });
});

test('x-transition fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<div x-transition:enter="open"></div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /x-transition/);
    });
});

test('js alpine outlet fails outside adapter', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `window.Alpine.start();\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Alpine APIs belong in alpine.adapter.js/);
    });
});

test('js alpine outlet passes in adapter file', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/alpine.adapter.js', `const Alpine = window.Alpine;\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Alpine APIs')).length,
            0,
        );
    });
});

test('js fetch outlet fails outside https', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `fetch('/cart.js');\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /HTTP requests belong in https.js/);
    });
});

test('js fetch outlet passes in https', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/https.js', `await fetch('/cart.js');\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('HTTP requests')).length,
            0,
        );
    });
});

test('js cart route outlet fails outside contract', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `const url = '/cart/add.js';\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Cart routes belong in cart.contract.js/);
    });
});

test('js cart route outlet passes in contract', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/cart.contract.js', `const url = '/cart/add.js';\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Cart routes')).length,
            0,
        );
    });
});

test('js document outlet fails outside core files', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `document.addEventListener('click', () => {});\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /document\/window listeners belong/);
    });
});

test('js document outlet fails for window listeners outside core files', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `window.addEventListener('resize', () => {});\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /document\/window listeners belong/);
    });
});

test('js document outlet allows document reads in components', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `document.querySelector('.x');\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('document/window')).length,
            0,
        );
    });
});

test('js document outlet passes in base', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/base.js', `document.addEventListener('click', () => {});\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('document/window')).length,
            0,
        );
    });
});

test('js user visible copy fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `el.textContent = 'Hello world';\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Hardcoded user-visible copy/);
    });
});

test('js user visible copy passes with dataset', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `el.textContent = el.dataset.message || '';\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Hardcoded user-visible')).length,
            0,
        );
    });
});

test('module data-module-id missing fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'sections/fixture.liquid', `<div x-data="accordion"></div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /must declare data-module-id/);
    });
});

test('module data-module-id present passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div x-data="accordion" data-module-id="accordion"></div>\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId?.startsWith('module-')).length,
            0,
        );
    });
});

test('section color scheme missing on frame fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<div class="section">',
                '  <p>Content</p>',
                '</div>',
                '{% schema %}',
                '{"name":"t:x","settings":[{"type":"color_scheme","id":"color_scheme","label":"t:x"}]}',
                '{% endschema %}',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /color_scheme setting must apply/);
    });
});

test('section color scheme on frame passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<div class="section color-{{ section.settings.color_scheme }}">',
                '  <p>Content</p>',
                '</div>',
                '{% schema %}',
                '{"name":"t:x","settings":[{"type":"color_scheme","id":"color_scheme","label":"t:x"}]}',
                '{% endschema %}',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'section-color-scheme').length,
            0,
        );
    });
});

test('vendor notice missing fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/vendor-test.js', `export default null;\n`);
        writeFile(root, 'THIRD_PARTY_NOTICES.md', `# Notices\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Missing THIRD_PARTY_NOTICES.md entry/);
    });
});

test('vendor notice present passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/vendor-test.js', `export default null;\n`);
        writeFile(root, 'THIRD_PARTY_NOTICES.md', `# Notices\nassets/vendor-test.js\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'vendor-notices').length,
            0,
        );
    });
});

test('lint-allow without reason fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `{% # lint-allow settings-chain-liquid %}\n<p class="font-medium">X</p>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /lint-allow comments must include/);
    });
});

test('lint-allow with reason suppresses failure', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% # lint-allow settings-chain-liquid: documented fixture exception %}',
                '<p class="font-medium">X</p>',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('settings typography/color chain')).length,
            0,
        );
    });
});

test('embedded compat cli accepts --root without auto-running on import', () => {
    withTempTheme((root) => {
        writeFile(root, 'eslint.config.cjs', MATCHING_ESLINT_CONFIG);
        writeFile(root, 'stylelint.config.cjs', `module.exports = { rules: {} };`);
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.ok { color: #111111; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );

        const result = runScript(EMBEDDED_COMPAT_SCRIPT, root);
        const output = `${result.stdout}${result.stderr}`;

        assert.equal(result.status, 0, output);
        assert.match(output, /Embedded compatibility lint passed/);
    });
});

test('settings chain css typography rejects literal weight and rem size', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {\n    font-weight: bold;\n    font-size: 1rem;\n}\n`);
        const failures = await runThemeLint(root);
        const typography = failures.filter((failure) => failure.message.includes('Typography property'));
        assert.equal(typography.length, 2, failureMessages(failures));
    });
});

test('settings chain css typography accepts values relative to the inherited size', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            `.ok {\n    font-size: 0.875em;\n    font-weight: bolder;\n    font-size: calc(var(--font-heading-scale) * 6.5rem);\n}\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('lint-allow applies inside a stylesheet block by file line', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'snippets/fixture.liquid',
            [
                '<div class="fixture"></div>',
                '',
                '{% stylesheet %}',
                '    .fixture {',
                '        /* lint-allow settings-chain-css-typography: fixture zoom floor */',
                '        font-size: max(16px, 1em);',
                '    }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('stylesheet block literal without lint-allow fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'snippets/fixture.liquid',
            ['<div class="fixture"></div>', '{% stylesheet %}', '    .fixture { font-size: max(16px, 1em); }', '{% endstylesheet %}', ''].join(
                '\n',
            ),
        );
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Typography property "font-size"/);
    });
});

test('module data-module-id on a child does not satisfy the x-data root', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div x-data="accordion">\n    <span data-module-id="accordion"></span>\n</div>\n`,
        );
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /must declare data-module-id/);
    });
});

test('module data-module-id before x-data on the same root passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div\n    data-module-id="accordion"\n    class="{{ 'a' | append: 'b' }}"\n    x-data="accordion"\n></div>\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId?.startsWith('module-')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('layout without the scripts render fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'layout/theme.liquid', `<head></head>\n`);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(root, 'sections/fixture.liquid', `<div x-data="accordion" data-module-id="accordion"></div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /must render 'scripts'/);
    });
});

test('missing entry scripts snippet fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'layout/theme.liquid', `<head>\n{% render 'scripts' %}\n</head>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /snippets\/scripts\.liquid must exist and hold one parsable/);
    });
});

test('entry scripts snippet without a parsable import map fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(root, `{"imports":`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /snippets\/scripts\.liquid must exist and hold one parsable/);
    });
});

test('entry scripts in the snippet pass', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(root, 'sections/fixture.liquid', `<div x-data="accordion" data-module-id="accordion"></div>\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'module-import-map').length,
            0,
            failureMessages(failures),
        );
    });
});

test('import map entry mapped to another file fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(root, `{"imports":{"accordion":"{{ 'dropdown.js' | asset_url }}"}}`);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(root, 'assets/dropdown.js', `export const id = 'dropdown';\n`);
        writeFile(root, 'sections/fixture.liquid', `<div x-data="accordion" data-module-id="accordion"></div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /must map to assets\/accordion\.js/);
    });
});

test('import map entry pointing to a missing asset fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(root, `{"imports":{"utils":"{{ 'missing.js' | asset_url }}"}}`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /must map to an existing asset/);
    });
});

test('import map entry without a consumer fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(root, `{"imports":{"utils":"{{ 'utils.js' | asset_url }}"}}`);
        writeFile(root, 'assets/utils.js', `export const noop = () => {};\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Import map entry "utils" is unused/);
    });
});

test('configured import map entries may stay unreferenced and an unlisted entry still fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(
            root,
            `{"imports":{"carousel-swiper":"{{ 'carousel-swiper.js' | asset_url }}","motion-gsap":"{{ 'motion-gsap.js' | asset_url }}","orphan":"{{ 'orphan.js' | asset_url }}"}}`,
        );
        writeFile(root, 'assets/carousel-swiper.js', `export const id = 'carousel-swiper';\n`);
        writeFile(root, 'assets/motion-gsap.js', `export const id = 'motion-gsap';\n`);
        writeFile(root, 'assets/orphan.js', `export const id = 'orphan';\n`);
        const failures = await runThemeLint(root);
        const unused = failures.filter((failure) => failure.checkId === 'module-import-map-unused');
        assert.equal(unused.length, 1, failureMessages(failures));
        assert.match(unused[0].message, /"orphan"/);
    });
});

test('import map entry used by an asset import passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(root, `{"imports":{"utils":"{{ 'utils.js' | asset_url }}"}}`);
        writeFile(root, 'assets/utils.js', `export const noop = () => {};\n`);
        writeFile(root, 'assets/feature.js', `import { noop } from 'utils';\nnoop();\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'module-import-map-unused').length,
            0,
            failureMessages(failures),
        );
    });
});

test('title tier on div fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<div class="title-m">Title</div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /title-\* tiers belong on h1–h6/);
    });
});

test('title tier on h2 passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<h2 class="title-m">Title</h2>\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'typography-tier-heading').length,
            0,
        );
    });
});

test('copy tier on heading fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<h2 class="copy-m">Title</h2>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /copy-\* tiers belong on non-heading/);
    });
});

test('raw-colour markup opacity modifier fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="text-theme-text/80">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.ok(failures.some((failure) => failure.checkId === 'raw-colour'));
    });
});

test('raw-colour css literal fails and a role passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `{% stylesheet %}\n.bad { color: #fff; }\n.ok { color: var(--color-muted); }\n{% endstylesheet %}\n`);
        const failures = await runThemeLint(root);
        const raw = failures.filter((failure) => failure.checkId === 'raw-colour');
        assert.equal(raw.length, 1);
        assert.match(raw[0].message, /hex colour/);
    });
});

test('colour-role-sync requires the same per-scheme value', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/tailwind.input.css',
            '--color-muted: rgba(var(--color-foreground), var(--alpha-80));\n',
        );
        writeFile(
            root,
            'snippets/css-variables.liquid',
            '{% for scheme in settings.color_schemes %}\n--color-muted: rgba(var(--color-foreground), var(--alpha-50));\n{% endfor %}\n',
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((failure) => failure.checkId === 'colour-role-sync' && /differs/.test(failure.message)));
    });
});

test('colour-setting rejects a colour setting outside the scheme group', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            '{% schema %}\n{ "settings": [{ "type": "color", "id": "accent" }] }\n{% endschema %}\n',
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((failure) => failure.checkId === 'colour-setting' && /accent/.test(failure.message)));
    });
});

test('page-token-scope rejects a snippet reading page width', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'snippets/fixture.liquid', `{% stylesheet %}\n.box { padding: var(--page-width); }\n{% endstylesheet %}\n`);
        const failures = await runThemeLint(root);
        assert.ok(failures.some((failure) => failure.checkId === 'page-token-scope'));
    });
});

test('screen-height-literal rejects a viewport height literal', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `{% stylesheet %}\n.box { min-height: 100dvh; }\n{% endstylesheet %}\n`);
        const failures = await runThemeLint(root);
        assert.ok(failures.some((failure) => failure.checkId === 'screen-height-literal'));
    });
});

test('page-frame checks are switched off independently', () => {
    const { collectPageFrameLiquidFailures } = require('./lib/page-frame-lint');
    const text = `{% stylesheet %}\n.box { min-height: 100dvh; padding: var(--page-width); }\n{% endstylesheet %}\n`;
    const idsFor = (data) => {
        const failures = [];
        collectPageFrameLiquidFailures(text, 'sections/fixture.liquid', failures, new Map(), data);
        return failures.map((failure) => failure.checkId).sort();
    };

    assert.deepEqual(idsFor({ pageTokenRoots: ['sections/'], liquidRoots: [] }), ['page-token-scope']);
    assert.deepEqual(idsFor({ pageTokenRoots: [], liquidRoots: ['sections/'] }), ['screen-height-literal']);
    assert.deepEqual(idsFor({ pageTokenRoots: [], liquidRoots: [] }), []);
});

test('stylesheet media query rejects px and accepts a tokenized width', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            '{% stylesheet %}\n@media (min-width: 768px) { .a { color: var(--color-muted); } }\n{% endstylesheet %}\n',
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((failure) => failure.checkId === 'stylesheet-media-query'));
    });
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            '{% stylesheet %}\n@media (width >= 48rem) { .a { color: var(--color-muted); } }\n{% endstylesheet %}\n',
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'stylesheet-media-query').length,
            0,
        );
    });
});

test('stylesheet layer inside a stylesheet block fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', '{% stylesheet %}\n@layer utilities { .a { color: var(--color-muted); } }\n{% endstylesheet %}\n');
        const failures = await runThemeLint(root);
        assert.ok(failures.some((failure) => failure.checkId === 'stylesheet-layer'));
    });
});

test('unloaded font weight utility fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="font-medium">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.ok(failures.some((failure) => failure.checkId === 'unloaded-font-weight'));
    });
});

test('dead-setting unused section setting fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            '{% schema %}\n{ "settings": [{ "type": "text", "id": "unused_heading" }] }\n{% endschema %}\n',
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((failure) => failure.checkId === 'dead-setting' && /unused_heading/.test(failure.message)));
    });
});

test('dead-setting counts a quoted list read through settings[id]', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'config/settings_schema.json',
            '[{ "name": "Social", "settings": [{ "type": "text", "id": "social_facebook_link" }] }]\n',
        );
        writeFile(
            root,
            'sections/header.liquid',
            "{% assign ids = 'social_facebook_link' | split: ',' %}\n{% for id in ids %}\n{% assign url = settings[id] %}\n{{ url }}\n{% endfor %}\n",
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'dead-setting').length,
            0,
            failureMessages(failures),
        );
    });
});
