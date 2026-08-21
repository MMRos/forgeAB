# Technical Design: [Change Name]

## 1. Architecture Overview
<!-- How this change fits into the overall system architecture -->
[PLANNER: Describe module decomposition, layers, and interactions.]

### Architectural References
- **Class Diagram:** `diagrams/class-diagram.mmd`
- **Sequence Diagram:** `diagrams/sequence.mmd`
- **Activity / Flow Diagram:** `diagrams/activity.mmd`
- **State Diagram:** `diagrams/state.mmd`

## 2. Component Design & Interfaces
<!-- Detailed design of classes, interfaces, schemas, and public functions -->

### Component / Module: [Module Name]
- **Responsibilities:** [PLANNER: What this module owns]
- **Dependencies:** [PLANNER: Internal/external packages]
- **Key Functions / Classes:**
  - `function_name(param: Type): ReturnType`
    - Purpose: [PLANNER]
    - Algorithm / Flow:
      1. [Step 1]
      2. [Step 2]
    - Error Handling: [Specific exceptions raised]

## 3. Technical Decisions & Trade-offs
- **Decision 1:** [PLANNER: Approach selected vs alternatives considered]
  - *Rationale:* [Why chosen]
  - *Trade-offs:* [Accepted downsides/complexities]

## 4. Complexity & CRAP Risk Management
- **Cyclomatic Complexity Limit:** Target $\le 10$ per function.
- **Coverage Target:** $\ge 90\%$ test coverage on all new logic.
- **CRAP Threshold:** Max CRAP score $< 30$ ($CRAP = CC^2 \times (1 - Cov)^3 + CC$).
- **Anti-Patterns to Avoid:** Monolithic functions, hidden side effects, unhandled promise rejections, broad catches.
