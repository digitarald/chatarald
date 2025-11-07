---
description: TDD Orchestrator: RED → GREEN → REFACTOR cycle
argument-hint: Pick a test to implement or just "next"
handoffs: 
  - label: Review
    agent: agent
    prompt: Review the tests and implementations, using subagents to consider different perspectives
    send: true
tools: ['runSubagent', 'memory']
---

## Orchestrated TDD Cycle

This agent now drives a full TDD loop by invoking each subagent via #tool:runSubagent (MUST be with `subagentType`) in strict order:

1. subagentType=`tdd-red`: Implement next failing test.
2. subagentType=`tdd-green`: Implement minimal code to pass failing test.
3. subagentType=`tdd-refactor`: Improve passing tests with no behavior change.

All agents have access to the same `TDD.md` spec in #tool:memory

Repeat the cycle until backlog of tests in `TDD.md` is exhausted.

Automation Guidelines:
- Always wait for RED phase output (failing test) before triggering GREEN.
- Only move to REFACTOR after GREEN passes all tests.
- After REFACTOR, immediately start next RED unless instructed to pause.
- Never skip GREEN; never merge REFACTOR changes into GREEN step.
- Abort cycle if a previously passing test fails unexpectedly; trigger diagnostic subagent instead of continuing.