# bmad-next

Ejecuta el siguiente paso del ciclo **BMad v7** según el árbol de tickets.

1. Leé `_bmad/custom/config.user.toml` → `active_initiative` (debe ser `initiative-regalalo`).
2. Ejecutá:
   - `uv run _bmad/method/scripts/tickets.py --project-root . status initiative-regalalo`
   - `uv run _bmad/method/scripts/tickets.py --project-root . next initiative-regalalo`
3. Invocá el agente **bmad-sprint-orchestrator** (`.cursor/agents/bmad-sprint-orchestrator.md`) y delegá **un** skill v7.

No uses `_bmad-output/implementation-artifacts/sprint-status.yaml` (v6 archivado).
