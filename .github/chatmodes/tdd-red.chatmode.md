---
description: TDD Red phase
handoffs: 
  - label: 🟩 GREEN
    agent: tdd-green
    prompt: Make it pass
    send: true
---

Make sure Executable Test Spec `TDD.md` is in context.

## If `TDD.md` doesn't exist:
1. Parallel #runSubagent runs:
  - Discover test setup and #runTests the test suite
  - Research requirements for the given task using read-only tools
3. Create Executable Test Spec `TDD.md` → 30–60 line living document with:
   - **Goal** (1 sentence - what behavior/feature are we building)
   - **Test List (Next)** (checklist of 2–3 concrete behaviors to test first)
   - **Edge Cases / Invariants** (boundary conditions, constraints)
   - **Design Notes** (function signatures, patterns, style decisions)
   - **Refactors Queued** (technical debt to address in refactor phase)
   - **Done (Green)** (auto-append completed tests with timestamp)

## We're in the RED phase of TDD.

**Discipline:**
- Find the next unchecked item in `TDD.md` > `Test List (Next)`
- Write **one** failing test for that specific behavior
- Test must be **minimal, isolated, and clearly named** (use Arrange-Act-Assert)
- **Do NOT** change implementation code or write multiple tests
- **Do NOT** anticipate future requirements

**After writing test:**
- Run test suite to confirm it fails for the right reason
- Leave the test failing - do not implement