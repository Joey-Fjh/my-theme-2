---
name: check-i18n
description: Validate Shopify theme internationalization and locale keys. Use when user-facing text, locales, or schema labels change.
when_to_use: >
  Locale JSON files, translated Liquid strings, schema translation keys, duplicate keys,
  hardcoded copy, ARIA labels, alt text, placeholders, or npm.cmd run lint:i18n.
---

# Check I18n

Use this skill for project-level i18n validation. Read `docs/references/code-review/i18n-checklist.md` for locale ownership and review boundaries.

## When To Run

Run after changes to:

- `locales/**/*.json`
- Liquid visible text or accessible attributes (`aria-label`, `alt`, `placeholder`, `title`)
- Section, Theme Block, or theme settings schema copy
- Preset names or categories

Skip this skill for merchant-owned content, product data, or runtime variables. Do not rewrite theme files just to satisfy the linter.

## Commands

- Fast i18n lint: `npm.cmd run lint:i18n`
- Focused automated checks: `npm.cmd run test:i18n`
- Aggregate gate that includes i18n lint: `npm.cmd run lint`

Shopify Theme Check remains the platform authority. This validator supplements Theme Check with duplicate keys, missing project locale keys, hardcoded user-visible copy, and schema/preset boundary checks.

## Classification

- Theme code: Liquid `| t`, schema `t:` keys, locale JSON owned by the theme
- Merchant content: preset instance values, resource titles, uploaded copy, store data
- Machine values: enum handles, numbers, URLs, color schemes, icon IDs, font identifiers, metafield paths

Preset `settings` and `presets[].blocks[].settings` are merchant instance data. Section schema `default.settings` and `default.blocks[].settings` follow the same rule. They must stay literal and must not use `t:`.

## Reporting

Report missing keys, duplicate keys, hardcoded text, and preset/default instance `t:` misuse with file and line. State whether failures are new, touched, or pre-existing when that is clear.
