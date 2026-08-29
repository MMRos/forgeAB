# Directrices de Proyecto: Frontend / Web Application

Estas directrices establecen la metodología, arquitectura de componentes y estándares de experiencia de usuario y código que todos los agentes de forgeAB deben seguir en este proyecto.

---

## 1. Arquitectura de Componentes y Diseño de UI
- **Jerarquía y Modularidad**:
  - Componentes atómicos/reutilizables desacoplados de la lógica de negocio (UI pura, basada en props).
  - Componentes contenedores/páginas responsables del fetching de datos, manejo de estado y coordinación.
- **Design System y Tokens**:
  - Utilizar variables de diseño centralizadas (paleta de color, tipografía, espaciados, bordes y sombras).
  - Evitar estilos hardcodeados o colores ad-hoc fuera de la paleta del sistema.
- **Sin Placeholders Crudos ni Lorem Ipsum**: Interfaces siempre con textos y estados realistas del dominio.

---

## 2. Gestión de Estado y Flujo de Datos
- **Flujo Unidireccional**: Los datos fluyen hacia abajo mediante props/lecturas de store; las modificaciones se canalizan mediante eventos/acciones explícitas.
- **Separación de Estado**:
  - Estado del Servidor (Server State): Gestionado mediante herramientas con caché y revalidación (React Query, SWR, RTK Query, etc.).
  - Estado Global de UI: Reducido al mínimo indispensable (tema, sesión de usuario, modales globales).
  - Estado Local: Confinado al componente que lo necesita.

---

## 3. Manejo de Estados de UI (Empty, Loading, Error, Success)
- **Cobertura de los 4 Estados**: Todo componente que consuma datos asíncronos DEBE implementar explícitamente:
  1. Estado de carga (*Loading / Skeleton*).
  2. Estado vacío (*Empty State* informativo y con llamada a la acción).
  3. Estado de error (*Error State* comprensible con opción de reintento).
  4. Estado con datos (*Success*).
- **Límites de Error (Error Boundaries)**: Envolver rutas y módulos clave en Error Boundaries para evitar pantallas en blanco ante excepciones inesperadas.

---

## 4. Accesibilidad (a11y) y Rendimiento
- **Semántica HTML5**: Utilizar etiquetas semánticas (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<button>`).
- **Accesibilidad**:
  - Contraste de color según estándar WCAG AA.
  - Atributos `aria-*` y `alt` en imágenes.
  - Navegación completa por teclado con indicadores de foco visibles.
- **Rendimiento**:
  - Lazy loading de rutas y componentes pesados.
  - Optimización de imágenes y activos multimedia.
  - Evitar re-renderizados innecesarios mediante memoización justificada.

---

## 5. Estrategia de Calidad y Tests
- **Test-First de Componentes e Interacciones**:
  - Trapper define tests funcionales de interacción (Testing Library, Playwright, Cypress) antes de la implementación.
  - Pruebas orientadas al usuario (buscar por rol, texto accesible, no por selectores CSS frágiles).
- **Métricas de Calidad**:
  - Complejidad Ciclomática $\le 10$ por componente/hook.
  - Cobertura de tests $\ge 90\%$.
  - Índice CRAP $< 30$.
