import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUndo, 
  faCodeBranch, 
  faEdit, 
  faHistory, 
  faImage, 
  faPaperPlane, 
  faCheck, 
  faTimes,
  faPlay,
  faBold,
  faItalic,
  faQuoteRight
} from '@fortawesome/free-solid-svg-icons';
import { sendChatMessage } from '../utils/lmstudio';
import { saveChatToFolder } from '../utils/storage';
import { addChat } from '../utils/db';
import StagingModal from './StagingModal';
import './chats.css';

function FormattedMessageText({ text }) {
  if (!text) return null;
  const parts = text.split(/(".*?"|\*\*.*?\*\*|\*.*?\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('"') && part.endsWith('"')) return <span key={i} className="msg-dialogue">{part}</span>;
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="msg-action">{part.slice(1, -1)}</em>;
        return part;
      })}
    </span>
  );
}

export default function ChatView({ chat, folderHandle, onBranchChat }) {
  const [messages, setMessages] = useState(chat?.messages || []);
  const [inputMsg, setInputMsg] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [isStagingOpen, setIsStagingOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setMessages(chat?.messages || []);
  }, [chat]);

  const persistMessages = async (nextMsgs) => {
    setMessages(nextMsgs);
    const updatedChat = { ...chat, messages: nextMsgs };
    try { await addChat(updatedChat); } catch(err) { console.warn('IndexedDB save err:', err); }
    if (folderHandle) {
      try { await saveChatToFolder(updatedChat, folderHandle); } catch (err) {}
    }
  };

  const handleSend = async (overrideText = null) => {
    const textToSend = overrideText !== null ? overrideText : inputMsg;
    if ((!textToSend.trim() && overrideText === null) || isSending) return;

    const newMsg = { from: 'user', text: textToSend.trim() || '...', timestamp: new Date().toISOString() };
    const nextMsgs = textToSend.trim() ? [...messages, newMsg] : messages;
    setMessages(nextMsgs);
    if (overrideText === null) setInputMsg('');
    setIsSending(true);

    try {
      const memoryContext = (chat.memoryCards || []).map(m => `[Memoria]: ${m}`).join('\n');
      const systemPrompt = `Escenario: ${chat.scenario}. ${chat.constantPrompt ? `ÓRDENES CONSTANTES: ${chat.constantPrompt}.` : ''} 
INSTRUCCIONES DE FORMATO:
- Diálogos de personajes EXCLUSIVAMENTE entre comillas dobles: "Hola".
- Acciones, narrativa y pensamientos EXCLUSIVAMENTE entre asteriscos: *Miró hacia la puerta*.
- Escribe en un estilo literario e inmersivo.
${memoryContext}`.trim();

      const res = await sendChatMessage({
        messages: nextMsgs,
        systemInstruction: systemPrompt,
        contextDocuments: chat.contextDocuments || []
      });

      const aiMsg = { from: 'ai', text: res.text || 'Sin respuesta.', timestamp: new Date().toISOString() };
      const finalMsgs = [...nextMsgs, aiMsg];
      await persistMessages(finalMsgs);

    } catch (err) {
      console.error("Error al enviar chat:", err);
      const errorMsg = { from: 'ai', text: `[Error de conexión con IA]: ${err.message || 'LM Studio no accesible.'}`, timestamp: new Date().toISOString() };
      await persistMessages([...nextMsgs, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Función "Continuar" para pedir a la IA que prosiga la narrativa sin mensaje nuevo de usuario
  const handleContinue = async () => {
    if (isSending) return;
    setIsSending(true);

    try {
      const memoryContext = (chat.memoryCards || []).map(m => `[Memoria]: ${m}`).join('\n');
      const systemPrompt = `Escenario: ${chat.scenario}. Continúa la narración desde el punto exacto donde quedó. ${chat.constantPrompt ? `ÓRDENES CONSTANTES: ${chat.constantPrompt}.` : ''}
INSTRUCCIONES DE FORMATO:
- Diálogos de personajes EXCLUSIVAMENTE entre comillas dobles: "Hola".
- Acciones, narrativa y pensamientos EXCLUSIVAMENTE entre asteriscos: *Miró hacia la puerta*.
- Escribe en un estilo literario e inmersivo.
${memoryContext}`.trim();

      const res = await sendChatMessage({
        messages: messages,
        systemInstruction: systemPrompt,
        contextDocuments: chat.contextDocuments || []
      });

      const aiMsg = { from: 'ai', text: res.text || 'Sin respuesta.', timestamp: new Date().toISOString() };
      const finalMsgs = [...messages, aiMsg];
      await persistMessages(finalMsgs);

    } catch (err) {
      console.error("Error al continuar chat:", err);
      const errorMsg = { from: 'ai', text: `[Error de conexión con IA]: ${err.message || 'LM Studio no accesible.'}`, timestamp: new Date().toISOString() };
      await persistMessages([...messages, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Insertar formateadores rápido ("...", *...*, **...**) en el textarea
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const insertFormatting = (symbol) => {
    let wrap = '';
    if (symbol === 'quote') wrap = '"';
    if (symbol === 'italic') wrap = '*';
    if (symbol === 'bold') wrap = '**';

    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      const text = inputMsg;
      const before = text.substring(0, start);
      const selected = text.substring(start, end);
      const after = text.substring(end);
      
      const newText = before + wrap + selected + wrap + after;
      setInputMsg(newText);
      
      setTimeout(() => {
        inputRef.current.focus();
        const newPos = start + wrap.length + selected.length;
        if (selected.length === 0) {
           inputRef.current.setSelectionRange(newPos, newPos);
        } else {
           inputRef.current.setSelectionRange(start + wrap.length, newPos);
        }
      }, 0);
    }
  };

  return (
    <div className="chat-container">
      {/* Historial de Mensajes Principal (Ocupa todo el alto disponible) */}
      <div className="chat-messages" ref={chatRef}>
        {messages.length === 0 && (
          <div className="chat-empty-intro">
            <h3>{chat.scenario || 'Escenario'}</h3>
            <p>La aventura comienza. Escribe tu primera acción o diálogo abajo.</p>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-message-bubble ${m.from === 'user' ? 'user' : 'ai'}`}>
            <div className="msg-header">
              <span className="msg-author">{m.from === 'user' ? 'Tú' : 'Narrador (IA)'}</span>
              <div className="msg-toolbar">
                <button title="Editar mensaje" onClick={() => { setEditingIndex(idx); setEditText(m.text); }}><FontAwesomeIcon icon={faEdit} /></button>
                <button title="Bifurcar chat aquí (Branch)" onClick={() => onBranchChat && onBranchChat(chat, messages.slice(0, idx + 1))}><FontAwesomeIcon icon={faCodeBranch} /></button>
                <button title="Rebobinar hasta aquí (Rewind)" onClick={() => {
                  if (window.confirm('¿Rebobinar chat?')) persistMessages(messages.slice(0, idx + 1));
                }}><FontAwesomeIcon icon={faHistory} /></button>
              </div>
            </div>

            {editingIndex === idx ? (
              <div className="msg-edit-box">
                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
                <div className="msg-edit-actions">
                  <button onClick={() => {
                    const next = [...messages];
                    next[idx].text = editText;
                    setEditingIndex(null);
                    persistMessages(next);
                  }}><FontAwesomeIcon icon={faCheck} /> Guardar</button>
                  <button onClick={() => setEditingIndex(null)}><FontAwesomeIcon icon={faTimes} /> Cancelar</button>
                </div>
              </div>
            ) : m.isImage ? (
              <div className="msg-image-container">
                <img src={m.imageUrl} alt="Escenificación" className="msg-staged-img" />
                <p className="msg-image-caption">{m.text}</p>
              </div>
            ) : (
              <div className="msg-body">
                <FormattedMessageText text={m.text} />
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="chat-message-bubble ai typing">
            <span className="typing-dots">*El narrador está procesando su respuesta...*</span>
          </div>
        )}
      </div>

      {/* ÁREA INFERIOR SIEMPRE FIJA ABAJO */}
      <div className="chat-bottom-dock">
        {/* Barra de Acciones y Formateadores Rápidos justo encima del Textarea */}
        <div className="chat-tools-bar">
          <div className="tools-left">
            <button type="button" className="tool-btn" title="Insertar Diálogo comillas" onClick={() => insertFormatting('quote')}>
              <FontAwesomeIcon icon={faQuoteRight} /> <span>"..."</span>
            </button>
            <button type="button" className="tool-btn" title="Insertar Acción cursiva" onClick={() => insertFormatting('italic')}>
              <FontAwesomeIcon icon={faItalic} /> <span>*...*</span>
            </button>
            <button type="button" className="tool-btn" title="Insertar Negrita" onClick={() => insertFormatting('bold')}>
              <FontAwesomeIcon icon={faBold} /> <span>**...**</span>
            </button>
          </div>

          <div className="tools-right">
            <button type="button" className="tool-btn action" title="Pedir a la IA que continúe" onClick={handleContinue} disabled={isSending}>
              <FontAwesomeIcon icon={faPlay} /> <span>Continuar</span>
            </button>
            <button type="button" className="tool-btn action" title="Rehacer última respuesta" onClick={() => handleSend('')} disabled={isSending}>
              <FontAwesomeIcon icon={faUndo} /> <span>Rehacer</span>
            </button>
            <button type="button" className="tool-btn action" title="Escenificar (Generar Imagen)" onClick={() => setIsStagingOpen(true)}>
              <FontAwesomeIcon icon={faImage} /> <span>Escenificar</span>
            </button>
            <button type="button" className="tool-btn action" title="Ramificar/Bifurcar chat" onClick={() => onBranchChat && onBranchChat(chat, messages)}>
              <FontAwesomeIcon icon={faCodeBranch} /> <span>Ramificar</span>
            </button>
          </div>
        </div>

        {/* Input de Mensajes con Lógica de Enter = Salto de línea / Shift+Enter = Enviar */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-textarea"
            placeholder='Escribe tu acción o diálogo... Usa "para hablar" o *para acciones*'
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  // Shift + Enter -> Enviar mensaje
                  e.preventDefault();
                  handleSend();
                }
                // Enter solo -> Salto de línea por defecto
              }
            }}
            rows={2}
          />
          <button className="chat-send-btn" title="Enviar (Shift + Enter)" onClick={() => handleSend()} disabled={isSending}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>

      <StagingModal 
        isOpen={isStagingOpen}
        onClose={() => setIsStagingOpen(false)}
        messages={messages}
        characters={chat.characters || []}
        onGenerateImage={(stagingData) => {
          const imageMsg = {
            from: 'ai',
            isImage: true,
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
            text: `[Escena generada]: ${stagingData.prompt}`,
            timestamp: new Date().toISOString()
          };
          persistMessages([...messages, imageMsg]);
        }}
      />
    </div>
  );
}
