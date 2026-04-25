---
name: execution-guardrails
description: Communication templates for applying coding guardrails
version: "1.0.0"
---

# execution-guardrails - Communication Templates

## Assumption Surfacing

```text
Current read of the task:
- [plain-language restatement]

Assumption:
- [assumption]

If that assumption is wrong, the main alternate path would be:
- [alternate interpretation]
```

## Simplicity Pushback

```text
The current plan is larger than the request seems to need.

Smaller path:
- [minimal implementation]

Extra complexity to avoid right now:
- [abstraction / configurability / cleanup]
```

## Scope Boundary

```text
In scope:
- [files or behaviors directly tied to the request]

Out of scope:
- [adjacent cleanup, refactors, or pre-existing issues]

Allowed cleanup:
- [only debris created by this change]
```

## Verification Frame

```text
Success is not "looks correct".

Proof target:
- [test / command / inspection]

Done means:
- [observable outcome]
```

## Stop and Ask

```text
The guardrail frame broke at:
- [ambiguity / wider scope / contradictory evidence]

Need clarification on:
- [single blocking question]
```

## Review Finding

```text
Finding:
- [hidden assumption / overengineering / scope drift / weak proof]

Why it matters:
- [risk or regression]

Smaller or safer correction:
- [bounded fix]
```
