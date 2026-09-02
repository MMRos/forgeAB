# Guías de Seguridad y Restricciones del Proyecto

Este documento constituye la Base de Conocimiento activa de seguridad para los agentes **Planner, Trapper, Implementer, Tester y Critic** en forgeAB.
Complementa de forma vinculante la Sección 6 ("Seguridad y Gestión de Secretos") de `openspec/specs/project-rules.md`.

---

## 1. Dependencias Prohibidas y Obsolescencia
Queda estrictamente prohibido el uso o importación de los siguientes paquetes y librerías:
- `request` / `request-promise`: Proyecto deprecado y abandonado. Utilizar `fetch` nativo o clientes HTTP tipados modernos.
- `lodash@<4.17.21`: Vulnerabilidades críticas de Prototype Pollution.
- `vm2`: Historial recurrente de evasión de sandbox y ejecución remota de código (RCE).
- `crypto-js`: En entornos Node modernos, usar la API nativa `node:crypto`.
- `node-serialize` / `serialize-javascript@<6.0.0`: Riesgo de deserialización insegura y RCE.
- Todo paquete con avisos de vulnerabilidad de nivel **Alto** o **Crítico** en `pnpm audit`.

---

## 2. Prevención de Fuga de Secretos y Credenciales
- **Cero Secretos Hardcodeados**: Prohibido escribir claves API, tokens JWT, contraseñas, connection strings o certificados en archivos de código o tests.
- **Variables de Entorno**: Todos los secretos deben inyectarse exclusivamente mediante variables de entorno validadas al arranque (`.env` tipado mediante esquemas).
- **Patrones Vigilados en Auditoría**:
  - AWS Access Keys: `AKIA[0-9A-Z]{16}`
  - OpenAI API Keys: `sk-[a-zA-Z0-9]{32,}`
  - GitHub Tokens: `ghp_[a-zA-Z0-9]{36}`
  - Claves Privadas: `-----BEGIN (?:RSA )?PRIVATE KEY-----`
  - Cabeceras y Tokens: `Bearer [a-zA-Z0-9_\-\.]{20,}`

---

## 3. Reglas de Arquitectura y Manejo de Errores Seguros
- **Prohibido el Silenciado de Errores**: Nunca utilizar bloques `catch` vacíos o que descarten excepciones sin registrar el incidente.
- **Sanitización de Logs**: Ningún log debe imprimir credenciales, contraseñas, tokens de sesión o datos personales (PII). Registrar únicamente `function_name`, parámetros públicos y `error.message`.
- **Prevención de Inyección**: Prohibida la concatenación de cadenas en consultas a bases de datos o comandos del sistema operativo (`child_process.exec` con entrada del usuario). Usar siempre consultas parametrizadas o `execFile` con argumentos separados.
- **Validación DTO en Entrada**: Toda petición externa (body, query, params) debe ser validada con esquemas estrictos antes de pasar al dominio.

---

## 4. Directrices de Verificación para el Tester
- **Auditoría de Vulnerabilidades**: Ejecutar `pnpm audit --audit-level=high`. Cualquier vulnerabilidad detectada bloquea el despliegue (Fallo de Calidad Categoría B).
- **Escaneo Automatizado de Secretos**: Ejecutar `pnpm quality-gate` para verificar que ningún archivo de código contiene patrones de claves o tokens.
- **Pruebas de Inyección y Límites**: Comprobar que los casos de prueba de seguridad diseñados por el Trapper verifican explícitamente el rechazo de payloads sobredimensionados, caracteres maliciosos y parámetros inválidos.
