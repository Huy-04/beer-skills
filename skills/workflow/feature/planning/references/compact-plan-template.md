# Compact Plan: <Feature Name>

**Date**: <YYYY-MM-DD>
**Feature**: <feature-slug>
**Route**: `small-fix` | `feature`
**Work intent**: `repair` | `delivery` | `investigation`
**Risk/Orchestration/Run style**: `normal|high` / `single-worker|multi-worker` / `guided|go`

Use this template only when one compact artifact can honestly cover scope,
pattern, verification, and the direct execution target.

## 1. Current Reality

- current behavior or state: `<summary>`
- directly implicated files: `<paths>`
- relevant prior learning: `<file or none>`

## 2. Chosen Implementation Pattern

- pattern to follow: `<pattern or local convention>`
- evidence files: `<paths planning inspected>`
- why this pattern fits: `<short reason>`
- executing must verify before coding: `<exact signatures, DTOs, commands, event shapes, or other source facts>`

## 3. Scope

### In Scope

- `<specific change>`

### Out Of Scope

- `<explicit non-goal>`

## 4. Route Check

- why this remains compact: `<reason>`
- direct `beer:executing` remains credible: `<yes/no and why>`
- small-fix `single-worker` constraint still holds: `<yes/no/n/a>`
- if no: stop and return to `beer:exploring` or feature planning

## 5. Verification Path

- focused command or check: `<command>`
- nearby regression scope: `<command or path>`
- expected evidence file: `<history/<feature>/execution-evidence.md>`
- limitation: `<known gap or none>`

## 6. Handoff

Planning is complete at compact depth.
Invoke `beer:validating`.
