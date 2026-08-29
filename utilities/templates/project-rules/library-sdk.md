# Directrices de Proyecto: Library / SDK / Shared Module

Estas directrices establecen la metodología, diseño de API pública y reglas de aislamiento que todos los agentes de forgeAB deben seguir en este proyecto.

---

## 1. Diseño de API Pública y Aislamiento
- **Superficie de API Mínima y Explícita**:
  - Exportar únicamente las funciones, clases e interfaces expresamente pensadas para el consumidor externo (usar un punto de entrada central, ej. `index.ts` o `__init__.py`).
  - Marcar como internas o privadas todas las utilidades auxiliares.
- **Cero Efectos Secundarios al Importar (No Side-Effects)**:
  - Importar el paquete nunca debe ejecutar operaciones de I/O, modificar el entorno global ni mutar prototipos/objetos globales.
- **Cero Fugas de Estado Global**:
  - Toda instancia o cliente debe ser autocontenido y permitir múltiples instancias concurrentes sin compartir memoria estática mutable.

---

## 2. Tipado Estricto y Documentación
- **Tipado Completo**:
  - 100% de la API pública debe contar con definiciones de tipos completas (TypeScript `.d.ts`, type annotations de Python, firmas en Rust/Go).
- **Docstrings y Ejemplos de Uso**:
  - Cada método o función pública debe incluir docstrings descriptivos, documentación de parámetros, valores de retorno, excepciones posibles y un snippet de ejemplo funcional.

---

## 3. Gestión de Dependencias y Versionado
- **Dependencias Mínimas (Zero/Low Dependency Footprint)**:
  - Evitar paquetes de terceros para utilidades triviales. Priorizar la librería estándar de la plataforma.
- **Semantic Versioning (SemVer)**:
  - Cambios sin compatibilidad hacia atrás requieren incremento de versión MAYOR (`MAJOR`).
  - Nuevas funcionalidades retrocompatibles requieren versión MENOR (`MINOR`).
  - Corrección de errores retrocompatibles requieren versión PARCHE (`PATCH`).

---

## 4. Estrategia de Calidad y Tests
- **Test-First de Contratos Públicos**:
  - Trapper diseña pruebas exhaustivas de la API pública verificando entradas nominales, nulas, tipos erróneos y concurrencia.
- **Métricas de Calidad**:
  - Complejidad Ciclomática $\le 10$ por función exportada.
  - Cobertura de tests $\ge 95\%$.
  - Índice CRAP $< 30$.
