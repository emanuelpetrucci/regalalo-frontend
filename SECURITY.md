# Política de seguridad de Regálalo

Gracias por ayudar a mantener seguro este proyecto. Esta política se
aplica a este repositorio (código publicado bajo la GNU AGPL-3.0) y a
las versiones del servicio que se deriven de él.

## Cómo informar de una vulnerabilidad

**No abras una incidencia (issue) pública, ni un pull request, ni un
debate, ni un comentario** que describa una vulnerabilidad. Eso
permite explotarla antes de que se pueda corregir.

Infórmanos por uno de estos dos canales, el que te resulte más
accesible:

1. **GitHub Private Vulnerability Reporting** (aviso privado), en la
   pestaña *Security* del repositorio: *Report a vulnerability*. Es el
   cauce preferido, porque deja un registro coordinado en GitHub.
2. **Correo electrónico: ecabralpetrucci@gmail.com.**  
   Es el mismo correo de contacto del proyecto (un único buzón para
   conducta, marca y seguridad). Este valor es un marcador. No se ha
   inventado ninguna dirección; Emanuel debe sustituirlo por un correo
   real antes de publicar.

Incluye, en la medida de lo posible: una descripción del problema, los
pasos para reproducirlo, el impacto que ves, la rama o el
commit afectados y, si la tienes, una propuesta de corrección. No
adjuntues datos personales de terceras personas ni secretos que no
sean necesarios para demostrar el fallo.

Si descubres un secreto (token, clave, contraseña) en el repositorio o
en un despliegue, infórmalo por el mismo cauce; no lo reproduzcas
entero en el mensaje.

## Plazos de respuesta (orientativos)

Estos plazos son una referencia de buena fe, no un compromiso
contractual ni un SLA:

- Acuse de recibo: en un plazo de **cinco días laborables**.
- Primera valoración (si se confirma, gravedad aproximada y siguientes
  pasos): en un plazo de **catorce días laborables** desde el acuse.
- Coordinación de la corrección y de la divulgación pública: según la
  gravedad y la complejidad, con un horizonte habitual de **hasta
  noventa días** desde el informe. Si necesitas más tiempo o conviene
  adelantar un aviso, lo hablamos.

Si no recibes acuse en el plazo orientativo, puedes reenviar el correo
(sin abrir una issue pública). No publiques el informe por tu cuenta
mientras estemos dentro de esos plazos, salvo que exista un riesgo
activo grave y no hayamos respondido.

## Versiones soportadas

| Rama o línea | Soporte de seguridad |
| --- | --- |
| `main` | Sí (rama principal y de publicación del repositorio público) |
| Otras ramas, etiquetas antiguas y forks | No, salvo que se indique lo contrario |

El parche se publica en `main` y, cuando proceda, se informa de forma
coordinada. Las ramas de características o de experimentos no reciben
parches de seguridad de forma sistemática. El historial privado de
archivo puede conservar una rama `develop`; esa línea no forma parte
del repositorio público y no se soporta aquí.

## Alcance

Están dentro del alcance, entre otros, la inyección, la autenticación
y la autorización (incluido el control de acceso entre cuentas), la
exposición de secretos, la falsificación de peticiones, la ejecución
remota y los problemas que afecten a datos de las personas usuarias.

Quedan fuera, en principio: denegaciones de servicio por volumen sobre
infraestructura de terceros, fallos que solo se den en dependencias
aún no publicadas, o informes sobre versiones que ya no se soportan.
Si dudas, envía el aviso en privado y lo valoramos.

## Agradecimiento

Agradecemos los informes de buena fe y podemos mencionar a quien
informe (con su permiso) en las notas de la corrección. No ofrecemos
un programa de recompensas económicas en este momento.
