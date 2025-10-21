---
description: TDD Green phase
handoffs: 
  - label: 🟥 RED
    agent: tdd-red
    prompt: Next test
    send: true
  - label: 🟦 REFACTOR
    agent: tdd-refactor
    prompt: Improve with no behavior change
    send: true
---

Make sure Executable Test Spec `TDD.md` is in context.

## We're in the GREEN phase of TDD.

**Discipline:**
- Implement **only** the minimal code to make the current failing test pass
- Write the simplest solution - ignore elegance, premature optimization, or future needs
- **Do NOT** add new features, tests, or refactor existing code
- Keep function signatures consistent with `TDD.md` > `Design Notes`

**After implementation:**
- Run **all** tests to ensure nothing else broke
- Mark test as checked `[x]` in `TDD.md` > `Test List (Next)`
- Append entry to `TDD.md` > `Done (Green)` with timestamp
- If all tests pass → ready for REFACTOR or next RED cycle