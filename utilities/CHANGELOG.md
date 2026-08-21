# Changelog - forgeAB

## [1.3.0] - 2026-08-21
### Added
- **OpenSpec (Fission-AI) Spec-Driven Development Integration**:
  - Modular artifact lifecycle: `proposal.md`, `specs/` (Delta Specs), `design.md`, `tasks.md`.
  - OpenSpec global project config (`openspec/config.yaml`) with contextual injection and per-artifact rules.
  - RFC 2119 requirement formulation and standardized `WHEN / THEN` scenario structure.
  - Spec synchronization (`openspec/specs/`) and archival (`openspec/changes/archive/`).
- **CRAP (Change Risk Anti-Patterns) Elimination & Quality Gates**:
  - Elimination of corrupt legacy XML/YAML hybrid state files and git conflict markers.
  - Strict CRAP metric validation ($CRAP < 30$, cyclomatic complexity $\le 10$, test coverage $\ge 90\%$) enforced by Trapper and Tester.
  - Refactored `init.sh` and `update.sh` for maximum safety, POSIX/Bash compatibility, and low complexity.
  - Unified IDE configurations for Antigravity, OpenCode, and Claude Code.

## [1.2.0] - 2026-05-20
### Added
- Definitive rename of the whole system to **forgeAB**.
- Compatible migration in `update.sh` for legacy structures (`harness` and `forgeab`).

## [1.1.0] - 2026-05-20
### Added
- System renamed from "AI Development Harness" to **AgentBox (Forge Agent Box)**.
- **Fast-Track** mechanism for rapid correction of minor errors.
- Structured support for **Security Audits** and Knowledge Base (`knowledge_base/`).
- `cve-check` skill automatically injected for third-party dependencies.
- Native state files in **YAML** instead of XML.

## [1.0.0] - Initial Release
- Base agent structure: Leader, Planner, Specifier, Implementer, Tester, Trapper.
- Development state files and architectural diagrams.
- Interactive multi-language support.
