---
description: "Use when: working in this repository's forgeAB workflow, coordinating agents, or handling OpenSpec SDD state, handoffs, and implementation planning."
---
# forgeAB OpenSpec SDD Workflow Guidelines

- Start by reading `openspec/config.yaml`, `openspec/specs/project-rules.md`, active changes in `openspec/changes/`, and the current development state before making changes to project execution flow.
- Follow the repository's Leader-driven handoff model integrated with OpenSpec Spec-Driven Development (SDD):
  * **Specifier**: Bootstrap project rules (`project-rules.md`), author `proposal.md` and `specs/*.md` with Delta Specs (ADDED/MODIFIED/REMOVED) and concrete WHEN/THEN scenarios.
  * **Critic**: Adversarial, non-complacent judge on-demand to expose blind spots, hidden assumptions, architectural flaws, and rule violations.
  * **Skill Creator**: Tailor workspace tooling, custom agent skills (`.agents/skills/`), and automation scripts for the specific tech stack.
  * **Planner**: Author `design.md` and `tasks.md`, strictly enforcing `project-rules.md` and updating architectural Mermaid diagrams in `diagrams/`.
  * **Trapper**: Translate OpenSpec scenarios and project rules into executable test traps (Test-First), guaranteeing zero CRAP score risk ($CRAP < 30$).
  * **Implementer**: Implement production code following `design.md`, `tasks.md`, and `project-rules.md` strictly to satisfy tests.
  * **Tester**: Execute tests in terminal, audit CVE security, verify CRAP metrics, check adherence to `project-rules.md`, and validate before archival.
  * **Leader**: Coordinate lifecycle (`rules setup` -> `explore` -> `propose` -> `apply` -> `verify` -> `archive`) and synchronize delta specs into `openspec/specs/`.
- Do not bypass the planned agent roles unless the task is clearly a fast-track correction or a direct user request.
- Preserve minimal, relevant context when handing off work to another agent.
- Respect repository security, dependency restrictions, and zero unhandled exception policies.
