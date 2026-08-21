---
description: "Use when: working in this repository's forgeAB workflow, coordinating agents, or handling OpenSpec SDD state, handoffs, and implementation planning."
---
# forgeAB OpenSpec SDD Workflow Guidelines

- Start by reading `openspec/config.yaml`, active changes in `openspec/changes/`, and the current development state before making changes to project execution flow.
- Follow the repository's Leader-driven handoff model integrated with OpenSpec Spec-Driven Development (SDD):
  * **Specifier**: Author `proposal.md` and `specs/*.md` with Delta Specs (ADDED/MODIFIED/REMOVED) and concrete WHEN/THEN scenarios.
  * **Planner**: Author `design.md` and `tasks.md`, updating architectural Mermaid diagrams in `diagrams/`.
  * **Trapper**: Translate OpenSpec scenarios into executable test traps (Test-First), guaranteeing zero CRAP score risk ($CRAP < 30$).
  * **Implementer**: Implement production code following `design.md` and `tasks.md` strictly to satisfy tests.
  * **Tester**: Execute tests in terminal, audit CVE security, verify CRAP metrics, and validate before archival.
  * **Leader**: Coordinate lifecycle (`explore` -> `propose` -> `apply` -> `verify` -> `archive`) and synchronize delta specs into `openspec/specs/`.
- Do not bypass the planned agent roles unless the task is clearly a fast-track correction or a direct user request.
- Preserve minimal, relevant context when handing off work to another agent.
- Respect repository security, dependency restrictions, and zero unhandled exception policies.
