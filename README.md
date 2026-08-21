# forgeAB (Forge Agent Box)
## AI-Assisted Development Environment & Spec-Driven Development (SDD)
A coordinated agent system for developing software in a structured, traceable, and secure way. Adaptable to any programming language, powered by **OpenSpec (Fission-AI)**, and equipped with strict **Anti-CRAP** quality and security gates for reliable execution.

---

## Project Structure

```
openspec/                          ← OpenSpec Spec-Driven Development Framework
├── config.yaml                    ← Global context, tech stack rules & CRAP limits
├── specs/                         ← Living consolidated system specifications
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
├── templates/                     ← Base templates (openspec, state, diagrams)
└── agents/                        ← Specialist agent prompts
    ├── leader.md                  ← Director agent (SDD lifecycle & orchestration)
    ├── specifier.md               ← Requirements & OpenSpec proposals/delta specs
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
                  │                 Specifier Agent                        │
                  │  1. Explore: clarify scope & non-goals                 │
                  │  2. Propose: proposal.md + specs/ (Delta Specs)        │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │                  Planner Agent                         │
                  │  3. Design: design.md + diagrams/*.mmd + tasks.md      │
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

### Delta Specs & Scenario Standard

All requirements are written using RFC 2119 keywords with verifiable `WHEN / THEN` scenarios:

```markdown
## ADDED Requirements

### Requirement: User Authentication
The system SHALL authenticate users using verified JWT credentials.

#### Scenario: Valid credential authentication
- **WHEN** user submits valid username and password
- **THEN** system responds with 200 OK and valid JWT token

#### Scenario: Invalid credential rejection
- **WHEN** user submits incorrect password
- **THEN** system responds with 401 Unauthorized and logs warning
```

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

**During initialization, the script:**
1. Validates the execution environment and write permissions.
2. Initializes `openspec/` with `config.yaml`, living specs, and change structures.
3. Generates YAML state files (`current-dev.yaml`, `story-dev.yaml`, `error-log.yaml`).
4. Deploys architectural Mermaid diagrams in `diagrams/`.
5. Configures IDE entries for Antigravity, OpenCode, and Claude Code.

---

## Updating forgeAB (`update.sh`)

To pull the latest agent prompts, OpenSpec templates, and system files while preserving all your project state and specifications intact:

```bash
bash utilities/update.sh
```

---

## How to Use forgeAB

### Option A — In Antigravity / Claude Code / OpenCode IDEs
1. Open the project root in your IDE.
2. The **Leader** agent automatically reads `openspec/config.yaml` and `current-dev.yaml`.
3. Provide your idea or task to begin the `explore` and `propose` flow with the **Specifier**.

### Option B — Manual / Conversational Prompts
1. Give the **Specifier** prompt (`utilities/agents/specifier.md`) + describe the feature $\rightarrow$ generates `proposal.md` and `specs/`.
2. Give the **Planner** prompt (`utilities/agents/planner.md`) $\rightarrow$ generates `design.md`, `tasks.md`, and updates `diagrams/`.
3. Give the **Trapper** prompt (`utilities/agents/trapper.md`) $\rightarrow$ generates runnable tests matching all OpenSpec scenarios.
4. Give the **Implementer** prompt (`utilities/agents/implementer.md`) $\rightarrow$ executes Test-First code implementation.
5. Give the **Tester** prompt (`utilities/agents/tester.md`) $\rightarrow$ executes tests in terminal, verifies CVE & CRAP metrics.
6. If tests pass: **Leader** moves change to archive and syncs `openspec/specs/`.

---

## License
Copyright (c) 2026 MMRos. All rights reserved.
This software is proprietary. See the [LICENSE](./LICENSE) file for details on usage and distribution restrictions.
