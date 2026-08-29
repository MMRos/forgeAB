# Directrices de Proyecto: CLI / Developer Tool

Estas directrices establecen la metodología, estándares de interfaz de línea de comandos y reglas de ejecución que todos los agentes de forgeAB deben seguir en este proyecto.

---

## 1. Convenciones de Interfaz de Línea de Comandos (CLI)
- **Estándar POSIX / GNU**:
  - Flags cortos con un guion (`-v`, `-f`, `-o`).
  - Flags largos con dos guiones (`--verbose`, `--file`, `--output`).
  - Ayuda interactiva accesible con `-h` y `--help`.
  - Versión accesible con `-V` y `--version`.
- **Modo No Interactivo**:
  - Toda orden interactiva debe soportar un flag para ejecución desatendida (`--yes`, `-y`, `--non-interactive`) para entornos CI/CD o pipelines automatizados.

---

## 2. Flujo de Salida, Códigos de Estado y Manejo de Señales
- **Separación de Salidas (Streams)**:
  - `stdout`: Reservado exclusivamente para la salida de datos del comando (formato procesable por tuberías / pipe friendly: JSON, texto plano según flag).
  - `stderr`: Mensajes de error, advertencias, logs informativos y barras de progreso.
- **Códigos de Salida Estandarizados**:
  - `0`: Éxito total.
  - `1`: Error genérico / fallo de ejecución.
  - `2`: Error en argumentos / opciones de entrada inválidas.
  - `126`: Comando encontrado pero no ejecutable.
  - `127`: Comando o dependencia no encontrada.
  - `130`: Interrupción por el usuario (`SIGINT` / Ctrl+C).
- **Manejo de Señales**:
  - Capturar `SIGINT` y `SIGTERM` para realizar limpieza de archivos temporales, cerrar descriptores de archivos y terminar de forma ordenada.

---

## 3. Resiliencia y Manejo de Archivos
- **Operaciones Atómicas en Disco**:
  - Al escribir archivos de configuración o artefactos críticos, escribir primero en un archivo temporal (`.tmp`) y realizar un rename atómico.
- **Validación de Rutas y Permisos**:
  - Validar existencia y permisos de lectura/escritura antes de iniciar operaciones pesadas.
  - Sanitizar rutas relativas y absolutas para evitar vulnerabilidades de directory traversal.

---

## 4. Estrategia de Calidad y Tests
- **Test-First de CLI**:
  - Pruebas de integración ejecutando el binario contra mocks de filesystem y variables de entorno.
  - Pruebas de argumentos inválidos, flags contradictorios y flujos vacíos.
- **Métricas de Calidad**:
  - Complejidad Ciclomática $\le 10$ por comando o función auxiliar.
  - Cobertura de tests $\ge 90\%$.
  - Índice CRAP $< 30$.
