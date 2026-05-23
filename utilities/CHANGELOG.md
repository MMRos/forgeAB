# Changelog - forgeAB

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
- Native state files in **YAML** instead of XML for improved robustness when passing context between LLM agents.
- Backward compatibility in `update.sh` to migrate and convert `.xml` files from versions 1.0.x to `.yaml`.

## [1.0.0] - Initial Release
- Base agent structure: Leader, Planner, Specifier, Implementer, Tester, Trapper.
- Development state files in XML format.
- Interactive multi-language support.
