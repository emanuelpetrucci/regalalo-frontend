---
name: bmad-sprint-orchestrate
description: >-
  Orquesta el siguiente paso BMad v7 con tickets.py y la iniciativa activa.
  Usar con "bmad next", "siguiente paso del sprint" o "continuar implementación BMad".
---

# Orquestar sprint BMad (v7)

## Cuándo usar

El usuario quiere el **siguiente paso automático** del trabajo en curso (tickets bajo `initiative-regalalo`), no replanificar PRD desde cero.

## Qué hacer

1. Invocá **bmad-sprint-orchestrator** (`.cursor/agents/bmad-sprint-orchestrator.md`).
2. Si no podés delegar, ejecutá:
   - `uv run _bmad/method/scripts/tickets.py --project-root . status initiative-regalalo`
   - `uv run _bmad/method/scripts/tickets.py --project-root . next initiative-regalalo`
   - Delegá **un** skill v7 (`bmad-build`, `bmad-code-review`, `bmad-agent-po`).
3. No implementes código de producto en este turno.

## Atajos

| Usuario dice | Acción |
| ------------ | ------ |
| `bmad next` | Orquestador v7 |
| `bmad next status` | Solo `tickets.py status` + resumen |
| `bmad status` | Skill `bmad` (hub) |
| Implementar ticket | `bmad-build` directo |
| Code review | `bmad-code-review` en chat nuevo |

## Estado canónico

- Iniciativa: `_bmad-output/initiative-regalalo/`
- **No** usar `sprint-status.yaml` (archivo histórico en `archive-v6/`).

## Detalle

Máquina de estados en [`.cursor/agents/bmad-sprint-orchestrator.md`](../../agents/bmad-sprint-orchestrator.md).
