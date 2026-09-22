# Internationalization Checklist

Read when: changing locale JSON, translated Liquid strings, schema labels, preset copy, or hardcoded user-visible text.

Shopify-specific locale ownership boundaries. `AGENTS.md` remains authoritative.

## Locale Boundaries

| Content | Source | Usage |
| --- | --- | --- |
| Storefront text, form copy, status messages, and accessible names | `locales/en.default.json` | Liquid `\| t` |
| Supported Theme Editor schema copy | `locales/en.default.schema.json` | Schema `t:` reference |
| Merchant content and preset/default instance values | Schema defaults or preset/default values | Literal value only when needed |

Merchant content, resource titles, product data, and other store-owned values stay as data, not locale keys.

## Schema-Localizable Fields

Use `t:` only in schema fields Shopify resolves through schema locale files:

- section and block names
- setting labels, help text, placeholders, and supported informational content
- option labels
- preset names and categories
- supported user-visible text defaults

Keep configuration tokens literal: enum values, booleans, numbers, URLs, link list handles, resource handles, metafield paths, font identifiers, and other machine-consumed defaults. The setting `type` determines whether a `default` is translatable storefront copy or a config value. For text-class setting types such as `text`, `textarea`, and `richtext`, a lowercase or snake_case default is still user-visible copy and must use `t:`. For `url` settings, relative paths such as `/collections` and absolute URLs are config values. For other non-text settings such as `link_list`, `select`, and `font_picker`, defaults are config values and schema validity stays with Shopify Theme Check.

Context matters. Only inspect Shopify-supported schema-locale fields inside schema definitions (`settings[]`, block definitions, preset `name`/`category`). Do not treat preset or section `default` instance values as schema-locale fields just because the setting id is `content`, `name`, or `label`.

## Preset And Default Instance Values

`presets[].settings`, `presets[].blocks[].settings`, `default.settings`, and `default.blocks[].settings` pre-populate real section and block values. They are not schema-locale fields, so a `t:` string there is rendered or stored as the literal key.

- Never use `t:` inside preset or section default instance setting values.
- Omit a preset or default setting when its intended value is already the setting's schema default.
- Omit a preset or default block's `settings` object when the block needs no real override.
- Put translatable editor labels in schema-localizable fields, not in preset or default instance data.

## Validation

For locale or i18n changes during development, run `npm.cmd run lint:i18n`. For focused regression checks on the project validator itself, run `npm.cmd run test:i18n`.

The project validator detects user-visible static text with Unicode letters, not English-only copy. It still ignores Liquid expressions, URLs, machine tokens in schema defaults, and merchant/runtime data. Uppercase storefront copy such as `SALE` or `OK` is not globally exempt.

Reserve `npm.cmd run lint` and `npm.cmd test` for explicit user request or before opening a PR, version/release, or Theme Store submission. Inspect `locales/en.default.json` and `locales/en.default.schema.json` directly for the current key set.
