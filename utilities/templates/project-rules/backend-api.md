# Directrices de Proyecto: Backend API / Microservicio REST

Estas directrices establecen la metodología, patrones arquitectónicos y estándares obligatorios que todos los agentes de forgeAB deben seguir en este proyecto.

---

## 1. Patrón Arquitectónico y Estructura de Capas
- **Arquitectura**: Arquitectura Limpia / Hexagonal (Separación estricta entre Dominio, Casos de Uso/Aplicación e Infraestructura).
- **Independencia de Framework**: Las entidades y lógica de negocio del dominio no deben depender de frameworks HTTP (Express, FastAPI, Nest, etc.) ni de clientes de base de datos directamente.
- **Inyección de Dependencias**: Los servicios deben recibir sus dependencias (repositorios, clientes externos) mediante interfaces/puertos.

---

## 2. Manejo de Peticiones y Validación de Datos
- **Validación en la Entrada**: Toda petición externa (body, query, headers, params) DEBE ser validada en la capa de transporte/controlador mediante esquemas DTO estrictos (ej. Zod, Pydantic, class-validator) antes de alcanzar la lógica de negocio.
- **Tipado Fuerte**: Prohibido el uso de tipos genéricos no tipados (`any`, `Object`, `dict` sin tipar) en contratos públicos.
- **Sanitización**: Prevenir inyección SQL/NoSQL utilizando query builders tipados u ORMs parametrizados.

---

## 3. Manejo de Errores y Respuestas HTTP
- **Respuestas de Error Estandarizadas**: Todos los errores de la API deben devolver un cuerpo JSON uniforme:
  ```json
  {
    "error": {
      "code": "RESOURCE_NOT_FOUND",
      "message": "Descripción legible del error",
      "details": []
    }
  }
  ```
- **Códigos de Estado HTTP Semánticos**:
  - `200 OK` / `201 Created` / `204 No Content` para éxito.
  - `400 Bad Request` para datos de entrada inválidos.
  - `401 Unauthorized` para autenticación faltante o inválida.
  - `403 Forbidden` para permisos insuficientes.
  - `404 Not Found` para recursos inexistentes.
  - `409 Conflict` para violaciones de unicidad o estado concurrente.
  - `500 Internal Server Error` solo para fallos inesperados (capturados globalmente).
- **Prohibido Silenciar Excepciones**: Toda excepción capturada debe ser tratada o relanzada; nunca silenciada con bloques vacíos.

---

## 4. Persistencia y Transaccionalidad
- **Límites Transaccionales**: Operaciones que modifiquen múltiples tablas/documentos deben ejecutarse dentro de transacciones atómicas.
- **Migraciones Versionadas**: Todo cambio de esquema de base de datos debe ser gestionado mediante migraciones versionadas y reproducibles.

---

## 5. Seguridad y Gestión de Secretos
- **Cero Secretos en Código**: Claves de API, credenciales y tokens deben cargarse exclusivamente mediante variables de entorno validadas al inicio del proceso.
- **Logs Seguros**: Prohibido imprimir contraseñas, tokens JWT, números de tarjeta o información de identificación personal (PII) en los logs de la aplicación.
- **Principio de Mínimo Privilegio**: Tokens y conexiones con permisos estrictamente limitados a lo necesario.

---

## 6. Estrategia de Calidad y Tests
- **Test-First Obligatorio**: Trapper define los tests antes de que Implementer escriba código.
- **Métricas de Calidad**:
  - Complejidad Ciclomática (CC) $\le 10$ por función.
  - Cobertura de tests $\ge 90\%$.
  - Índice CRAP $< 30$ en todos los endpoints y servicios.
- **Tests de Integración**: Pruebas con bases de datos en memoria o contenedores de prueba (Testcontainers) para flujos críticos.
