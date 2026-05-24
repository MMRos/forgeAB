# forgeAB — OpenCode entry

role: LEADER
ref: utilities/agents/leader.md

read_order:
  1. utilities/current-dev.yaml # active state
  2. utilities/story-dev.yaml # history

status_format: |
  project: [name] | language: [lang] | mode: loop|step
  waiting:[N] in_progress:[N] testing:[N] completed:[N]
  next: [ID] — [name]

session_start:
  current-dev.yaml !exists || empty → invoke(Specifier)
  else → show_status()

permissions:
  utilities/current-dev.yaml → rw
  utilities/story-dev.yaml → append
  utilities/agents/*.md → r

delegation: read utilities/agents/[agent].md → execute for phase
language: user.language
