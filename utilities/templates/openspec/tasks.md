# Implementation Tasks: [Change Name]

<!--
  Strict implementation checklist.
  Tasks follow Test-First methodology (Trapper -> Implementer -> Tester -> Sync/Archive).
-->

## 1. Test Preparation & Traps (Trapper)
- [ ] 1.1 Scaffold test suite for nominal and boundary scenarios (Unit / Functional)
- [ ] 1.2 Scaffold security test cases (injection, auth, data leak, DoS)
- [ ] 1.3 Scaffold integration tests for external dependencies / APIs

## 2. Core Implementation (Implementer)
- [ ] 2.1 Implement core components following `design.md` and module flow
- [ ] 2.2 Implement explicit error handling, structured logging, and boundary guards
- [ ] 2.3 Verify all tests pass locally and maintain clean modularization

## 3. Quality, Security & Verification (Tester)
- [ ] 3.1 Execute complete test suite via terminal tools (100% Pass required)
- [ ] 3.2 Run ecosystem security & CVE audit (`npm audit`, `pip check`, `cargo audit`)
- [ ] 3.3 Verify CRAP index and cyclomatic complexity thresholds ($CRAP < 30$)

## 4. Archival & Spec Synchronization (Leader)
- [ ] 4.1 Synchronize delta specs from `specs/` into living `openspec/specs/`
- [ ] 4.2 Move completed change to `openspec/changes/archive/YYYY-MM-DD-[change-name]/`
- [ ] 4.3 Update `story-dev.yaml` with completed change record
