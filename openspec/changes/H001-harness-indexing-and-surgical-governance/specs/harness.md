# Specs: Harness Indexing, Catalog Integrity & Surgical Governance

## ADDED Requirements

### Requirement: REQ-01 — Indexación Continua de Funciones y Datos
El arnés SHALL proporcionar un mecanismo determinista para registrar y catalogar todas las funciones exportadas, contratos de datos, endpoints y componentes/rutas de UI en `project-logs/catalog-index.yaml`.

#### Scenario: Indexación exitosa de artefactos
- **WHEN** se ejecuta el comando `pnpm harness:index`
- **THEN** el archivo `project-logs/catalog-index.yaml` se genera o actualiza registrando cada función, archivo de origen y tipo de artefacto sin duplicados.

---

### Requirement: REQ-02 — Detección y Bloqueo de Borrado Accidental de Funciones/Datos
El Quality Gate SHALL verificar que ninguna función o entidad de datos previamente indexada haya desaparecido del código fuente, a menos que esté declarada explícitamente en `## REMOVED Requirements` de una propuesta aprobada.

#### Scenario: Detección de función eliminada por error
- **WHEN** una función presente en el catálogo indexado ya no existe en el código fuente y NO figura en `## REMOVED Requirements`
- **THEN** la verificación de catálogo falla con código de salida distinto de cero y emite un mensaje crítico indicando la función y archivo faltante.

#### Scenario: Eliminación autorizada bajo especificación
- **WHEN** una función eliminada del código figura explícitamente en `## REMOVED Requirements` de la propuesta activa
- **THEN** la verificación de catálogo permite la eliminación y actualiza el estado como deprecación válida.

---

### Requirement: REQ-03 — Verificación de Accesibilidad UI/UX de Funciones/Datos
Para toda función o dato que exponga interacción con usuario, el arnés SHALL validar que su componente visual asociado o ruta de navegación siga existiendo e importado.

#### Scenario: Función con interfaz mantiene componente activo
- **WHEN** una función catalogada con etiqueta UI es auditada
- **THEN** el test comprueba la existencia del componente visual o ruta de UI correspondiente, fallando si la ruta queda huérfana o el componente fue desacoplado.

---

### Requirement: REQ-04 — Edición Quirúrgica Semántica con Preservación Inviolable de Contexto
Las modificaciones a código existente SHALL realizarse aislando exclusivamente las líneas que responden al requerimiento, prohibiendo la alteración de estilos, variables o lógica adyacente no solicitada.

#### Scenario: Modificación puntual de propiedad
- **WHEN** se solicita modificar una propiedad específica (ej. color o handler puntual)
- **THEN** el diff resultante muestra cambios única y exclusivamente en las líneas asociadas a dicha propiedad, manteniendo intactas las dimensiones, estilos y variables colaterales.

---

### Requirement: REQ-05 — Descomposición Modular por Secciones y Reutilización
Al diseñar y maquetar funciones o páginas complejas, el Planner SHALL subdividirlas en secciones atómicas y verificar la reutilización de componentes en `src/shared/` o `features/`.

#### Scenario: Diseño de página compleja
- **WHEN** se especifica o diseña una página o vista
- **THEN** se descompone en un árbol de subcomponentes específicos (máximo 1 componente por archivo, $\le 150$ líneas/archivo), reutilizando componentes base del design system.

---

### Requirement: REQ-06 — Git Commit Automático al Cierre de Loop
Al completar con éxito la fase de sincronización y archivo de un loop de desarrollo, el Leader SHALL crear un commit Git local en la rama activa.

#### Scenario: Finalización exitosa de loop
- **WHEN** todos los Quality Gates (1 al 7) pasan en estado PASS y la función es archivada
- **THEN** el Leader ejecuta un commit semántico en la rama activa registrando los cambios completados.

---

### Requirement: REQ-07 — Auditoría Obligatoria del Critic Post-Conversación
Ninguna propuesta de especificación SHALL avanzar a fase de diseño técnico sin que el Critic emita un veredicto adversarial auditando los acuerdos alcanzados entre el Specifier y el usuario.

#### Scenario: Checkpoint tras clarificación de requisitos
- **WHEN** el Specifier concluye la fase de exploración y acuerdo con el usuario
- **THEN** el Critic es invocado obligatoriamente para auditar puntos ciegos, suposiciones ocultas y cumplimiento de directrices antes de la fase de diseño.
