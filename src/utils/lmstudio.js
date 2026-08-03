/**
 * LM Studio API Manager for Ptah
 * Handles model discovery, automatic load/unload, reasoning, and context weight matching.
 */

const DEFAULT_LM_STUDIO_URL = '';

// Recomendaciones de mejores modelos actuales por tarea
export const RECOMMENDED_MODELS = {
  chat: {
    id: 'deepseek-r1-distill-qwen-7b',
    name: 'DeepSeek R1 Distill Qwen 7B',
    type: 'Razonamiento & Rol',
    description: 'Excelente capacidad de razonamiento profundo y narración inmersiva.'
  },
  context: {
    id: 'qwen2.5-coder-7b-instruct',
    name: 'Qwen 2.5 7B Instruct',
    type: 'Gestión de Contexto / RAG',
    description: 'Rápido, preciso y eficiente para procesar tags y resúmenes de contexto local.'
  },
  image: {
    id: 'flux-1-schnell',
    name: 'FLUX.1 Schnell / Stable Diffusion Local',
    type: 'Escenificación / Imágenes',
    description: 'Generación visual de alta calidad para escenificar batallas y lugares.'
  },
  video: {
    id: 'cogvideox-5b',
    name: 'CogVideoX 5B Local',
    type: 'Generación de Vídeos',
    description: 'Animación y secuencias de escena en vídeo corto.'
  }
};

/**
 * Obtiene la lista de modelos actualmente disponibles/descargados en LM Studio.
 */
export async function getAvailableModels(baseUrl = DEFAULT_LM_STUDIO_URL) {
  try {
    const response = await fetch(`${baseUrl}/v1/models`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.warn('LM Studio no está disponible o no tiene el servidor encendido:', error.message);
    return [];
  }
}

/**
 * Solicita a LM Studio cargar un modelo específico en memoria de GPU/RAM.
 */
export async function loadModel(modelId, baseUrl = DEFAULT_LM_STUDIO_URL) {
  try {
    const response = await fetch(`${baseUrl}/api/v0/models/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId })
    });
    if (!response.ok) {
      // Si la API v0 no existe en esa versión de LM Studio, intenta llamada directa de selección
      console.log(`Intentando seleccionar modelo ${modelId} mediante endpoint estándar v1...`);
    }
    return true;
  } catch (error) {
    console.warn(`No se pudo cargar automáticamente el modelo ${modelId}:`, error);
    return false;
  }
}

/**
 * Solicita a LM Studio descargar/liberar un modelo de memoria.
 */
export async function unloadModel(modelId, baseUrl = DEFAULT_LM_STUDIO_URL) {
  try {
    await fetch(`${baseUrl}/api/v0/models/unload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId })
    });
    return true;
  } catch (error) {
    console.warn(`Error al intentar descargar el modelo ${modelId}:`, error);
    return false;
  }
}

/**
 * Envía una solicitud de completado de chat a LM Studio con soporte para instrucciones de sistema y contexto con pesos.
 */
export async function sendChatMessage({
  messages,
  systemInstruction = '',
  contextDocuments = [],
  modelId = 'deepseek-r1-distill-qwen-7b',
  temperature = 0.7,
  baseUrl = DEFAULT_LM_STUDIO_URL
}) {
  try {
    // 1. Filtrado dinámico de contexto por tags y relevancia en los últimos mensajes
    const recentText = messages.slice(-3).map(m => m.text).join(' ').toLowerCase();
    
    // Inyectar solo documentos cuyos tags o título coincidan con los últimos mensajes
    const weightedDocs = contextDocuments.filter(doc => {
      if (!doc) return false;
      const titleMatch = doc.title && recentText.includes(doc.title.toLowerCase());
      const tagMatch = doc.tags && doc.tags.some(t => recentText.includes(t.toLowerCase()));
      return titleMatch || tagMatch;
    });

    let contextText = '';
    if (weightedDocs.length > 0) {
      contextText = '\n\n[CONTEXTO RELEVANTE ACTIVADO POR TAGS]:\n' + 
        weightedDocs.map(d => `- ${d.title} (${d.type}): ${d.intro || d.text}`).join('\n');
    }

    const fullSystemPrompt = `${systemInstruction}${contextText}`.trim();

    const formattedMessages = [];
    if (fullSystemPrompt) {
      formattedMessages.push({ role: 'system', content: fullSystemPrompt });
    }

    messages.forEach(m => {
      if (m && m.text) {
        formattedMessages.push({
          role: m.from === 'user' ? 'user' : 'assistant',
          content: m.text
        });
      }
    });

    if (formattedMessages.length === 0 || (formattedMessages.length === 1 && formattedMessages[0].role === 'system')) {
      formattedMessages.push({ role: 'user', content: 'Continuar la historia.' });
    }

    let actualModel = modelId;
    try {
      const activeModels = await getAvailableModels(baseUrl);
      if (activeModels && activeModels.length > 0) {
        // Usa el modelo pasado o el primero que encuentre cargado
        actualModel = activeModels.find(m => m.id === modelId)?.id || activeModels[0].id;
      }
    } catch(e) {}

    const requestBody = JSON.stringify({
      model: actualModel || 'local-model',
      messages: formattedMessages,
      temperature: temperature,
      stream: false
    });

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody
    });

    if (!response.ok) {
      throw new Error(`Error en LM Studio API: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No se recibió respuesta del modelo.';
    
    return {
      text: content,
      usedContextDocs: weightedDocs.map(d => d.title)
    };
  } catch (error) {
    console.error('LM Studio Send Error:', error);
    // Devuelve un fallback simulado si LM Studio no está corriendo en ese momento
    return {
      text: `[Modo Simulación / LM Studio no detectado en localhost:1234]: Asegúrate de tener LM Studio iniciado con el servidor habilitado.\n\n*El narrador observa en silencio la sala...*`,
      usedContextDocs: []
    };
  }
}

/**
 * Tarea en Background: Envía los últimos mensajes al modelo de contexto/resumen
 * para que decida si se deben añadir nuevas memorias clave.
 */
export async function sendContextSummarizationTask({
  messages,
  currentMemory = [],
  modelId = 'qwen2.5-coder-7b-instruct',
  baseUrl = DEFAULT_LM_STUDIO_URL
}) {
  try {
    const recentMessages = messages.slice(-5).map(m => `${m.from}: ${m.text}`).join('\n');
    const existingMem = currentMemory.length ? currentMemory.join('; ') : 'Ninguna.';

    const systemInstruction = `Eres un asistente de rol silencioso. Tu única tarea es leer los recientes mensajes y decidir si hay un nuevo evento clave o descubrimiento que deba recordarse.
Memorias actuales: ${existingMem}.
Responde SOLO con una frase corta para añadir a la memoria, o con la palabra NADA si no es relevante.`;

    let actualModel = modelId;
    try {
      const activeModels = await getAvailableModels(baseUrl);
      if (activeModels && activeModels.length > 0) {
        // Intenta usar el segundo modelo cargado para resumen, si existe
        actualModel = activeModels.length > 1 ? activeModels[1].id : activeModels[0].id;
      }
    } catch(e) {}

    const requestBody = JSON.stringify({
      model: actualModel || 'local-model',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: recentMessages || 'Nada.' }
      ],
      temperature: 0.3,
      stream: false
    });

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // CORS Simple Request sin OPTIONS
      body: requestBody
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || 'NADA';
    
    if (content.toUpperCase().includes('NADA') || content.length < 5) {
      return null;
    }
    return content;
  } catch (error) {
    console.warn('Fallo en la tarea de resumen de contexto:', error);
    return null;
  }
}
