---
name: bmad-create-epic-stories
description: >-
  Legacy v6 — en v7 usar bmad-agent-po o editar tickets.toml. Ver comando
  /bmad-create-epic.
---

# Crear stories de una épica (v7)

En **BMad v7** no hay batch `bmad-create-story`.

1. Leé `initiative-regalalo/archive-v6/epics.md` para la épica.
2. Añadí `[[entry]]` en `initiative-regalalo/tickets/epic-<slug>/tickets/tickets.toml`, o usá **`bmad-agent-po`**.
3. Implementá con **`bmad-build`** (`tickets.py pull` si aplica).

Ver [`.cursor/commands/bmad-create-epic.md`](../../commands/bmad-create-epic.md).
