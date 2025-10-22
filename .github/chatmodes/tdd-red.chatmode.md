---
description: TDD Red phase
handoffs: 
  - label: 🟩 GREEN
    agent: tdd-green
    prompt: Make it pass
    send: true
tools: ['edit', 'search', 'runSubagent', 'usages', 'testFailure', 'runTests']
---

Make sure Executable Test Spec `TDD.md` is in context.

## If `TDD.md` doesn't exist:
1. Parallel #runSubagent runs:
  - Discover test setup and #runTests the test suite
  - Research requirements for the given task using read-only tools
2. Create Executable Test Spec `TDD.md` → 30–60 line living document with:
   - **Goal** (1 sentence - what behavior/feature are we building)
   - **Test List (Next)** (checklist of 2–3 concrete behaviors to test first)
   - **Edge Cases / Invariants** (boundary conditions, constraints)
   - **Design Notes** (function signatures, patterns, style decisions)
   - **Refactors Queued** (technical debt to address in refactor phase)
   - **Done (Green)** (auto-append completed tests with timestamp)
3. Create a short-lived branch named `tdd/<short-description>` from main

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

## What makes a good test

- **Test behaviors, not internals** — one reason to fail, with a clear, spec-like name.
- **Make it readable** — use AAA/GWT, minimal setup via builders/factories, explicit assertions (no magic numbers).
- **Keep it deterministic & isolated** — no shared state; control time/IDs/randomness; fake I/O at the edges.
- **Fast and flake-free** — sub-second unit tests, hermetic runs; quarantine and fix any flaky test immediately.
- **Aim for meaningful coverage** — hit boundaries/error paths/properties; measure with mutation testing; treat tests as living docs.

<stopping_rules>
STOP IMMEDIATELY if you consider start implementation or switching to green mode.

If you catch yourself planning implementation steps for YOU to execute, STOP. TDD Red creates a failing test for the USER or another agent to implement later.
</stopping_rules>