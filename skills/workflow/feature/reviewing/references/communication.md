---
skill: reviewing
purpose: Reporting standards for findings and review outcomes
version: "1.0"
---

# reviewing Communication

## Findings First

Always present findings before overview or praise.

Good:

```text
P1 - auth token refresh can fail silently when the cookie is missing. This leaves users in a broken session loop. Scenario: a user resumes a stale tab and every protected request redirects until refresh succeeds manually. Fix direction: guard the missing-cookie path and fall back to an explicit re-auth response.
```

Bad:

```text
Looks mostly good overall. One thing to keep an eye on is auth refresh.
```

## Review Outcome Template

```text
Review route: <feature-final | direct-completion | manual-review>
Task scope: <backend | frontend | boundary | mixed>
Outcome: <pass | repair-needed | review-only>
Blocking findings: <count>
Next owner: <beer:compounding | beer:executing | none>
```

If Outcome is `pass` and Beer closeout should continue, Gate 4 approval must be reflected in `.beer/state.json` with `approved_gates.review = true`.
If Outcome is `review-only`, do not set `approved_gates.review = true`.

## Repair Handoff Template

```text
Review found blocking issue(s). Keep the current scope anchored to: <goal or root cause>. Next owner: beer:<executing or earlier skill>.
```

Use `beer:planning` or `beer:validating` as the next owner when the problem is
slice shape, route fit, or review-unit size rather than a local implementation defect.
