# Review Record

## Review Scope
- `active_feature`: deploy-auth-fix
- `current_slice`: slice-1
- `route`: feature
- `work_intent`: repair
- `risk`: high

### Scope Tags
- boundary
- deployment-sensitive

## Evidence Read
- Execution evidence: .beer-run/reviews/deploy-auth-fix.execution.md
- Context artifact: .beer-run/context/deploy-auth-fix.md
- Plan artifact: .beer-run/plans/deploy-auth-fix.md
- Specialist artifact: .beer-run/reviews/deploy-auth-fix.specialists.json

## Specialist Lanes
- beer-test-reviewer: PASS (required)
- beer-security-reviewer: FAIL (required)
- beer-deployment-reviewer: WARNINGS (required)

## Specialist Quality Gate
- missing required lanes: none
- failed lanes: beer-security-reviewer
- non-passing required lanes: beer-security-reviewer:FAIL, beer-deployment-reviewer:WARNINGS

## Review Lenses
- Layer pattern:
- Handler flow:
- Folder/file placement:
- Backend/frontend/boundary seams:
- Code quantity and pattern spread:

## Finding Summary
- P1: 1
- P2: 0
- P3: 0

## Findings
1. P1: Auth rollback path is missing

## Outcome
- `review_status`: `blocked`
- `next_handoff`: validating

## Required Follow-up
- [ ]
- [ ]
