#!/usr/bin/env python3
import os
import sys
import yaml
import argparse
import subprocess
from datetime import datetime

# Reconfigure stdout/stderr to UTF-8 on Windows to avoid UnicodeEncodeErrors
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# Setup paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
CURRENT_DEV_PATH = os.path.join(SCRIPT_DIR, "current-dev.yaml")
STORY_DEV_PATH = os.path.join(SCRIPT_DIR, "story-dev.yaml")
ERROR_LOG_PATH = os.path.join(SCRIPT_DIR, "error-log.yaml")

def get_iso_now():
    return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

def load_yaml(filepath):
    if not os.path.exists(filepath):
        print(f"Error: {filepath} no existe.", file=sys.stderr)
        sys.exit(1)
    with open(filepath, "r", encoding="utf-8") as f:
        try:
            return yaml.safe_load(f) or {}
        except yaml.YAMLError as e:
            print(f"Error al parsear {filepath}: {e}", file=sys.stderr)
            sys.exit(1)

def save_yaml(filepath, data):
    with open(filepath, "w", encoding="utf-8") as f:
        yaml.safe_dump(data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

def find_function(current_dev, f_id):
    functions = current_dev.get("project", {}).get("functions", {})
    if f_id not in functions:
        print(f"Error: Función {f_id} no encontrada en current-dev.yaml.", file=sys.stderr)
        sys.exit(1)
    return functions[f_id]

# --- SUBCOMMANDS ---

def cmd_status(args):
    current_dev = load_yaml(CURRENT_DEV_PATH)
    project = current_dev.get("project", {})
    meta = project.get("meta", {})
    functions = project.get("functions", {}) or {}
    
    print("\n" + "="*50)
    print(f"📋 ESTADO DE AGENTBOX")
    print("="*50)
    print(f"Proyecto:  {meta.get('name') or 'Sin nombre'}")
    print(f"Lenguaje:  {meta.get('language') or 'No especificado'}")
    print(f"Loop Mode: {meta.get('loop_mode')}")
    print("-"*50)
    
    counts = {"Waiting": 0, "In Progress": 0, "Testing Pending": 0, "Completed": 0}
    for f in functions.values():
        status = f.get("status", "Waiting")
        if status in counts:
            counts[status] += 1
            
    print("Funciones en desarrollo:")
    for status, count in counts.items():
        color = ""
        if status == "Waiting": color = "⏳"
        elif status == "In Progress": color = "🔄"
        elif status == "Testing Pending": color = "🧪"
        elif status == "Completed": color = "✅"
        print(f"  {color} {status:<15}: {count}")
        
    print("-"*50)
    
    # Encontrar la función de mayor prioridad activa o en espera
    active_functions = []
    for f_id, f in functions.items():
        status = f.get("status")
        if status in ["Waiting", "In Progress", "Testing Pending"]:
            active_functions.append((f.get("priority", 999), f_id, f))
            
    if active_functions:
        active_functions.sort()
        priority, f_id, f = active_functions[0]
        print(f"👉 PRÓXIMA FUNCIÓN A DESARROLLAR:")
        print(f"  ID:         {f_id}")
        print(f"  Nombre:     {f.get('name')}")
        print(f"  Prioridad:  {priority}")
        print(f"  Estado:     {f.get('status')}")
        print(f"  Descripción: {f.get('specifications', {}).get('description')}")
        
        tests = f.get("tests", {}) or {}
        if tests:
            print(f"  Pruebas ({len(tests)}):")
            for t_id, t in tests.items():
                res = t.get("result") or ""
                res_str = f" [{res}]" if res else ""
                print(f"    - {t_id} ({t.get('type')}): {t.get('status')}{res_str}")
    else:
        print("🎉 ¡Todas las funciones han sido completadas!")
    print("="*50 + "\n")

def cmd_start(args):
    current_dev = load_yaml(CURRENT_DEV_PATH)
    f = find_function(current_dev, args.f_id)
    
    f["status"] = "In Progress"
    if not f.get("timestamps"):
        f["timestamps"] = {}
    f["timestamps"]["started"] = get_iso_now()
    
    current_dev["project"]["meta"]["updated"] = get_iso_now()
    save_yaml(CURRENT_DEV_PATH, current_dev)
    print(f"✅ Función {args.f_id} iniciada. Estado cambiado a 'In Progress'.")

def cmd_test_ready(args):
    current_dev = load_yaml(CURRENT_DEV_PATH)
    f = find_function(current_dev, args.f_id)
    
    f["status"] = "Testing Pending"
    if not f.get("timestamps"):
        f["timestamps"] = {}
    f["timestamps"]["testing_started"] = get_iso_now()
    
    current_dev["project"]["meta"]["updated"] = get_iso_now()
    save_yaml(CURRENT_DEV_PATH, current_dev)
    print(f"✅ Función {args.f_id} lista para pruebas. Estado cambiado a 'Testing Pending'.")

def cmd_complete(args):
    current_dev = load_yaml(CURRENT_DEV_PATH)
    f = find_function(current_dev, args.f_id)
    
    # Validar pruebas si las hay
    tests = f.get("tests", {}) or {}
    failing_tests = [t_id for t_id, t in tests.items() if t.get("status") != "Pass"]
    if failing_tests and not args.force:
        print(f"⚠️ Advertencia: Hay pruebas que no han pasado ({', '.join(failing_tests)}).", file=sys.stderr)
        print("Usa --force para ignorar y archivar de todos modos.", file=sys.stderr)
        sys.exit(1)
        
    story_dev = load_yaml(STORY_DEV_PATH)
    if "story" not in story_dev:
        story_dev["story"] = {"meta": {}, "completed_functions": {}}
    if "completed_functions" not in story_dev["story"]:
        story_dev["story"]["completed_functions"] = {}
        
    # Actualizar timestamps y duración
    if not f.get("timestamps"):
        f["timestamps"] = {}
    f["timestamps"]["completed"] = get_iso_now()
    
    start_str = f["timestamps"].get("started")
    end_str = f["timestamps"]["completed"]
    duration = 0
    if start_str and end_str:
        try:
            start_dt = datetime.strptime(start_str, "%Y-%m-%dT%H:%M:%SZ")
            end_dt = datetime.strptime(end_str, "%Y-%m-%dT%H:%M:%SZ")
            duration = int((end_dt - start_dt).total_seconds() / 60)
        except Exception:
            pass
    
    # Archivar en story-dev en formato ultra-compacto
    compact_f = {
        "name": f.get("name"),
        "location": args.location or f.get("implementation", {}).get("file") or "",
        "notes": args.notes or f.get("implementation", {}).get("notes") or "",
        "duration_minutes": duration
    }
    
    story_dev["story"]["completed_functions"][args.f_id] = compact_f
    
    # Eliminar de current-dev
    del current_dev["project"]["functions"][args.f_id]
    
    current_dev["project"]["meta"]["updated"] = get_iso_now()
    
    save_yaml(CURRENT_DEV_PATH, current_dev)
    save_yaml(STORY_DEV_PATH, story_dev)
    
    print(f"🎉 Función {args.f_id} completada con éxito y archivada en story-dev.yaml. (Duración: {duration} min).")

def cmd_fail(args):
    current_dev = load_yaml(CURRENT_DEV_PATH)
    f = find_function(current_dev, args.f_id)
    
    # Actualizar el estado del test
    tests = f.setdefault("tests", {})
    if args.test_id not in tests:
        tests[args.test_id] = {"type": "unit", "status": "Fail", "result": args.cause}
    else:
        tests[args.test_id]["status"] = "Fail"
        tests[args.test_id]["result"] = args.cause
        
    f["status"] = "In Progress"
    
    # Registrar el error en error-log.yaml
    error_log = load_yaml(ERROR_LOG_PATH)
    if "error_log" not in error_log:
        error_log["error_log"] = {"meta": {}, "errors": {}}
    if "errors" not in error_log["error_log"]:
        error_log["error_log"]["errors"] = {}
        
    error_id = f"E{len(error_log['error_log']['errors']) + 1:03d}"
    
    error_entry = {
        "function_id": args.f_id,
        "function_name": f.get("name"),
        "test_id": args.test_id,
        "test_type": tests[args.test_id].get("type", "unit"),
        "datetime": get_iso_now(),
        "cause": args.cause,
        "effect": args.effect,
        "context": {
            "environment": "dev",
            "input_data": "",
            "system_state": "",
            "stack_trace": ""
        },
        "structural_impact": "requires_spec_change" if not args.fast_track else "none",
        "resolution": {
            "status": "in_progress" if args.fast_track else "open",
            "solution_applied": "",
            "resolved_at": "",
            "resolved_by": ""
        }
    }
    
    error_log["error_log"]["errors"][error_id] = error_entry
    
    # Vincular error a la función
    err_list = f.setdefault("error_log", [])
    if error_id not in err_list:
        err_list.append(error_id)
        
    current_dev["project"]["meta"]["updated"] = get_iso_now()
    
    save_yaml(CURRENT_DEV_PATH, current_dev)
    save_yaml(ERROR_LOG_PATH, error_log)
    
    fast_str = "[FAST-TRACK] " if args.fast_track else ""
    print(f"❌ Registrado error {error_id} {fast_str}para la función {args.f_id} (test {args.test_id}).")

def cmd_pack(args):
    current_dev = load_yaml(CURRENT_DEV_PATH)
    f = find_function(current_dev, args.f_id)
    
    # 1. Leer el prompt del agente
    agent_prompt_path = os.path.join(SCRIPT_DIR, "agents", f"{args.agent}.md")
    if not os.path.exists(agent_prompt_path):
        print(f"Error: No se encontró la plantilla de agente en {agent_prompt_path}", file=sys.stderr)
        sys.exit(1)
        
    with open(agent_prompt_path, "r", encoding="utf-8") as file:
        agent_instructions = file.read()
        
    # 2. Leer guidelines.yaml si existe
    guidelines_path = os.path.join(SCRIPT_DIR, "guidelines.yaml")
    guidelines_yaml = ""
    if os.path.exists(guidelines_path):
        with open(guidelines_path, "r", encoding="utf-8") as file:
            guidelines_yaml = file.read()
            
    # 3. Leer completed functions de story-dev.yaml como índice compacto
    story_dev = load_yaml(STORY_DEV_PATH)
    completed_functions = story_dev.get("story", {}).get("completed_functions", {})
    completed_index_yaml = yaml.dump(completed_functions, default_flow_style=False, sort_keys=False, allow_unicode=True) if completed_functions else "Ninguna función completada aún."

    # 4. Extraer el contexto mínimo de la función
    isolated_f_data = {
        args.f_id: {
            "name": f.get("name"),
            "priority": f.get("priority"),
            "status": f.get("status"),
            "specifications": f.get("specifications"),
            "dependencies": f.get("dependencies"),
            "skills_required": f.get("skills_required"),
            "implementation": f.get("implementation"),
            "tests": f.get("tests"),
            "error_log": f.get("error_log")
        }
    }
    
    context_yaml = yaml.dump(isolated_f_data, default_flow_style=False, sort_keys=False, allow_unicode=True)
    
    # 5. Armar la Batuta de Traspaso
    batuta_footer = f"""
---
🔁 BATUTA → {args.agent.upper()}
Función: {args.f_id} — {f.get('name')}
Archivo XML/YAML actualizado: current-dev.yaml (status cambiado a "{f.get('status')}")
Skills a revisar: {f.get('skills_required', [])}
Contexto adjunto: Especificaciones detalladas y plan de pruebas aislados de {args.f_id}.
---
"""
    
    # 6. Combinar y escribir en active_prompt.md
    active_prompt_path = os.path.join(SCRIPT_DIR, "active_prompt.md")
    with open(active_prompt_path, "w", encoding="utf-8") as ap_file:
        if guidelines_yaml:
            ap_file.write("# DIRECTRICES GLOBALES DEL PROYECTO\n\n")
            ap_file.write("```yaml\n")
            ap_file.write(guidelines_yaml.strip())
            ap_file.write("\n```\n\n" + "="*80 + "\n\n")
            
        ap_file.write(f"# INSTRUCCIONES DEL ROL ({args.agent.upper()})\n\n")
        ap_file.write(agent_instructions.strip())
        ap_file.write("\n\n" + "="*80 + "\n\n")
        
        ap_file.write("# ÍNDICE DE FUNCIONES YA COMPLETADAS (MAPA DE UBICACIONES)\n\n")
        ap_file.write("```yaml\n")
        ap_file.write(completed_index_yaml.strip())
        ap_file.write("\n```\n\n" + "="*80 + "\n\n")
        
        ap_file.write(f"# CONTEXTO DE LA FUNCIÓN ACTIVA ({args.f_id})\n\n")
        ap_file.write("```yaml\n")
        ap_file.write(context_yaml)
        ap_file.write("```\n")
        ap_file.write("\n" + batuta_footer)
        
    print(f"📦 [PROMPT PACKAGER] ¡Listo!")
    print(f"  Prompt activo generado en: {active_prompt_path}")
    print(f"  Para trabajar en {args.f_id}, carga/lee este archivo para reducir el uso de tokens en un ~90%.")

def cmd_run_tests(args):
    current_dev = load_yaml(CURRENT_DEV_PATH)
    f = find_function(current_dev, args.f_id)
    
    print(f"🚀 Ejecutando suite de pruebas para {args.f_id}...")
    print(f"Comando: {args.command}\n")
    
    # Cambiar al root del proyecto para ejecutar el test
    original_cwd = os.getcwd()
    os.chdir(PROJECT_ROOT)
    
    try:
        # Ejecutar tests capturando salida
        result = subprocess.run(args.command, shell=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
            
        success = (result.returncode == 0)
        
        # Mapear los resultados en el YAML
        tests = f.setdefault("tests", {})
        for t_id, t in tests.items():
            # Si el test pasa globalmente, asumimos Pass temporalmente a menos que la consola muestre fallos puntuales
            # Una automatización más fina puede parsear salidas específicas de pytest/jest
            if success:
                t["status"] = "Pass"
                t["result"] = "Ejecutado con éxito (código de salida 0)"
            else:
                # Comprobación básica si este test individual falló
                if t_id.lower() in result.stdout.lower() or t_id.lower() in result.stderr.lower():
                    t["status"] = "Fail"
                    t["result"] = "Fallo detectado en consola"
                else:
                    t["status"] = "Fail"
                    t["result"] = "Error general en la ejecución"
                    
        # Actualizar estado de la función
        if success:
            f["status"] = "Testing Pending"
            print(f"\n✅ ¡Pruebas completadas exitosamente!")
        else:
            f["status"] = "In Progress"
            print(f"\n❌ Error: Algunas pruebas han fallado (código de salida {result.returncode}).")
            
        current_dev["project"]["meta"]["updated"] = get_iso_now()
        save_yaml(CURRENT_DEV_PATH, current_dev)
        
    finally:
        os.chdir(original_cwd)

# --- CLI ARGUMENT PARSING ---

def main():
    parser = argparse.ArgumentParser(description="Orquestador CLI de AgentBox")
    subparsers = parser.add_subparsers(dest="command", help="Comandos disponibles")
    
    # status
    subparsers.add_parser("status", help="Muestra el panel de control y el estado actual del arnés.")
    
    # start
    p_start = subparsers.add_parser("start", help="Marca una función como iniciada y activa.")
    p_start.add_argument("f_id", help="ID de la función (ej. F001)")
    
    # test-ready
    p_tr = subparsers.add_parser("test-ready", help="Marca una función como lista para que el Tester la valide.")
    p_tr.add_argument("f_id", help="ID de la función")
    
    # complete
    p_comp = subparsers.add_parser("complete", help="Valida pruebas, archiva la función en story-dev y calcula tiempos.")
    p_comp.add_argument("f_id", help="ID de la función")
    p_comp.add_argument("--location", help="Ubicación de la función (ej. src/auth.ts:15-48)", default="")
    p_comp.add_argument("--notes", help="Observaciones o notas del desarrollo", default="")
    p_comp.add_argument("--force", action="store_true", help="Fuerza completar la función ignorando tests pendientes/fallidos.")
    
    # fail
    p_fail = subparsers.add_parser("fail", help="Registra el fallo de una prueba y genera una entrada en el log de errores.")
    p_fail.add_argument("f_id", help="ID de la función")
    p_fail.add_argument("--test-id", required=True, help="ID del test fallido (ej. T001-U)")
    p_fail.add_argument("--cause", required=True, help="Causa del error")
    p_fail.add_argument("--effect", required=True, help="Efecto visible o comportamiento incorrecto")
    p_fail.add_argument("--fast-track", action="store_true", help="Indica si es un error simple para corrección directa del Implementer.")
    
    # pack
    p_pack = subparsers.add_parser("pack", help="Genera un prompt consolidado aislando el contexto de una única función.")
    p_pack.add_argument("agent", choices=["leader", "specifier", "planner", "trapper", "implementer", "tester"], help="Nombre del subagente")
    p_pack.add_argument("f_id", help="ID de la función activa")
    
    # run-tests
    p_rt = subparsers.add_parser("run-tests", help="Ejecuta comandos de pruebas reales y actualiza sus estados en YAML.")
    p_rt.add_argument("f_id", help="ID de la función")
    p_rt.add_argument("--command", required=True, help="Comando completo a ejecutar (ej: 'pytest' o 'npm test')")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
        
    cmds = {
        "status": cmd_status,
        "start": cmd_start,
        "test-ready": cmd_test_ready,
        "complete": cmd_complete,
        "fail": cmd_fail,
        "pack": cmd_pack,
        "run-tests": cmd_run_tests
    }
    
    cmds[args.command](args)

if __name__ == "__main__":
    main()
