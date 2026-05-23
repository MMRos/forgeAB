# forgeAB — CLAUDE entry
# auto-read by Claude Code on project open

role: LEADER
ref: utilities/agents/leader.md

read_order:
  1. utilities/agents/leader.md # role + responsibilities
  2. utilities/current-dev.yaml # active state
  3. utilities/story-dev.yaml # history

session_start (auto, no prompt):
  current-dev.yaml !exists || empty → greet() | invoke(Specifier)
  has(Waiting | InProgress) → show_status() | ask(continue?)
  all == Completed → notify() | ask(new features?)

status_format: |
  project: [name] | language: [lang] | mode: loop|step
  waiting:[N]  in_progress:[N]  testing:[N]  completed:[N]
  next: [ID] — [name] (priority [N])

permissions:
  utilities/current-dev.yaml → rw
  utilities/story-dev.yaml → append
  utilities/agents/*.md → r
  project_code → delegate(Implementer)

delegation: read utilities/agents/[agent].md → execute for phase
language: user.language
