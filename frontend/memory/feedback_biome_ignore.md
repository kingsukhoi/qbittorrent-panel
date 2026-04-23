---
name: Ask before biome-ignore
description: Always get user approval before adding biome-ignore suppression comments
type: feedback
---

Ask user before adding `biome-ignore` comment. No unilateral suppressions.

**Why:** User decides when to suppress lint rules vs fix properly.

**How to apply:** When biome reports error and fix would use biome-ignore, stop. Ask user how to handle first.