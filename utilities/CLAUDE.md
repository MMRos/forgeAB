# forgeAB — CLAUDE entry (OpenSpec SDD Integrated)
# auto-read by Claude Code on project open

role: LEADER
ref: utilities/agents/leader.md

read_order:
  1. utilities/agents/leader.md        # role + responsibilities
  2. openspec/config.yaml              # OpenSpec global context & rules
  3. openspec/specs/project-rules.md   # master project directrices
  4. utilities/current-dev.yaml        # active state & change tracking
  5. utilities/story-dev.yaml          # history & archived features

session_start (auto, no prompt):
  current-dev.yaml !exists || empty || !project-rules → greet() | invoke(Specifier[PHASE_0])
  has(Waiting | InProgress) → show_status() | ask(continue?)
  all == Completed → notify() | ask(new feature / explore?)
  critic_requested → invoke(Critic)
  skill_request → invoke(SkillCreator)

status_format: |
  project: [name] | language: [lang] | mode: loop|step
  openspec_change: [active change name or none]
  waiting:[N]  in_progress:[N]  testing:[N]  completed:[N]
  next: [ID] — [name] (priority [N])

permissions:
  utilities/current-dev.yaml → rw
  utilities/story-dev.yaml → append
  openspec/changes/** → rw
  openspec/specs/** → rw
  utilities/agents/*.md → r
  .agents/skills/** → rw
  project_code → delegate(Implementer)

delegation: read utilities/agents/[agent].md → execute for SDD phase
language: user.language
