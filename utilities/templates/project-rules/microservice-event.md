# Directrices de Proyecto: Microservicio / Arquitectura Orientada a Eventos

Estas directrices establecen la metodología, patrones de mensajería y resiliencia distribuida que todos los agentes de forgeAB deben seguir en este proyecto.

---

## 1. Comunicación y Contratos de Eventos
- **Esquemas Versionados**:
  - Todo mensaje o evento debe seguir un esquema formalmente versionado (JSON Schema, Protobuf, Avro) que garantice compatibilidad hacia atrás.
- **Idempotencia Obligatoria**:
  - Todo consumidor de eventos DEBE ser idempotente. Procesar el mismo mensaje múltiples veces (por reintentos o entrega duplicada) debe producir exactamente el mismo resultado final.
- **Encabezados Estandarizados**:
  - Incluir siempre: `correlationId`, `causationId`, `messageId`, `timestamp` y `producerId`.

---

## 2. Resiliencia, Reintentos y Fallbacks
- **Políticas de Reintento con Backoff Exponencial y Jitter**:
  - Evitar tormentas de reintentos mediante esperas exponenciales con fluctuación aleatoria (*jitter*).
- **Dead-Letter Queue (DLQ)**:
  - Mensajes que fallen tras el número máximo de reintentos deben enviarse a una cola de mensajes muertos (DLQ) junto con el stack trace y contexto del fallo para inspección.
- **Circuit Breaker**:
  - Proteger llamadas a servicios externos degradados con patrones de interruptor automático.

---

## 3. Observabilidad y Trazabilidad Distribuida
- **Trazabilidad de Extremo a Extremo**:
  - Propagar el `correlationId` a través de todas las llamadas HTTP, consultas a base de datos y eventos de mensajería.
- **Logs Estructurados en JSON**:
  - Todos los logs deben emitirse en formato JSON estructurado con nivel de log, timestamp ISO 8601, contexto del servicio y correlationId.
- **Health Checks & Métricas**:
  - Exponer endpoints `/health/liveness` y `/health/readiness`.

---

## 4. Estrategia de Calidad y Tests
- **Test-First de Consumo y Producción de Eventos**:
  - Pruebas de contratos de eventos (Contract Testing / Pact).
  - Pruebas de simulación de fallos de red, timeouts y entrega desordenada de mensajes.
- **Métricas de Calidad**:
  - Complejidad Ciclomática $\le 10$.
  - Cobertura de tests $\ge 90\%$.
  - Índice CRAP $< 30$.
