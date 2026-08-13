---
name: security-review
description: "Use when: reviewing code or dependencies for security risks, checking for prohibited libraries, and verifying that the implementation follows the repository security constraints."
---
# SKILL: security-review

**Nombre:** Revisión de Seguridad (security-review)
**Propósito:** Guiar a los agentes en la revisión de seguridad del código y las dependencias antes de aceptar una implementación.

## Instrucciones para el Agente

Cuando recibas la batuta con este skill requerido en `<skills_required>`:

1. Revisa primero las guías de seguridad del proyecto y cualquier restricción explícita sobre dependencias o arquitectura.
2. Identifica las dependencias del código bajo revisión y verifica si alguna está prohibida, obsoleta o asociada a vulnerabilidades conocidas.
3. Revisa el flujo de entrada/salida del código para detectar riesgos comunes como validación insuficiente, manejo inseguro de errores, exposición de secretos, o uso de librerías inseguras.
4. Si encuentras una vulnerabilidad o una violación de las restricciones del proyecto:
   - Marca la revisión como `Fail`.
   - Reporta el problema al Leader con el nivel de severidad y el impacto esperado.
5. Si la revisión no encuentra problemas, confirma que la implementación cumple con las restricciones de seguridad del proyecto.

## Criterios de salida

La revisión debe dejar claro:
- Qué dependencias o patrones se evaluaron.
- Qué riesgos, si existen, fueron detectados.
- Si la implementación cumple o no con las guías de seguridad del proyecto.
