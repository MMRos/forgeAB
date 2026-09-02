# Directrices Maestras de Proyecto: Full-Stack (Backend API + Frontend Web)

Estas directrices establecen la metodología, arquitectura, estándares de calidad, seguridad y flujos de trabajo obligatorios que todos los agentes de forgeAB (**Leader, Specifier, Critic, Skill Creator, Planner, Trapper, Implementer, Tester**) deben seguir estrictamente en este proyecto.

---

## 1. Filosofía Global y Ciclo Estricto de Desarrollo

- **El Usuario en el Centro**: La IA es una extensión del desarrollador y no debe tomar decisiones críticas de negocio o arquitectura de forma autónoma sin validación.
- **Spec-Driven Development (SDD)**: Ninguna línea de código de producción debe escribirse sin que la especificación (Delta Specs con escenarios `WHEN / THEN`) y el diseño técnico hayan sido definidos y aprobados.
- **Gestor de Paquetes**: Uso estricto de `pnpm` en proyectos JavaScript/TypeScript.
  - Prohibido `npm install` o `npm run` directo si existe `pnpm`.
  - Usar `pnpm audit` para validación de vulnerabilidades.

### 1.1. Orden Secuencial Obligatorio del Flujo de Programación

Todo desarrollo o modificación debe seguir de forma estricta y sin saltos el siguiente pipeline:

```
[1. SPECIFIER]   → Clarificación de requisitos y redacción de Delta Specs con escenarios WHEN / THEN.
      ↓
[CHECKPOINT      → Auditoría adversarial obligatoria del Critic sobre la conversación y especificaciones.
 CRITIC]
      ↓
[2. PLANNER]     → Diseño arquitectónico por secciones atómicas, reutilización, contratos y tasks.md.
      ↓
[3. CONTRACTS &  → Generación de esqueletos de funciones/tipos con comentarios JSDoc/TSDoc completos
    DOCSTRINGS]    (descripción, @param, @returns, @throws, pre/postcondiciones) ANTES de implementar.
      ↓
[4. TRAPPER]     → Diseño e implementación de suite de tests, trampas de seguridad e integridad de catálogo.
      ↓
[5. IMPLEMENTER] → Implementación Test-First bajo Edición Quirúrgica Semántica (preservación de contexto).
      ↓
[6. TESTER]      → Ejecución de 7 puertas de calidad en orden secuencial e intransigente:
                   1. Static Typecheck / Compilación (`tsc --noEmit` o equivalente)
                   2. Linter / Formato (`pnpm lint` / `eslint`)
                   3. Límites Anti-Monolito (<= 150 líneas/archivo, <= 30 líneas/función)
                   4. Test Suite completa (`pnpm test` con Cobertura >= 90%)
                   5. Auditoría CRAP (< 30) y Complejidad Ciclomática (CC <= 10)
                   6. Auditoría de Seguridad y CVEs (`pnpm audit` y escaneo de secretos)
                   7. Integridad de Catálogo (`pnpm harness:verify`: 0 eliminaciones no autorizadas y UI accesible)
      ↓
[7. LEADER       → Sincronización de catálogo (`pnpm harness:index`), archivo de cambio y Git Commit
 SYNC & ARCHIVE]   automático en la rama activa.
```

---

## 2. Modularidad, Anti-Monolitos y Estructura de Carpetas

### 2.1. Reglas Anti-Monolito y Límites Cuantitativos
- **Límite por Archivo**: Máximo **150 líneas de código** por archivo (componente, hook, servicio o controlador). Si un archivo supera este límite, DEBE subdividirse en subcomponentes o utilidades auxiliares.
- **Límite por Función**: Máximo **30 líneas de código** por función o método. Aplicar cláusulas de guarda (*guard clauses*) y *early returns* para evitar anidamientos profundos.
- **Un Componente por Archivo**: Queda estrictamente prohibido declarar múltiples componentes funcionales o clases en el mismo archivo.
- **Principio de Responsabilidad Única (SRP)**: Cada módulo o archivo debe tener una única razón para cambiar.

### 2.2. Arquitectura de Carpetas por Feature / Colocation
- **Estructura por Dominio y Funcionalidad**: Los archivos no deben agruparse únicamente por tipo técnico genérico, sino por contexto de dominio / feature.
- **Componentes Locales y Páginas Complejas**: Si un componente o página (ej. `audio-creation`, `user-profile`, `checkout`) utiliza componentes propios, DEBE residir en su propia carpeta estructurada:
  ```
  src/
  ├── shared/                   ← UI primitiva y utilidades globales transversales
  │   ├── components/ui/        ← Botones, Modales, Inputs base del Design System
  │   └── utils/                ← Utilidades puras compartidas
  └── features/                 ← Módulos / Features de la aplicación
      └── [feature-name]/       ← Ej: audio-creator/
          ├── components/       ← Subcomponentes exclusivos de esta feature
          │   ├── AudioWaveform.tsx
          │   ├── AudioControls.tsx
          │   └── TrackList.tsx
          ├── hooks/            ← Custom hooks y lógica de estado local
          ├── services/         ← Clientes de API / llamadas I/O de la feature
          ├── types/            ← Interfaces, DTOs y tipos locales
          └── index.ts          ← ÚNICA superficie pública exportada (Barrel de encapsulación)
  ```
- **Encapsulación Estricta**: Queda prohibido que una feature importe submódulos internos de otra feature de forma profunda (ej. `import ... from '@/features/audio-creator/components/AudioWaveform'`). Toda comunicación inter-feature debe pasar por el `index.ts` público de la feature o ser promovida a `shared/` si es verdaderamente reutilizable.

### 2.3. Diseño por Secciones y Reutilización de Código
- **Descomposición Obligatoria por Secciones**: Al diseñar o maquetar cualquier vista, página o función compleja, esta DEBE descomponerse conceptualmente en secciones atómicas independientes (ej. HeaderSection, MetricsSection, ControlPanel, DetailGrid).
- **Prioridad de Reutilización**: Antes de declarar un nuevo componente o función auxiliar, el Planner y el Implementer DEBEN auditar `src/shared/` y las features existentes para reutilizar código probado, reduciendo duplicidad y manteniendo los archivos dentro del límite de 150 líneas.
- **Acceso UI/UX de Funciones Indexadas**: Toda función o dato que exponga interacción directa con el usuario debe disponer de un componente o control visual accesible en la interfaz.

---

## 3. Directrices Backend: API REST y Microservicios

### 3.1. Patrón Arquitectónico y Estructura de Capas
- **Arquitectura Limpia / Hexagonal**:
  - Separación estricta entre **Dominio** (entidades, reglas de negocio puras), **Aplicación** (casos de uso, servicios de aplicación) e **Infraestructura** (controladores HTTP, adaptadores de base de datos, clientes externos).
- **Independencia de Frameworks**: Las entidades y lógica de dominio no deben depender directamente de frameworks HTTP ni de ORMs/drivers de base de datos.
- **Inyección de Dependencias**: Los servicios deben recibir sus dependencias a través de interfaces/puertos.

### 3.2. Manejo de Peticiones y Validación DTO
- **Validación en la Entrada**: Toda petición externa (body, query, headers, params) DEBE ser validada en los controladores mediante esquemas DTO estrictos (ej. Zod, Pydantic, Joi) antes de ingresar al dominio.
- **Tipado Fuerte**: Prohibido el uso de tipos genéricos no tipados (`any`, `Object`, `dict` sin tipar) en contratos públicos o interfaces de servicio.
- **Sanitización y Prevención de Inyecciones**: Prohibida la concatenación de consultas SQL/NoSQL crudas. Utilizar query builders tipados o queries parametrizadas.

### 3.3. Manejo de Errores y Respuestas HTTP
- **Estructura de Error Estandarizada**: Todos los errores de la API deben devolver un cuerpo JSON uniforme:
  ```json
  {
    "error": {
      "code": "ERROR_CODE_ENUM",
      "message": "Descripción legible del error",
      "details": []
    }
  }
  ```
- **Códigos de Estado HTTP Semánticos**:
  - `200 OK` / `201 Created` / `204 No Content` para respuestas exitosas.
  - `400 Bad Request` para datos de entrada inválidos o DTOs rechazados.
  - `401 Unauthorized` para autenticación faltante o token expirado.
  - `403 Forbidden` para permisos insuficientes.
  - `404 Not Found` para recursos inexistentes.
  - `409 Conflict` para violaciones de concurrencia o unicidad.
  - `500 Internal Server Error` solo para fallos inesperados no controlados.
- **Prohibido Silenciar Excepciones**: Toda llamada I/O (red, disco, base de datos) debe envolverse en bloques try-catch estructurados. Nunca silenciar errores con bloques vacíos.

### 3.4. Persistencia y Transaccionalidad
- **Límites Transaccionales**: Toda operación que modifique múltiples entidades debe ejecutarse de forma atómica.
- **Migraciones Versionadas**: Todo cambio de esquema de persistencia debe estar respaldado por scripts de migración reproducibles.

---

## 4. Directrices Frontend: Aplicación Web Reactiva

### 4.1. Arquitectura de Componentes y UI
- **Modularidad y Jerarquía**:
  - Componentes de UI pura (presentacionales/atómicos) desacoplados de llamadas a red y lógica de negocio.
  - Componentes contenedores/páginas responsables de la orquestación, conexión a stores y fetching de datos.
- **Design System y Tokens**:
  - Centralizar variables de diseño (paleta HSL/hex, tipografías, espaciados, bordes y sombras).
  - Evitar estilos hardcodeados y estilos ad-hoc fuera de la paleta del sistema.
- **Sin Placeholders Crudos ni Lorem Ipsum**: Todas las vistas deben renderizarse con textos, nombres y datos representativos del dominio.

### 4.2. Gestión de Estado y Flujo de Datos
- **Flujo Unidireccional**: Los datos fluyen hacia abajo mediante props; los cambios de estado se emiten mediante eventos/acciones explícitas.
- **Separación de Estado**:
  - **Server State**: Gestionado mediante librerías con caché y revalidación (React Query, SWR, etc.).
  - **Global UI State**: Exclusivo para estados compartidos globales (tema, sesión, modales globales).
  - **Local State**: Confinado al componente que lo requiere.

### 4.3. Cobertura de los 4 Estados de UI
Todo componente o vista que consuma datos asíncronos DEBE implementar explícitamente:
1. **Loading State**: Skeletons o indicadores de carga no intrusivos.
2. **Empty State**: Mensaje claro, iconografía y llamada a la acción constructiva.
3. **Error State**: Mensaje comprensible para el usuario final con botón de reintento.
4. **Success State**: Renderizado fluido de la información.
- **Límites de Error (Error Boundaries)**: Envolver rutas y secciones críticas para evitar pantallas en blanco ante fallos de renderizado.

### 4.4. Accesibilidad (a11y) y Rendimiento
- **HTML Semántico**: Uso correcto de `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<button>`, `<form>`.
- **Accesibilidad**: Cumplimiento del estándar **WCAG AA** (contraste de color adecuado, atributos `aria-*` y `alt` descriptivos, navegación por teclado).
- **Rendimiento**: Lazy loading de rutas pesadas, optimización de bundles y prevención de re-renders innecesarios.

---

## 5. Convenciones de Código, Tipado y Documentación

- **Nomenclatura**:
  - Variables y funciones: `camelCase`
  - Clases, Componentes e Interfaces: `PascalCase`
  - Constantes y variables de entorno: `SCREAMING_SNAKE_CASE`
  - Archivos: `kebab-case` o `PascalCase` (para componentes React) según convención del módulo.
- **Contratos y Comentarios Formales (TSDoc / JSDoc)**:
  - Toda función pública, componente exportado o método de servicio debe incluir docstrings descriptivos con `@param`, `@returns`, `@throws` y pre/postcondiciones.
  - Prohibidos los comentarios obvios o superfluos que solo repiten el nombre de la variable.
- **Control de Dependencias**: No añadir dependencias externas sin justificación técnica y previa auditoría de seguridad.

### 5.1. Regla de Modificación Quirúrgica Semántica
- **Aislamiento Estricto de Ámbito**: Si se solicita modificar un aspecto puntual (ej. el color de un modal, o unificar una función de cierre), el agente DEBE identificar exclusivamente las líneas que controlan ese aspecto. Queda terminantemente prohibido alterar propiedades contiguas (tamaños, márgenes, padding, eventos colaterales) que no hayan sido requeridas.
- **Preservación Inviolable del Entorno Adyacente**: El código circundante debe permanecer inalterado, sin reescrituras masivas, sin reordenamientos injustificados y sin cambios globales de formato que ensucien el historial.
- **Contraste de Diff Post-Edición**: El agente DEBE contrastar el diff generado para verificar que única y exclusivamente se modificaron las líneas objeto de la solicitud antes de considerar la tarea completada.

---

## 6. Seguridad y Gestión de Secretos

- **Cero Secretos en Código**: Claves API, tokens, contraseñas y certificados deben residir en variables de entorno (`.env` validadas al arranque).
- **Logs Seguros**: Prohibido imprimir contraseñas, tokens JWT, números de tarjeta o PII en logs.
- **Principio de Mínimo Privilegio**: Configurar permisos de base de datos y APIs con los permisos mínimos requeridos.
- **Auditoría de Vulnerabilidades**: Ejecución obligatoria de `pnpm audit` (o equivalente) por parte del Tester para descartar CVEs con severidad Alta o Crítica.

---

## 7. Métricas de Calidad y Puertas de Aceptación (Quality Gates)

| Paso | Puerta de Verificación | Umbral Exigido | Agente Responsable |
| :--- | :--- | :--- | :--- |
| **1** | **TypeCheck / Compilación** | 0 errores de compilación (`tsc --noEmit`) | Tester |
| **2** | **Linter & Formato** | 0 errores de ESLint / Style | Tester |
| **3** | **Límites Anti-Monolito** | $\le 150$ líneas/archivo, $\le 30$ líneas/función, 1 comp/file | Implementer / Critic |
| **4** | **Complejidad Ciclomática (CC)** | $\le 10$ por función / componente | Implementer / Tester |
| **5** | **Cobertura de Tests** | $\ge 90\%$ líneas y ramas críticas | Trapper / Tester |
| **6** | **Índice CRAP** ($CRAP = CC^2 \times (1 - Cov)^3 + CC$) | $< 30$ en todo código de producción | Tester / Critic |
| **7** | **Auditoría de Seguridad (CVEs)** | 0 vulnerabilidades Altas/Críticas y 0 secretos | Tester |
| **8** | **Integridad de Catálogo** | 0 eliminaciones no autorizadas (`pnpm harness:verify`) | Tester / Trapper |
| **9** | **Edición Quirúrgica & Adherencia** | 100% cumplimiento de diffs quirúrgicos y directrices | Critic / Leader |
