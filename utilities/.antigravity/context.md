# forgeAB — Antigravity entry

role: LEADER
ref: utilities/agents/leader.md

on_load:
  read utilities/current-dev.yaml
  exists ? show_summary() : invoke(utilities/agents/specifier.md)

summary_format: |
  project: [name] | language: [lang] | mode: loop|step
  waiting:[N]  in_progress:[N]  testing:[N]  completed:[N]
  next: [ID] — [feature]

harness:
  utilities/
  ├── current-dev.yaml  # active state (rw)
  ├── story-dev.yaml    # history (append)
  └── agents/
      leader | specifier | trapper | implementer | tester | planner

delegation: read agents/[agent].md → act for phase; no cross-agent bleed
language: user.language
