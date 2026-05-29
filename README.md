# forgeAB (Forge Agent Box)
## AI-Assisted Development Environment
A coordinated agent system for developing software in a structured, traceable, and secure way. Adaptable to any programming language and equipped with environment validations for reliable execution.

---

## Project Structure

```
utilities/
├── init.sh                    ← initialization and security script
├── CLAUDE.md                  ← entry instructions for Claude Code
├── .antigravity/              ← entry instructions for Antigravity
├── .opencode/                 ← entry instructions for OpenCode
├── templates/                 ← base templates for state files and diagrams
└── agents/
    ├── leader.md              ← director agent prompt
    ├── specifier.md           ← specifier agent prompt
    ├── trapper.md             ← trap/test design agent prompt
    ├── implementer.md         ← implementer agent prompt
    ├── tester.md              ← tester agent prompt
    └── planner.md             ← architecture planner agent prompt

Generated at runtime by init.sh (in utilities/):
├── current-dev.yaml            ← active development state (managed by Leader)
├── story-dev.yaml              ← completed feature history
└── error-log.yaml              ← active error log
```

---

## Initialization & Security (`init.sh`)

To set up the work environment, the harness includes a robust initialization script that must be run from your project root:

```bash
bash utilities/init.sh
```

**During initialization, the script performs:**
1. **Environment review:** Validates the harness is not running at the OS root and checks project write permissions.
2. **Security checks:** Verifies the integrity of the required base structure (the `templates/` and `agents/` folders).
3. **Strict dependency management (pnpm):** The harness requires `pnpm` and explicitly prohibits `npm`. If `pnpm` is not installed, the script will guide you to download and install the official binary independently (via `curl` or `wget`), automatically configuring aliases.
4. **Template deployment:** Sets up YAML state files (`current-dev.yaml`, `story-dev.yaml`), creates the diagram structure and generates IDE-specific configurations.

---

## Architectural Diagrams (`diagrams/`)

The harness uses diagrams in Mermaid format (`.mmd`) to maintain a clear view of the system. These diagrams are generated and updated by the **Planner** agent:
- `class-diagram.mmd`: Class structure, entities and their relationships.
- `use-case.mmd`: Actor interactions with the system (use cases).
- `sequence.mmd`: Temporal message flow between components.
- `communication.mmd`: Structural message flow between objects.
- `activity.mmd`: Control or data flow step by step.
- `state.mmd`: State transitions of the main entities.

---

## Workflow

```
Main flow:
User → Specifier → Planner → Leader → [Trapper → Leader → Implementer → Tester] × N
                                        ↑                                  |
                                        └───────── (on failure) ───────────┘
                                        ↓
                                Specifier → user

User-reported error flow:
User → Leader (documents error) → Trapper (gathers info/test) → Leader → Specifier (adjusts specs) → Planner → ... (normal cycle)
```

### Feature states

```
Waiting → In Progress → Testing Pending → Completed
              ↑                              |
              └─── (if test fails) ──────────┘
```

---

## How to Use the Harness

### Option A — With a conversational AI model (Claude, GPT, etc.)

1. Open a new conversation.
2. Paste the contents of `agents/specifier.md` as the system prompt (or as the first message indicating the role).
3. Describe your project or feature to the agent.
4. The Specifier will guide you to clarify requirements.
5. When the Specifier hands off to the Leader, switch to the `agents/leader.md` prompt.
6. Continue the cycle according to the flow, switching prompts to the indicated agent.

### Option B — With an automated multi-agent system

Configure each agent with its corresponding prompt in your framework (LangGraph, AutoGen, CrewAI, etc.):

```python
# Conceptual example with any multi-agent framework
agents = {
    "leader":      load_prompt("agents/leader.md"),
    "specifier":   load_prompt("agents/specifier.md"),
    "trapper":     load_prompt("agents/trapper.md"),
    "implementer": load_prompt("agents/implementer.md"),
    "tester":      load_prompt("agents/tester.md"),
    "planner":     load_prompt("agents/planner.md"),
}

# Shared state is the YAML files
shared_state = {
    "current_dev": parse_yaml("current-dev.yaml"),
    "story_dev":   parse_yaml("story-dev.yaml"),
}
```

### Option C — Manual with any AI

For each feature, follow this order:
1. Give the Specifier prompt + describe the feature → get specs.
2. Give the Planner prompt + specs → get architecture and updated diagrams.
3. Give the Trapper prompt + specs → get test suite.
4. Give the Implementer prompt + specs + tests → get code.
5. Give the Tester prompt + code + tests → get results.
6. If everything passes: move the feature to `story-dev.yaml`.
7. If it fails: give the Specifier (or Leader) prompt + error data → adjust and repeat.

---

## Language Adaptation

The harness assumes no specific language. Each agent adapts its output to the language specified in `meta/language` of `current-dev.yaml`.

Examples of automatic adaptations:

| Concept           | Python           | JavaScript/TS     | Java/Kotlin         | Rust              |
|-------------------|------------------|-------------------|---------------------|-------------------|
| Error handling    | try/except       | try/catch         | try/catch           | Result<T, E>      |
| Logging           | logging.getLogger| console.error / winston | Logger (SLF4J) | log::error!       |
| Modules           | modules/packages | ES modules / CommonJS | packages/classes | crates/modules    |
| Constants         | SCREAMING_SNAKE  | SCREAMING_SNAKE   | static final        | const SCREAMING   |

---
## Knowledge Base

To keep agents aligned with your project's specific rules and restrictions (especially security and deprecated dependencies), you can leave Markdown notes inside `utilities/knowledge_base/`.
By default, the initialization script creates a `security-guidelines.md` file. The **Implementer** and **Tester** are required to read the contents of this folder before writing or evaluating code.

---

## Skills & Security Auditing

The harness forces the Tester to run ecosystem audit commands (e.g. `npm audit`, `cargo audit`) whenever it faces a security test.

Additionally, if you use a skill system (like Claude's), the Leader will indicate in each handoff which skills the sub-agent should review. Add your skills to the `utilities/skills/` folder and reference them in `current-dev.yaml`.
**The `cve-check` skill is included by default**, which the Trapper will automatically inject when there are third-party dependencies, instructing the Tester to search for vulnerabilities (CVEs) online.

```yaml
skills_required:
  - docx
  - pdf-reading
  - cve-check
```

---

## Design Principles

- **Minimal context per agent**: each sub-agent receives only what it needs for its task.
- **Traceability**: every change is recorded in the YAML files with timestamps.
- **Separation of concerns**: tasks, errors and solutions live in separate files.
- **Security by default**: every feature has security tests before being implemented.
- **Coherent modularity**: code is divided by logic, not by line limits.
- **User language**: all agents respond in the user's language.

---

## License
Copyright (c) 2026 MMRos. All rights reserved.
This software is proprietary. See the [LICENSE](./LICENSE) file for details on usage and distribution restrictions.
