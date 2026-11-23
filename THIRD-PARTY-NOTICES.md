# Avisos de terceros

El código propio de Regálalo se publica bajo la GNU Affero General
Public License versión 3 o posterior (AGPL-3.0-or-later). Véanse
LICENSE y NOTICE.

Este repositorio incluye además copias de material de terceros
(skills y el método BMAD) que Emanuel ha decidido mantener en el
árbol público. Ese material **no** se reliquencia bajo la AGPL: se
rige por su propia licencia. La MIT exige conservar el aviso de
copyright y el texto de permiso en las copias; este fichero cumple
esa condición. Las marcas de esos proyectos tampoco quedan cubiertas
por sus licencias de código ni por la AGPL de Regálalo.

La enumeración de directorios se basa en la auditoría de solo
lectura del 23 de noviembre de 2026 (HEAD de `develop` de los repos
privados actuales e historial accesible). Si en el commit inicial
algún directorio no estuviera, la sección correspondiente no aplica.

Las comprobaciones de licencia se han hecho sobre las fuentes
oficiales públicas el 23 de noviembre de 2026, no sobre una nueva
lectura de los repos privados.

## Alcance observado en regalalo-frontend

En la auditoría del 23-11-2026 aparecían, entre otros:

- `_bmad/` y, junto a ella, `_bmad-output/` (esta última es sobre todo
  artefacto propio del proyecto: tickets y planes; no es el método
  BMAD en sí, aunque puede citarlo).
- `.agents/skills/` y `.claude/skills/`, con copias de skills de BMAD
  y la skill `angular-developer` de Google (mención «Copyright 2026
  Google LLC» en el `SKILL.md`).
- `.cursor/` (reglas, comandos y, en su caso, skills de apoyo).

No se constató en este repositorio, en aquella pasada, una copia de
las skills oficiales de Supabase. Si aparecieran en el árbol final,
se les aplica la sección «Skills de Supabase» de más abajo.

## BMAD Method

- Origen oficial: [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD).
- Licencia: MIT (identificador SPDX: MIT).
- Copyright: Copyright (c) 2025 BMad Code, LLC, según el fichero
  [LICENSE](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/LICENSE)
  del repositorio oficial, consultado el 23 de noviembre de 2026.
- Ubicación habitual en este repo: `_bmad/`, `.agents/skills/`
  (skills `bmad-*` y afines) y las copias en `.claude/skills/`.
- Marca: «BMad», «BMad Method» y «BMad Core» son marcas de BMad
  Code, LLC y **no** se licencian bajo la MIT. Véase
  [TRADEMARK.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/TRADEMARK.md)
  del proyecto oficial. Mantener estas carpetas no autoriza a usar
  esas marcas como identidad de Regálalo.

Se reproduce a continuación el texto oficial de la licencia, sin
modificar, como exige la MIT:

```
MIT License

Copyright (c) 2025 BMad Code, LLC

This project incorporates contributions from the open source community.
See [CONTRIBUTORS.md](CONTRIBUTORS.md) for contributor attribution.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

TRADEMARK NOTICE:
BMad™, BMad Method™, and BMad Core™ are trademarks of BMad Code, LLC, covering all
casings and variations (including BMAD, bmad, BMadMethod, BMAD-METHOD, etc.). The use of
these trademarks in this software does not grant any rights to use the trademarks
for any other purpose. See [TRADEMARK.md](TRADEMARK.md) for detailed guidelines.
```

## Skills de Google (angular-developer)

- Origen oficial: [angular/skills](https://github.com/angular/skills),
  skill `angular-developer`.
- Lo confirmado el 23 de noviembre de 2026:
  - El `SKILL.md` oficial declara en su frontmatter `license: MIT` y
    `author: Copyright 2026 Google LLC`
    (<https://github.com/angular/skills/blob/HEAD/angular-developer/SKILL.md>).
  - El repositorio `angular/skills` **no** incluye un fichero
    `LICENSE` en la raíz (la petición a
    `https://raw.githubusercontent.com/angular/skills/main/LICENSE`
    devolvió 404; la API de GitHub devuelve `"license": null`).
  - La licencia documentada del proyecto Angular en
    <https://angular.dev/license> es la MIT, con el aviso
    «Copyright (c) 2010-2026 Google LLC».
- Ubicación habitual en este repo: `.agents/skills/angular-developer/`
  y la copia en `.claude/skills/`.
- **No confirmado:** que la copia incluida en este repositorio sea
  idéntica, palabra por palabra, a la versión actual del origen (las
  skills se importaron en 2026 y el origen sigue actualizándose). Si
  hay otras skills de Google además de `angular-developer`, hay que
  añadirlas aquí con el mismo criterio.

Se reproduce el texto MIT publicado en angular.dev/license, que es la
fuente oficial de la licencia de Angular. No es un fichero LICENSE
del repo `angular/skills`, porque ese fichero no existe:

```
The MIT License

Copyright (c) 2010-2026 Google LLC. https://angular.dev/license

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## Skills de Supabase

- Origen oficial: [supabase/agent-skills](https://github.com/supabase/agent-skills).
- Licencia: MIT (identificador SPDX: MIT).
- Copyright: Copyright (c) 2026 Supabase, según el fichero
  [LICENSE](https://github.com/supabase/agent-skills/blob/main/LICENSE)
  del repositorio oficial, consultado el 23 de noviembre de 2026.
- El `SKILL.md` de `supabase-postgres-best-practices` declara también
  `license: MIT`.
- Ubicación habitual, cuando está presente: `.agents/skills/supabase/`,
  `.agents/skills/supabase-postgres-best-practices/` y las copias en
  `.claude/skills/`.

Texto oficial, sin modificar:

```
MIT License

Copyright (c) 2026 Supabase

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Otro material en `.cursor/` y `.claude/`

- `.claude/settings.local.json` **no se publica** (está en el
  `.gitignore`): es configuración local con una ruta personal, no
  una skill.
- El resto de `.cursor/` (por ejemplo `.cursor/mcp.json` o reglas)
  es, en lo esencial, configuración del proyecto, no un paquete de
  terceros con licencia propia que hayamos podido identificar. Si
  en esas carpetas hay más skills copiadas de un origen con
  licencia, hay que añadirlas a este fichero antes de publicar.
- **No confirmado:** la licencia de cualquier skill o recurso que no
  esté listado arriba. Antes del commit inicial conviene revisar el
  árbol de `.agents/skills/` y `.claude/skills/` y completar este
  fichero si aparece algún origen nuevo.

## Cómo actualizar este fichero

Cuando se actualice una skill o se añada otra, hay que:

1. Anotar origen, copyright, SPDX y fecha de consulta.
2. Reproducir el aviso de licencia si la licencia lo exige (como la MIT).
3. Marcar expresamente lo que no se haya podido confirmar.
