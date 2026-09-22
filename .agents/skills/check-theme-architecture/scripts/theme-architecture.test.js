const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const { runThemeLint, maskNonExecutableLiquid } = require('./lint-theme.js');
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

test('motion target hidden without runtime state attribute fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            `[data-motion-reveal] {\n    opacity: 0;\n}\n`,
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 1);
        assert.equal(failures[0].file, 'tailwind/fixture.css');
        assert.equal(failures[0].line, 1);
        assert.match(
            failureMessages(failures),
            /Motion targets must not be hidden without a runtime state attribute/,
        );
    });
});

test('motion target hidden with runtime state attribute passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            `[data-motion-reveal][data-motion-state='pending'] {\n    opacity: 0;\n}\n`,
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('motion activation violation reports the rule line', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            ['.safe { color: red; }', '', '[data-motion-reveal] {', '    opacity: 0;', '}', ''].join(
                '\n',
            ),
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 1);
        assert.equal(failures[0].line, 3);
    });
});

test('motion activation violation ignores selector text inside comments', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            [
                '/* [data-motion-reveal] { opacity: 0; } */',
                '',
                '[data-motion-reveal] {',
                '    opacity: 0;',
                '}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 1);
        assert.equal(failures[0].line, 3);
    });
});

test('motion activation reports distinct lines for duplicate selectors', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            [
                '.spacer { margin: 0; }',
                '',
                '[data-motion-reveal] {',
                '    opacity: 0;',
                '}',
                '',
                '.another { padding: 0; }',
                '',
                '[data-motion-reveal] {',
                '    visibility: hidden;',
                '}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 2);
        assert.equal(failures[0].file, 'tailwind/fixture.css');
        assert.deepEqual(
            failures.map((failure) => failure.line).sort((left, right) => left - right),
            [3, 9],
        );
    });
});

test('motion activation flags nested at-rule violations', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            [
                '@media (width >= 48rem) {',
                '    [data-motion-reveal] {',
                '        opacity: 0;',
                '    }',
                '}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 1);
        assert.equal(failures[0].file, 'tailwind/fixture.css');
        assert.equal(failures[0].line, 2);
    });
});

test('motion activation flags mixed visible and hidden declarations', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            [
                '[data-motion-reveal] {',
                '    opacity: 1 !important;',
                '    display: none;',
                '}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 1);
        assert.equal(failures[0].file, 'tailwind/fixture.css');
        assert.equal(failures[0].line, 1);
    });
});

test('motion activation ignores data-motion-enabled policy selectors', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            ['[data-motion-enabled] {', '    opacity: 0;', '}', ''].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('motion activation flags violations inside stylesheet blocks at source lines', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<section>',
                '{% stylesheet %}',
                '.safe { color: red; }',
                '',
                '[data-motion-reveal] {',
                '    opacity: 0;',
                '}',
                '{% endstylesheet %}',
                '</section>',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 1);
        assert.equal(failures[0].file, 'sections/fixture.liquid');
        assert.equal(failures[0].line, 5);
    });
});

test('motion activation flags violations in first-party asset css files', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'assets/fixture-motion.css',
            ['[data-motion-reveal] {', '    opacity: 0;', '}', ''].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 1);
        assert.equal(failures[0].file, 'assets/fixture-motion.css');
        assert.equal(failures[0].line, 1);
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
