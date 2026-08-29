# forgeAB (Forge Agent Box)
## AI-Assisted Development Environment & Spec-Driven Development (SDD)
A coordinated agent system for developing software in a structured, traceable, and secure way. Adaptable to any programming language, powered by **OpenSpec (Fission-AI)**, and equipped with strict **Anti-CRAP** quality and security gates for reliable execution.

---

## Project Structure

```
openspec/                          ← OpenSpec Spec-Driven Development Framework
├── config.yaml                    ← Global context, tech stack rules & CRAP limits
├── specs/                         ← Living consolidated system specifications
│   └── project-rules.md           ← Master project directrices & architecture rules
└── changes/                       ← Active changes (proposals, delta specs, tasks)
    └── archive/                   ← Historical verified changes

diagrams/                          ← Architectural Mermaid diagrams (.mmd)
├── class-diagram.mmd
├── use-case.mmd
├── sequence.mmd
├── communication.mmd
├── activity.mmd
└── state.mmd

project-logs/                      ← Development state tracking (YAML)
├── current-dev.yaml               ← Active change & task status (managed by Leader)
├── story-dev.yaml                 ← Completed feature history
└── error-log.yaml                 ← Incident and error catalog

utilities/                         ← Core agent prompts, templates, and scripts
├── init.sh                        ← Initialization and security script
├── update.sh                      ← Upstream synchronization script
├── CLAUDE.md                      ← Entry instructions for Claude Code
├── .antigravity/context.md        ← Entry instructions for Antigravity
├── .opencode/instructions.md      ← Entry instructions for OpenCode
├── templates/                     ← Base templates (project-rules, openspec, state, diagrams)
│   └── project-rules/             ← Archetype presets (backend, frontend, cli, lib, event)
└── agents/                        ← Specialist agent prompts
    ├── leader.md                  ← Director agent (SDD lifecycle & orchestration)
    ├── specifier.md               ← Requirements, project rules bootstrap & delta specs
    ├── critic.md                  ← Adversarial, non-complacent judge on-demand
    ├── skill_creator.md           ← Custom agent skill & workspace tooling architect
    ├── planner.md                 ← Technical design, diagrams & tasks checklist
    ├── trapper.md                 ← Test design & anti-CRAP trap engineer
    ├── implementer.md             ← Production code writer (Test-First)
    └── tester.md                  ← Test executor, CVE auditor & CRAP gatekeeper
```

---

## OpenSpec Spec-Driven Development (SDD) Workflow

forgeAB incorporates the best practices of **[OpenSpec](https://github.com/Fission-AI/openspec)** to ensure high-velocity, deterministic AI development:

```
                   ┌────────────────────────────────────────────────────────┐
                   │             0. Bootstrap & Project Rules               │
                   │  Specifier: select archetype & define project-rules.md │
                   │  Skill Creator: generate custom skills & tool scripts  │
                   └──────────────────────────┬─────────────────────────────┘
                                              │
                                              ▼
                   ┌────────────────────────────────────────────────────────┐
                   │                 Specifier Agent                        │
                   │  1. Explore: clarify scope & non-goals                 │
                   │  2. Propose: proposal.md + specs/ (Delta Specs)        │
                   └──────────────────────────┬─────────────────────────────┘
                                              │
                        (Optional Critic) ◄───┼───► (Critic Review)
                                              │
                                              ▼
                   ┌────────────────────────────────────────────────────────┐
                   │                  Planner Agent                         │
                   │  3. Design: design.md + diagrams/*.mmd + tasks.md      │
                   │     (Strict adherence to project-rules.md)             │
                   └──────────────────────────┬─────────────────────────────┘
                                              │
                                              ▼
                   ┌────────────────────────────────────────────────────────┐
                   │                  Trapper Agent                         │
                   │  4. Trap: 100% scenario test coverage (Test-First)     │
                   └──────────────────────────┬─────────────────────────────┘
                                              │
                                              ▼
                   ┌────────────────────────────────────────────────────────┐
                   │                Implementer Agent                       │
                   │  5. Apply: tests-first -> code implementation          │
                   └──────────────────────────┬─────────────────────────────┘
                                              │
                                              ▼
                   ┌────────────────────────────────────────────────────────┐
                   │                  Tester Agent                          │
                   │  6. Verify: real execution + CVE scan + CRAP < 30      │
                   └──────┬──────────────────────────────────────────┬──────┘
                          │ (Pass)                                   │ (Fail)
                          ▼                                          ▼
       ┌────────────────────────────────────┐             ┌─────────────────────┐
       │           Leader Agent             │             │   Fast-Track Fix    │
       │  7. Sync: openspec/specs/          │             │         OR          │
       │  8. Archive: openspec/changes/     │             │ Structural Revision │
       │  9. Update: story-dev.yaml         │             └─────────────────────┘
       └────────────────────────────────────┘
```

---

## Core Capabilities (v1.4.0)

### 1. Project Rules & Archetypes (Phase 0)
When starting a project, forgeAB offers interactive preset directrices based on project archetypes:
* **Backend API / Microservice**: Hexagonal architecture, DTO validation, DB transaction boundaries, standard error payloads.
* **Frontend Web App**: Component hierarchy, state separation, 4 UI states (empty, loading, error, success), WCAG a11y.
* **CLI / Developer Tool**: POSIX arguments/flags, standard exit codes, pipe-friendly stdout/stderr, signal trapping.
* **Library / SDK**: Minimal dependencies, zero side-effects on import, strict typing, SemVer.
* **Microservice / Event-Driven**: Message schema contracts, idempotency, retry policies with backoff/jitter, DLQ, tracing.
* **Custom**: Define rules completely from scratch.

Master rules are saved in `openspec/specs/project-rules.md` and enforced by all agents.

### 2. Critic Agent (`critic.md`)
An uncompromising, adversarial review agent available **on-demand** with zero sycophancy:
* Scrutinizes proposals for hidden assumptions and scope creep.
* Audits architectural designs for bottlenecks, excessive coupling, and complexity ($CC > 10$).
* Exposes blind spots in test suites (false positives, missing boundaries).
* Emits structured verdicts: `[APROBADO CON CONDICIONES]`, `[OBJECIÓN SEVERA]`, `[RECHAZADO]`.

### 3. Skill Creator Agent (`skill_creator.md`)
An intelligent environment engineer that crafts project-specific tooling:
* Discovers the exact runtime, test runner, linters, and frameworks.
* Generates modular agent skills (`.agents/skills/<name>/SKILL.md` or `utilities/skills/<name>.md`).
* Writes helper scripts under `scripts/` (e.g. running test runners with CRAP score calculation).

---

## CRAP & Quality Gates (Anti-Risk Control)

forgeAB enforces the **CRAP (Change Risk Anti-Patterns)** metric to ensure code is maintainable and risk-free:

$$\text{CRAP}(m) = \text{CC}(m)^2 \times (1 - \text{Cov}(m)/100)^3 + \text{CC}(m)$$

* **Target CRAP Score:** $< 30$ on all public functions and components.
* **Cyclomatic Complexity (CC):** $\le 10$ per function (guard clauses, single responsibility).
* **Test Coverage:** $\ge 90\%$ branch & scenario coverage mapped directly to OpenSpec requirements.
* **Zero Leaks:** Automated scanning for API keys, tokens, and passwords in repositories and logs.
* **CVE Auditing:** Automated `npm audit` / `pip check` / `cargo audit` on all dependencies.

---

## Initialization & Setup (`init.sh`)

To initialize or verify the work environment, run from your project root:

```bash
bash utilities/init.sh
```

---

## Updating forgeAB (`update.sh`)

To pull the latest agent prompts, OpenSpec templates, and system files while preserving all your project state and specifications intact:

```bash
bash utilities/update.sh
```

---

## License
Copyright (c) 2026 MMRos. All rights reserved.
This software is proprietary. See the [LICENSE](./LICENSE) file for details on usage and distribution restrictions.
