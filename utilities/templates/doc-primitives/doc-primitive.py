"""
doc-primitive.py
─────────────────────────────────────────────────────────────────────────────
Plantilla de documentación generada por el Planner.
El Planner rellena los bloques marcados con [PLANNER].
El Implementer completa los bloques marcados con [IMPLEMENTER] al desarrollar.
Este archivo se convierte en el manual técnico del módulo.

INSTRUCCIONES DE USO:
  1. El Planner crea una copia de este archivo por módulo:
     doc_[nombre_modulo].py
  2. Rellena la sección MODULE y cada bloque FUNCTION con las specs.
  3. El Implementer completa IMPLEMENTATION NOTES y EXAMPLES al codificar.
─────────────────────────────────────────────────────────────────────────────
"""

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE
# ═══════════════════════════════════════════════════════════════════════════════

"""
Module: [PLANNER: nombre del módulo]

Description:
[PLANNER: descripción del propósito del módulo en 2-4 frases.
 Qué problema resuelve, qué dominio abarca.]

Responsibilities:
[PLANNER: lista de responsabilidades del módulo]
- ...

Dependencies:
[PLANNER: módulos externos o internos de los que depende]
- ...

Diagrams:
[PLANNER: referencias a los diagramas relevantes]
- Clases:     diagrams/class-diagram.mmd
- Secuencia:  diagrams/sequence.mmd
- Actividad:  diagrams/activity.mmd

Author:    Planner (generated) + Implementer (completed)
Version:   [IMPLEMENTER: versión semántica al publicar]
Since:     [PLANNER: fecha ISO de creación]
"""


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCTION BLOCK — copiar este bloque por cada función del módulo
# ═══════════════════════════════════════════════════════════════════════════════

def [PLANNER: nombre_explicativo_de_la_funcion]([PLANNER: args]):
    """
    [PLANNER: qué hace esta función en una frase clara.]

    ID: [PLANNER: ID de la función en current-dev.xml, ej: F001]

    Purpose:
    [PLANNER: por qué existe esta función, qué problema resuelve en el sistema.]

    Args:
        [PLANNER: nombre_param] ([PLANNER: tipo]): [PLANNER: descripción]

    Returns:
        [PLANNER: tipo]: [PLANNER: descripción del valor de retorno]

    Raises:
        [PLANNER: TipoError]: [PLANNER: cuándo y por qué se lanza]

    Constraints:
    [PLANNER: restricciones, reglas de negocio, condiciones de borde]
    - ...

    Assumptions:
    [PLANNER: asunciones aprobadas por el usuario que afectan a esta función]
    - ...

    Tests:
    [PLANNER: referencia a los IDs de prueba en current-dev.xml]
    - Unit:        [PLANNER: ID]
    - Functional:  [PLANNER: ID]
    - Security:    [PLANNER: ID]
    - Integration: [PLANNER: ID]

    Flow:
    [PLANNER: pasos numerados del flujo interno de la función]
    1. ...
    2. ...
    3. ...

    Implementation Notes:
    [IMPLEMENTER: decisiones técnicas tomadas, trade-offs, patrones aplicados]

    Example:
    [IMPLEMENTER: ejemplo de uso real con inputs y output esperado]
    # Input:
    #   param1: valor_ejemplo
    # Output:
    #   resultado_ejemplo

    Since: [PLANNER: fecha ISO en que se especificó]
    Status: [IMPLEMENTER: development | testing | completed]
    """
    # [IMPLEMENTER: código de la función aquí]
    pass


# ═══════════════════════════════════════════════════════════════════════════════
# CLASS BLOCK — copiar este bloque por cada clase del módulo (si aplica)
# ═══════════════════════════════════════════════════════════════════════════════

class [PLANNER: NombreExplicativoDeLaClase]:
    """
    [PLANNER: qué representa esta clase en el dominio del sistema.]

    ID: [PLANNER: ID en current-dev.xml si corresponde]

    Responsibilities:
    [PLANNER: qué gestiona esta clase]
    - ...

    Attributes:
    [PLANNER: atributos principales con tipo y propósito]
    - nombre (tipo): descripción

    Relationships:
    [PLANNER: relaciones con otras clases: asociación, agregación, composición, herencia]
    - Hereda de: ...
    - Compone:   ...
    - Asociada a: ...

    Diagram Ref: diagrams/class-diagram.mmd

    Since: [PLANNER: fecha ISO]
    """
    # [IMPLEMENTER: definición de la clase aquí]
    pass
