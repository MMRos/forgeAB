import io
import os
import urllib.request
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import soundfile as sf

app = FastAPI(title="Ptah Kokoro TTS Server")

# Habilitar CORS para permitir peticiones desde React (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "kokoro-v0_19.onnx")
VOICES_PATH = os.path.join(BASE_DIR, "voices.json")

MODEL_URL = "https://github.com/thebloke/kokoro-onnx/releases/download/v0.19/kokoro-v0_19.onnx"
VOICES_URL = "https://github.com/thebloke/kokoro-onnx/releases/download/v0.19/voices.json"

kokoro_instance = None

def download_file(url, destination):
    if not os.path.exists(destination):
        print(f"Descargando archivo de modelo Kokoro: {os.path.basename(destination)}...")
        urllib.request.urlretrieve(url, destination)
        print(f"Descarga completada: {os.path.basename(destination)}")

def get_kokoro():
    global kokoro_instance
    if kokoro_instance is None:
        from kokoro_onnx import Kokoro
        download_file(MODEL_URL, MODEL_PATH)
        download_file(VOICES_URL, VOICES_PATH)
        print("Cargando modelo Kokoro en memoria...")
        kokoro_instance = Kokoro(MODEL_PATH, VOICES_PATH)
        print("Modelo Kokoro cargado correctamente en http://localhost:8880")
    return kokoro_instance

class SpeechRequest(BaseModel):
    model: str = "kokoro"
    input: str
    voice: str = "af_sarah"
    speed: float = 1.0
    response_format: str = "mp3"

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "server": "Ptah Kokoro TTS Local Server",
        "endpoint": "/v1/audio/speech"
    }

@app.post("/v1/audio/speech")
def generate_speech(req: SpeechRequest):
    if not req.input or not req.input.strip():
        raise HTTPException(status_code=400, detail="El campo 'input' no puede estar vacío.")
    try:
        kok = get_kokoro()
        available_voices = kok.get_voices()
        voice_name = req.voice if req.voice in available_voices else (available_voices[0] if available_voices else "af_sarah")
        
        # Generar audio binario con Kokoro ONNX
        samples, sample_rate = kok.create(
            req.input,
            voice=voice_name,
            speed=req.speed,
            lang="es-es"
        )
        
        # Convertir a buffer binario WAV/MP3
        buffer = io.BytesIO()
        sf.write(buffer, samples, sample_rate, format='WAV')
        buffer.seek(0)
        
        return Response(content=buffer.read(), media_type="audio/wav")
    except Exception as e:
        print("Error al sintetizar audio:", e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Iniciando servidor de Voz IA Kokoro TTS en http://localhost:8880...")
    uvicorn.run(app, host="0.0.0.0", port=8880)
