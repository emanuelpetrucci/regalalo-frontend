# Cómo contribuir a regalalo-frontend

Gracias por tu interés en Regálalo. Este documento explica cómo
proponer cambios en la interfaz pública. Al contribuir aceptas el
[Código de conducta](CODE_OF_CONDUCT.md) y licencias tu aportación
bajo la misma licencia del proyecto (GNU AGPL-3.0, en la variante que
figure en NOTICE y en las cabeceras SPDX: AGPL-3.0-or-later).

No hay CLA. Cada persona conserva el copyright de su aportación y la
certifica con el Developer Certificate of Origin (DCO) 1.1, más abajo.

La rama principal es `main`. Las solicitudes de incorporación
(pull requests) se abren contra `main`. No envíes trabajo
directamente a otras ramas.

## 1. Issues y solicitudes de incorporación

1. Busca primero si ya existe una [incidencia (issue)](../../issues)
   sobre el tema. Si no, ábrela y espera, si puedes, a que se comente
   antes de escribir mucho código.
2. Haz un fork o una rama a partir de `main`.
3. Haz commits pequeños y con mensajes claros, en español o en
   inglés, cada uno certificado con el DCO (`git commit -s`).
4. Abre una solicitud de incorporación (pull request) contra la rama
   principal. Describe el problema, la solución y cómo se ha
   comprobado. Enlaza la incidencia si existe.
5. Mantén la rama al día con la principal y atiende la revisión.

Las vulnerabilidades de seguridad no se informan por issues públicas.
Sigue [SECURITY.md](SECURITY.md).

## 2. Estilo, construcción y pruebas

Los comandos siguientes son los scripts reales de `package.json`
(versión 1.5.0, leídos en los repos actuales el 23 de noviembre de
2026). El proyecto usa Node.js 22.x y
`packageManager` npm@10.9.2. No hay script de linter en
`package.json`. Prettier figura como dependencia de desarrollo, pero
no tiene script propio: si formatea, hazlo con `npx prettier` de
forma coherente con el código existente y no reformatees ficheros
ajenos al cambio.

```bash
npm install
npm test              # ng test — debe pasar antes de pedir revisión
npm run build         # ng build
npm run type-check    # ng build --configuration production --no-progress
```

Para desarrollar en local: `npm start` (`ng serve --port 4201`).
Otras variantes del propio `package.json`: `npm run start:dev`,
`npm run start:prod`, `npm run start:bff` y `npm run start:bff:dev`
(estas dos últimas usan `proxy.conf.json`). `npm run watch` compila
en modo desarrollo con seguimiento.

Las pruebas de extremo a extremo (`npm run test:e2e` y las variantes
`test:e2e:pr`, `test:e2e:ci`, `test:e2e:flows`, `test:e2e:critical`,
`test:e2e:nightly`, etc., todas basadas en Playwright) pueden exigir
un entorno local o secretos de CI que no están en el repositorio. No
son el requisito mínimo de una aportación habitual; sí lo son
`npm test` y, si tocas la compilación o el tipado, `npm run build` o
`npm run type-check`. No subas `playwright-report/`, capturas ni
credenciales.

Otros scripts (`npm run build:vercel`, `npm run api:generate`,
`npm run sync:legal-i18n`, `npm run serve:ssr:regalalo`) son de
despliegue o de generación. Úsalos solo si tu cambio los necesita, y
no incluyas secretos de Vercel ni ficheros generados de entorno
(`.gitignore` ya ignora `src/environments/environment.vercel.generated.ts`).

## 3. Developer Certificate of Origin (DCO) 1.1

Cada commit debe llevar la línea:

```
Signed-off-by: Nombre Apellidos <tu@correo>
```

El nombre y el correo deben coincidir con los de la autora o el
autor del commit. Se añade sola con:

```bash
git commit -s -m "tipo: resumen del cambio"
```

Si se te olvidó en el último commit y aún no lo has enviado:

```bash
git commit --amend -s --no-edit
```

No reescribas commits que ya estén en la rama principal. El proyecto
no usa CLA: el `-s` es la certificación, no una cesión de derechos.

Texto oficial del DCO 1.1, sin modificar
(<https://developercertificate.org/>):

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off)
    is maintained indefinitely and may be redistributed consistent
    with this project or the open source license(s) involved.
```

Si has usado herramientas de asistencia por inteligencia artificial,
decláralo en la solicitud de incorporación y asegúrate de que puedes
certificar el DCO (en particular, que tienes derecho a aportar ese
código bajo la licencia del proyecto).

## 4. Qué no se acepta

- Secretos, tokens, contraseñas, claves privadas, URL de bases de
  datos con credenciales, ficheros `.env` (salvo `.env.example`) o
  cualquier credencial real o de un entorno de despliegue.
- Datos personales de personas reales (nombres, correos, teléfonos,
  direcciones, documentos). Las cuatro direcciones `@gmail.com` que
  ya aparecen en las maquetas de `docs/project/` son ficticias y se
  quedan, según decisión de Emanuel del 23 de noviembre de 2026; no
  añadas otras sin que quede claro en el propio fichero que son de
  ejemplo.
- Cambios de marca: no se aceptan pull requests que sustituyan el
  nombre «Regálalo», los nombres «No lo vendo» o «No lo vendo, lo
  regalo», el logotipo o el sistema de diseño oficiales, ni que
  pretendan presentar un fork como la instancia oficial. Véanse
  [TRADEMARK.md](TRADEMARK.md) y [NOTICE](NOTICE).
- Aportaciones sin `Signed-off-by`, o que no pasen `npm test` sin una
  justificación clara.

## 5. Cómo se reconoce a quien contribuye

- El historial de Git conserva la autoría de cada commit.
- Quien aporte de forma aceptada (no los bots ni los agentes
  automáticos) se añade a [CONTRIBUTORS.md](CONTRIBUTORS.md), con su
  nombre o el identificador que prefiera.
- El reconocimiento del autor original y creador, Eduardo Emanuel
  Cabral Petrucci, figura en [NOTICE](NOTICE).
- El proyecto puede adoptar más adelante el emoji bot
  [all-contributors](https://allcontributors.org/) como complemento,
  no como sustituto de CONTRIBUTORS.md ni del historial.

## 6. Licencia, marca y código de conducta

La licencia del código es la GNU AGPL-3.0 (véanse LICENSE, NOTICE y
CABECERA-COPYRIGHT.txt). La interfaz se entrega al navegador; aun así,
si publicas un servicio en red con una versión modificada, la §13 te
obliga a ofrecer el código fuente correspondiente a quienes lo usen.

La marca y el diseño tienen reglas propias (TRADEMARK.md) y no van
incluidos en la AGPL.

Al participar aceptas el [Código de conducta](CODE_OF_CONDUCT.md).
Las incidencias de conducta se envían a ecabralpetrucci@gmail.com.
