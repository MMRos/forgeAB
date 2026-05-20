//! doc-primitive.rs
//! ─────────────────────────────────────────────────────────────────────────────
//! Plantilla de documentación generada por el Planner.
//! El Planner rellena los bloques marcados con [PLANNER].
//! El Implementer completa los bloques marcados con [IMPLEMENTER] al desarrollar.
//! Este archivo se convierte en el manual técnico del módulo.
//!
//! INSTRUCCIONES DE USO:
//!   1. El Planner crea una copia de este archivo por módulo:
//!      [nombre_modulo].rs
//!   2. Rellena la sección MODULE y cada bloque FUNCTION con las specs.
//!   3. El Implementer completa IMPLEMENTATION NOTES y EXAMPLES al codificar.
//! ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE
// ═══════════════════════════════════════════════════════════════════════════════

//! # Módulo: [PLANNER: nombre del módulo]
//!
//! ## Descripción
//! [PLANNER: descripción del propósito del módulo en 2-4 frases.
//!  Qué problema resuelve, qué dominio abarca.]
//!
//! ## Responsabilidades
//! [PLANNER: lista de responsabilidades del módulo]
//! - ...
//!
//! ## Dependencias
//! [PLANNER: módulos externos o internos de los que depende]
//! - ...
//!
//! ## Diagramas
//! [PLANNER: referencias a los diagramas relevantes]
//! - Clases:     diagrams/class-diagram.mmd
//! - Secuencia:  diagrams/sequence.mmd
//! - Actividad:  diagrams/activity.mmd
//!
//! **Author:** Planner (generated) + Implementer (completed)  
//! **Version:** [IMPLEMENTER: versión semántica al publicar]  
//! **Since:** [PLANNER: fecha ISO de creación]


// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTION BLOCK — copiar este bloque por cada función del módulo
// ═══════════════════════════════════════════════════════════════════════════════

/// [PLANNER: qué hace esta función en una frase clara.]
///
/// **ID:** [PLANNER: ID de la función en current-dev.xml, ej: F001]
///
/// ## Purpose
/// [PLANNER: por qué existe esta función, qué problema resuelve en el sistema.]
///
/// ## Arguments
/// * `[PLANNER: nombre_param]` - [PLANNER: descripción]
///
/// ## Returns
/// * `[PLANNER: tipo]` - [PLANNER: descripción del valor de retorno]
///
/// ## Errors
/// [PLANNER: cuándo y por qué devuelve un Result::Err]
///
/// ## Constraints
/// [PLANNER: restricciones, reglas de negocio, condiciones de borde]
/// - ...
///
/// ## Assumptions
/// [PLANNER: asunciones aprobadas por el usuario que afectan a esta función]
/// - ...
///
/// ## Tests
/// [PLANNER: referencia a los IDs de prueba en current-dev.xml]
/// - Unit:        [PLANNER: ID]
/// - Functional:  [PLANNER: ID]
/// - Security:    [PLANNER: ID]
/// - Integration: [PLANNER: ID]
///
/// ## Flow
/// [PLANNER: pasos numerados del flujo interno de la función]
/// 1. ...
/// 2. ...
/// 3. ...
///
/// ## Implementation Notes
/// [IMPLEMENTER: decisiones técnicas tomadas, trade-offs, patrones aplicados]
///
/// ## Example
/// [IMPLEMENTER: ejemplo de uso real con inputs y output esperado]
/// ```rust
/// // Input:
/// //   param1: valor_ejemplo
/// // Output:
/// //   resultado_ejemplo
/// ```
///
/// **Since:** [PLANNER: fecha ISO en que se especificó]  
/// **Status:** [IMPLEMENTER: development | testing | completed]
pub fn [PLANNER: nombre_explicativo_de_la_funcion]([PLANNER: args]) -> [PLANNER: tipo_retorno] {
    // [IMPLEMENTER: código de la función aquí]
    unimplemented!()
}


// ═══════════════════════════════════════════════════════════════════════════════
// STRUCT BLOCK — copiar este bloque por cada struct/class del módulo
// ═══════════════════════════════════════════════════════════════════════════════

/// [PLANNER: qué representa esta estructura en el dominio del sistema.]
///
/// **ID:** [PLANNER: ID en current-dev.xml si corresponde]
///
/// ## Responsibilities
/// [PLANNER: qué gestiona esta estructura]
/// - ...
///
/// ## Attributes
/// [PLANNER: atributos principales con tipo y propósito]
/// - `nombre` (tipo): descripción
///
/// ## Relationships
/// [PLANNER: relaciones con otras clases: asociación, agregación, composición, traits]
/// - Implementa: ...
/// - Compone:    ...
///
/// **Diagram Ref:** diagrams/class-diagram.mmd
///
/// **Since:** [PLANNER: fecha ISO]
pub struct [PLANNER: NombreExplicativoDeLaClase] {
    // [IMPLEMENTER: definición de campos aquí]
}
