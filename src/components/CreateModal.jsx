import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import ConnectionSelector from './ConnectionSelector';
import ImageCropperModal from './ImageCropperModal';
import '../pages/create.css';

const CARD_TYPES = ['Historia', 'Personaje', 'Raza', 'Facción', 'Regla', 'Criatura', 'Objeto', 'Lugar', 'Otros'];
const CATEGORIES = ['Aventura', 'Comedia', 'Terror', 'Drama', 'Ciencia ficción', 'Misterio'];

export default function CreateModal({
  isOpen = false,
  onClose = () => { },
  initialType = 'Historia',
  appData = {},
  onSaveItem = () => { }
}) {
  const [itemType, setItemType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [intro, setIntro] = useState('');
  const [text, setText] = useState('');
  const [cover, setCover] = useState('');
  const [nsfw, setNsfw] = useState(false);
  const [tags, setTags] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [isScenario, setIsScenario] = useState(false);

  // Crop state inside modal
  const [cropSrc, setCropSrc] = useState('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      alert('El nombre o título es obligatorio.');
      return;
    }

    const newItem = {
      id: `card-${Date.now()}`,
      type: itemType,
      title: title.trim(),
      intro: intro.trim(),
      text: text.trim(),
      cover: cover.trim(),
      nsfw,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      connectedCards: selectedCards,
      createdAt: new Date().toISOString()
    };

    let scenarioData = null;
    if (isScenario) {
      scenarioData = {
        id: `scenario-from-card-${Date.now()}`,
        title: title.trim(),
        category,
        intro: intro.trim() || text.trim().substring(0, 80) + '...',
        cover: cover.trim(),
        presentation: '',
        baseContext: `[${itemType}]: ${text.trim()}`,
        aiInstructions: '',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        nsfw,
        cards: [newItem.id],
        narrator: null,
        createdAt: new Date().toISOString()
      };
    }

    onSaveItem({ type: 'card', data: newItem, createScenarioAlso: scenarioData });
    onClose();
  };

  return (
    <div className="char-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 1200 }}>
      <div className="char-modal" style={{
        width: itemType === 'Escenario' ? '80vw' : '100%',
        maxWidth: itemType === 'Escenario' ? '1200px' : '580px',
        maxHeight: '88vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <button className="char-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h3 style={{ margin: '0 0 14px 0', color: '#ffffff' }}>Crear elemento (Pop-up)</h3>

        <div className="field-group" style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>Tipo de elemento</label>
          <select
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', background: '#1e1e2c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff' }}
          >
            {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="checkbox-item" style={{ marginBottom: '12px' }}>
          <input type="checkbox" id="modalCardScenarioCheck" checked={isScenario} onChange={e => setIsScenario(e.target.checked)} />
          <label htmlFor="modalCardScenarioCheck" style={{ cursor: 'pointer', color: '#ffd36b', fontWeight: '600' }}>Convertir y crear como Escenario jugable también</label>
        </div>

        <div className="field-group" style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>Nombre / Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del escenario o tarjeta..."
            style={{ width: '100%', padding: '8px 10px', background: '#1e1e2c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff' }}
          />
        </div>

        {itemType === 'Escenario' && (
          <div className="field-group" style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: '#1e1e2c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff' }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <div className="field-group" style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>Imagen de portada (URL o Local)</label>
          <input
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', padding: '8px 10px', background: '#1e1e2c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff' }}
          />
        </div>

        <div className="field-group" style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>Subir imagen de portada</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  setCropSrc(reader.result);
                  setIsCropperOpen(true);
                }
              };
              reader.readAsDataURL(file);
            }}
            style={{ color: '#fff', fontSize: '0.8rem' }}
          />
        </div>

        <div className="checkbox-item" style={{ marginBottom: '14px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <input type="checkbox" id="modalNsfwCheck" checked={nsfw} onChange={(e) => setNsfw(e.target.checked)} />
          <label htmlFor="modalNsfwCheck" style={{ cursor: 'pointer', color: '#ffd36b', fontWeight: '600', fontSize: '0.85rem' }}>Contenido NSFW (+18 / Adultos)</label>
        </div>

        <div className="field-group" style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>Introducción (Máx. 200 caracteres)</label>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={2}
            maxLength={200}
            style={{ width: '100%', padding: '8px 10px', background: '#1e1e2c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff' }}
          />
        </div>

        <div className="field-group" style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>Descripción / Contexto base</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px 10px', background: '#1e1e2c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff' }}
          />
        </div>

        <div className="field-group" style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>Etiquetas (Tags)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="mision, oscuro, magia"
            style={{ width: '100%', padding: '8px 10px', background: '#1e1e2c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff' }}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <ConnectionSelector
            availableCards={appData.cards || []}
            selectedCardIds={selectedCards}
            onSelectCard={(id) => setSelectedCards(prev => [...prev, id])}
            onRemoveCard={(id) => setSelectedCards(prev => prev.filter(cId => cId !== id))}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSave} style={{ background: 'linear-gradient(90deg, #ffd36b, #ff9f6b)', border: 'none', color: '#000', fontWeight: '700', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FontAwesomeIcon icon={faSave} /> Guardar
          </button>
        </div>

        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={cropSrc}
          aspectRatio={itemType === 'Personaje' ? 3 / 4 : 16 / 9}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={(croppedImage) => setCover(croppedImage)}
        />
      </div>
    </div>
  );
}
