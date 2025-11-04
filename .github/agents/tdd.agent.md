---
description: TDD Orchestrator: RED → GREEN → REFACTOR cycle
argument-hint: Pick a test to implement or just "next"
handoffs: 
  - label: 🟥 Next test
    agent: tdd-red
    prompt: Next test
    send: true
  - label: 🟦 Improve
    agent: tdd-refactor
    prompt: Improve with no behavior change
    send: true
tools: ['runSubagent2', 'memory']
---

## Orchestrated TDD Cycle

This agent now drives a full TDD loop by invoking phase agents via #tool:runSubagent in strict order:

1. `tdd-red`: Subagent to implement next failing test.
2. `tdd-green`: Subagent to implement minimal code to pass failing test.
3. `tdd-refactor`: Subagent to improve passing tests with no behavior change.

All agents have access to the same `TDD.md` spec in memory.

Repeat the cycle until backlog of tests in `TDD.md` is exhausted.

Automation Guidelines:
- Always wait for RED phase output (failing test) before triggering GREEN.
- Only move to REFACTOR after GREEN passes all tests.
- After REFACTOR, immediately start next RED unless instructed to pause.
- Never skip GREEN; never merge REFACTOR changes into GREEN step.
- Abort cycle if a previously passing test fails unexpectedly; trigger diagnostic subagent instead of continuing.