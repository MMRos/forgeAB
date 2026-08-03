import React, { useEffect, useMemo, useState } from 'react';
import { loadAppData } from '../utils/storage';
import ConnectionSelector from '../components/ConnectionSelector';
import ImageCropperModal from '../components/ImageCropperModal';

const CARD_TYPES = ['Historia', 'Personaje', 'Raza', 'Facción', 'Regla', 'Criatura', 'Objeto', 'Lugar', 'Otros'];
const CATEGORIES = ['Aventura', 'Comedia', 'Terror', 'Drama', 'Ciencia ficción', 'Misterio'];

export default function Create({ appData, onUpdateAppData, onOpenScenario, onOpenCreateModal }) {
  const [data, setData] = useState(() => appData || loadAppData());
  const [mode, setMode] = useState('dashboard');
  const [, setStatus] = useState('');

  // Estado de recorte de imagen
  const [cropSrc, setCropSrc] = useState('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [targetCropField, setTargetCropField] = useState('scenario');

  useEffect(() => {
    if (appData) {
      setData(appData);
    }
  }, [appData]);



  const [scenarioTitle, setScenarioTitle] = useState('');
  const [scenarioCategory, setScenarioCategory] = useState(CATEGORIES[0]);
  const [scenarioIntro, setScenarioIntro] = useState('');
  const [scenarioCover, setScenarioCover] = useState('');
  const [scenarioPresentation, setScenarioPresentation] = useState('');
  const [scenarioBaseContext, setScenarioBaseContext] = useState('');
  const [scenarioAIInstructions, setScenarioAIInstructions] = useState('');
  const [scenarioTags, setScenarioTags] = useState('');
  const [scenarioNsfw, setScenarioNsfw] = useState(false);
  const [scenarioCards, setScenarioCards] = useState([]);
  const [scenarioNarrator, setScenarioNarrator] = useState('');

  const [cardType, setCardType] = useState(CARD_TYPES[0]);
  const [cardCustomType, setCardCustomType] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [cardIntro, setCardIntro] = useState('');
  const [cardText, setCardText] = useState('');
  const [cardCover, setCardCover] = useState('');
  const [cardAlbumInput, setCardAlbumInput] = useState('');
  const [cardAlbumUrls, setCardAlbumUrls] = useState([]);
  const [cardTags, setCardTags] = useState('');
  const [cardIsScenario, setCardIsScenario] = useState(false);

  const [narratorName, setNarratorName] = useState('');
  const [narratorBio, setNarratorBio] = useState('');
  const [narratorStyle, setNarratorStyle] = useState('');
  const [narratorRules, setNarratorRules] = useState('');
  const [narratorTone, setNarratorTone] = useState('');
  const [narratorRandomization, setNarratorRandomization] = useState('');

  const cardOptions = useMemo(() => CARD_TYPES, []);

  const resetScenarioForm = () => {
    setScenarioTitle('');
    setScenarioCategory(CATEGORIES[0]);
    setScenarioIntro('');
    setScenarioCover('');
    setScenarioPresentation('');
    setScenarioBaseContext('');
    setScenarioAIInstructions('');
    setScenarioTags('');
    setScenarioCards([]);
    setScenarioNarrator('');
    setStatus('Crea un escenario enlazando tarjetas y narrador.');
  };

  const resetCardForm = () => {
    setCardType(CARD_TYPES[0]);
    setCardCustomType('');
    setCardTitle('');
    setCardIntro('');
    setCardText('');
    setCardCover('');
    setCardAlbumInput('');
    setCardAlbumUrls([]);
    setCardTags('');
    setCardIsScenario(false);
    setStatus('Crea una tarjeta para usarla en escenarios.');
  };

  const resetNarratorForm = () => {
    setNarratorName('');
    setNarratorBio('');
    setNarratorStyle('');
    setNarratorRules('');
    setNarratorTone('');
    setNarratorRandomization('');
    setStatus('Crea un narrador y luego vincúlalo a un escenario.');
  };

  const showMode = (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'create-scenario') resetScenarioForm();
    if (nextMode === 'create-card') resetCardForm();
    if (nextMode === 'create-narrator') resetNarratorForm();
  };

  const saveScenario = () => {
    if (!scenarioTitle.trim() || !scenarioIntro.trim()) {
      setStatus('El título y la introducción del escenario son obligatorios.');
      return;
    }
    const newScenario = {
      id: `scenario-${Date.now()}`,
      title: scenarioTitle.trim(),
      category: scenarioCategory,
      intro: scenarioIntro.trim(),
      cover: scenarioCover.trim(),
      presentation: scenarioPresentation.trim(),
      baseContext: scenarioBaseContext.trim(),
      aiInstructions: scenarioAIInstructions.trim(),
      tags: scenarioTags.split(',').map(tag => tag.trim()).filter(Boolean),
      nsfw: scenarioNsfw,
      cards: [...scenarioCards],
      narrator: scenarioNarrator || null,
      createdAt: new Date().toISOString(),
    };
    const nextData = { ...data, scenarios: [newScenario, ...data.scenarios] };
    setData(nextData);
    if (typeof onUpdateAppData === 'function') onUpdateAppData(nextData);
    setStatus('Escenario creado con éxito.');
    setMode('dashboard');
  };

  const saveCard = () => {
    if (!cardTitle.trim() || !cardText.trim()) {
      setStatus('El título y el texto de la tarjeta son obligatorios.');
      return;
    }
    const albumUrls = [
      ...cardAlbumUrls,
      ...cardAlbumInput.split(',').map(url => url.trim()).filter(Boolean),
    ];
    const newCard = {
      id: `card-${Date.now()}`,
      type: cardCustomType.trim() || cardType,
      title: cardTitle.trim(),
      intro: cardIntro.trim(),
      text: cardText.trim(),
      cover: cardCover.trim(),
      album: albumUrls,
      tags: cardTags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    
    let newScenarios = [...data.scenarios];
    if (cardIsScenario) {
      newScenarios.unshift({
        id: `scenario-from-card-${Date.now()}`,
        title: cardTitle.trim(),
        category: 'Aventura',
        intro: cardIntro.trim() || cardText.trim().substring(0, 80) + '...',
        cover: cardCover.trim(),
        presentation: '',
        baseContext: `[${cardType}]: ${cardText.trim()}`,
        aiInstructions: '',
        tags: cardTags.split(',').map(tag => tag.trim()).filter(Boolean),
        nsfw: false,
        cards: [newCard.id],
        narrator: null,
        createdAt: new Date().toISOString(),
      });
    }

    const nextData = { ...data, cards: [newCard, ...data.cards], scenarios: newScenarios };
    setData(nextData);
    if (typeof onUpdateAppData === 'function') onUpdateAppData(nextData);
    setStatus('Tarjeta guardada.');
    setMode('dashboard');
  };

  const saveNarrator = () => {
    if (!narratorName.trim() || !narratorBio.trim()) {
      setStatus('Nombre y biografía del narrador son obligatorios.');
      return;
    }
    const newNarrator = {
      id: `narrator-${Date.now()}`,
      name: narratorName.trim(),
      bio: narratorBio.trim(),
      style: narratorStyle.trim(),
      tone: narratorTone.trim(),
      rules: narratorRules.trim(),
      randomization: narratorRandomization.trim(),
      createdAt: new Date().toISOString(),
    };
    const nextData = { ...data, narrators: [newNarrator, ...data.narrators] };
    setData(nextData);
    if (typeof onUpdateAppData === 'function') onUpdateAppData(nextData);
    setMode('dashboard');
  };


  const selectedNarrator = data.narrators.find(n => n.id === scenarioNarrator);

  return (
    <div className="create-page">
      <div className="page-header-title" style={{ padding: '0 8px' }}>
        <h2>Creación</h2>
        <p>Arma mundos, tarjetas modulares y narradores interactivos.</p>
      </div>

      {mode === 'dashboard' && (
        <section className="create-actions">
          <button className="action-card" onClick={() => onOpenCreateModal ? onOpenCreateModal() : showMode('create-scenario')}>
            <div className="icon icon-scenario" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <circle cx="32" cy="24" r="6" fill="currentColor" />
                <circle cx="42" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M14 32C14 20 24 12 32 12C40 12 50 20 50 32C50 44 40 52 32 52C24 52 14 44 14 32Z" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M32 8V4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="card-title">Crear escenario</div>
            <div className="card-copy">Arma viajes completos y mundos jugables.</div>
          </button>

          <button className="action-card" onClick={() => onOpenCreateModal ? onOpenCreateModal() : showMode('create-card')}>
            <div className="icon icon-card" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <rect x="14" y="16" width="36" height="32" rx="8" fill="none" stroke="currentColor" strokeWidth="5" />
                <path d="M28 24C28 21 30 18 34 18C38 18 40 20 40 23C40 26 36 26 36 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <circle cx="34" cy="38" r="2" fill="currentColor" />
              </svg>
            </div>
            <div className="card-title">Crear tarjeta</div>
            <div className="card-copy">Define ideas, personajes y reglas clave.</div>
          </button>

          <button className="action-card" onClick={() => showMode('create-narrator')}>
            <div className="icon icon-narrator" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <path d="M14 18C18 10 46 10 50 18" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M32 18V28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M24 28V38" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M40 28V38" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <circle cx="32" cy="44" r="6" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M26 54C26 50 38 50 38 54" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="card-title">Crear narrador</div>
            <div className="card-copy">Crea el hilo que guía tu historia.</div>
          </button>
        </section>
      )}

      <div className="create-body">
        {mode === 'dashboard' ? (
          <section className="created-section">
            <div className="created-header">
              <div>
                <h2>Elementos creados</h2>
                <p>Explora tus elementos por categoría en listas desplegables.</p>
              </div>
            </div>

            <div className="created-accordion-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {/* Categoría 1: Escenarios (Colapsable) */}
              <details className="created-details" open style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                <summary style={{ fontWeight: '700', fontSize: '1rem', color: '#ffd36b', cursor: 'pointer' }}>
                  Escenarios creados ({data.scenarios.length})
                </summary>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '12px 0 6px 0' }}>
                  {data.scenarios.length === 0 ? (
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>No hay escenarios aún.</span>
                  ) : (
                    data.scenarios.map(s => (
                      <div 
                        key={s.id} 
                        className="scenario-card-visual" 
                        style={{ flex: '1 1 220px', maxWidth: '320px', minWidth: '200px', cursor: 'pointer' }}
                        onClick={() => onOpenScenario && onOpenScenario(s)}
                      >
                        <div className="sc-card-cover" style={{ backgroundImage: `url(${s.cover || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'})`, height: '120px' }} />
                        <div className="sc-card-body" style={{ padding: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{s.title}</h4>
                          <small style={{ color: 'rgba(255,255,255,0.5)' }}>{s.category}</small>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </details>

              {/* Categoría 2: Tarjetas (Colapsable y tarjetas verticales estilo Pinterest) */}
              <details className="created-details" open style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                <summary style={{ fontWeight: '700', fontSize: '1rem', color: '#ffd36b', cursor: 'pointer' }}>
                  Tarjetas creadas ({data.cards.length})
                </summary>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '12px 0 6px 0' }}>
                  {data.cards.length === 0 ? (
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>No hay tarjetas aún.</span>
                  ) : (
                    data.cards.map(c => {
                      const isChar = (c.type || '').toLowerCase() === 'personaje';
                      return (
                        <div 
                          key={c.id} 
                          style={{ flex: isChar ? '0 1 150px' : '1 1 180px', maxWidth: isChar ? '180px' : '280px', minWidth: '140px', background: 'rgba(20,18,30,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer' }}
                          onClick={() => onOpenScenario && onOpenScenario({ ...c, title: c.title, intro: c.intro || c.text })}
                        >
                          <div style={{ backgroundImage: `url(${c.cover || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80'})`, height: isChar ? '160px' : '100px', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          <div style={{ padding: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.82rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</h4>
                            <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{c.type}</small>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </details>

              {/* Categoría 3: Narradores (Colapsable) */}
              <details className="created-details" open style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                <summary style={{ fontWeight: '700', fontSize: '1rem', color: '#ffd36b', cursor: 'pointer' }}>
                  Narradores creados ({data.narrators.length})
                </summary>
                <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '12px 0 6px 0' }}>
                  {data.narrators.length === 0 ? (
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>No hay narradores aún.</span>
                  ) : (
                    data.narrators.map(n => (
                      <div key={n.id} style={{ minWidth: '180px', width: '180px', background: 'rgba(20,18,30,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', color: '#fff' }}>{n.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.bio}</p>
                      </div>
                    ))
                  )}
                </div>
              </details>
            </div>
          </section>
        ) : null}

        {mode === 'create-scenario' && (
          <section className="form-panel">
            <div className="form-header">
              <h2>Crear escenario</h2>
              <button className="secondary" onClick={() => setMode('dashboard')}>Volver</button>
            </div>
            <div className="field-group">
              <label>Título</label>
              <input value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} placeholder="Nombre del escenario" />
            </div>
            <div className="field-group">
              <label>Imagen de portada</label>
              <input value={scenarioCover} onChange={e => setScenarioCover(e.target.value)} placeholder="URL de imagen o path local" />
            </div>
            <div className="field-group">
              <label>Subir portada</label>
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setCropSrc(reader.result);
                    setTargetCropField('scenario');
                    setIsCropperOpen(true);
                  }
                };
                reader.readAsDataURL(file);
              }} />
            </div>
            <div className="field-group">
              <label>Tags</label>
              <input value={scenarioTags} onChange={e => setScenarioTags(e.target.value)} placeholder="misterio, ciencia ficción, terror" />
            </div>
            <div className="checkbox-item" style={{ marginBottom: '16px' }}>
              <input type="checkbox" id="scenarioNsfwCheck" checked={scenarioNsfw} onChange={e => setScenarioNsfw(e.target.checked)} />
              <label htmlFor="scenarioNsfwCheck" style={{ cursor: 'pointer', color: '#ffd36b', fontWeight: '600' }}>Contenido NSFW (+18 / Adultos)</label>
            </div>
            <div className="field-group">
              <label>Introducción</label>
              <textarea value={scenarioIntro} onChange={e => setScenarioIntro(e.target.value)} rows={4} maxLength={200} />
            </div>
            <div className="field-group">
              <label>Presentación</label>
              <textarea value={scenarioPresentation} onChange={e => setScenarioPresentation(e.target.value)} rows={3} />
            </div>
            <div className="field-group">
              <label>Contexto base</label>
              <textarea value={scenarioBaseContext} onChange={e => setScenarioBaseContext(e.target.value)} rows={4} />
            </div>
            <div className="field-group">
              <label>Instrucciones de IA / GM Brain</label>
              <textarea value={scenarioAIInstructions} onChange={e => setScenarioAIInstructions(e.target.value)} rows={4} />
            </div>
            <div className="field-group horizontal">
              <div>
                <label>Categoría</label>
                <select value={scenarioCategory} onChange={e => setScenarioCategory(e.target.value)}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label>Narrador</label>
                <select value={scenarioNarrator} onChange={e => setScenarioNarrator(e.target.value)}>
                  <option value="">Ninguno</option>
                  {data.narrators.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
            </div>
            <div className="field-group">
              <ConnectionSelector 
                availableCards={data.cards} 
                selectedCardIds={scenarioCards} 
                onSelectCard={(id) => setScenarioCards(prev => [...prev, id])}
                onRemoveCard={(id) => setScenarioCards(prev => prev.filter(cId => cId !== id))}
              />
            </div>
            {selectedNarrator && (
              <div className="panel-note">Narrador seleccionado: <strong>{selectedNarrator.name}</strong></div>
            )}
            <div className="form-footer">
              <button className="primary" onClick={saveScenario}>Guardar escenario</button>
            </div>
          </section>
        )}

        {mode === 'create-card' && (
          <section className="form-panel">
            <div className="form-header">
              <h2>Crear tarjeta</h2>
              <button className="secondary" onClick={() => setMode('dashboard')}>Volver</button>
            </div>
            <div className="field-group">
              <label>Tipo</label>
              <select value={cardType} onChange={e => setCardType(e.target.value)}>
                {cardOptions.map(type => <option key={type} value={type}>{type}</option>)}
                <option value="personalizado">Personalizado</option>
              </select>
            </div>
            {cardType === 'personalizado' && (
              <div className="field-group">
                <label>Tipo personalizado</label>
                <input value={cardCustomType} onChange={e => setCardCustomType(e.target.value)} placeholder="Historia, raza, lugar..." />
              </div>
            )}
            <div className="checkbox-item" style={{ marginBottom: '16px' }}>
              <input type="checkbox" id="cardScenarioCheck" checked={cardIsScenario} onChange={e => setCardIsScenario(e.target.checked)} />
              <label htmlFor="cardScenarioCheck" style={{ cursor: 'pointer', color: '#ffd36b', fontWeight: '600' }}>Convertir y crear como Escenario jugable también</label>
            </div>
            <div className="field-group">
              <label>Nombre</label>
              <input value={cardTitle} onChange={e => setCardTitle(e.target.value)} placeholder="Nombre de la tarjeta" />
            </div>
            <div className="field-group">
              <label>Imagen de portada</label>
              <input value={cardCover} onChange={e => setCardCover(e.target.value)} placeholder="URL de imagen o path local" />
            </div>
            <div className="field-group">
              <label>Introducción</label>
              <textarea value={cardIntro} onChange={e => setCardIntro(e.target.value)} rows={3} maxLength={200} />
            </div>
            <div className="field-group">
              <label>Descripción</label>
              <textarea value={cardText} onChange={e => setCardText(e.target.value)} rows={4} />
            </div>
            <div className="field-group">
              <label>Tags</label>
              <input value={cardTags} onChange={e => setCardTags(e.target.value)} placeholder="heroico, oscuro, urbano" />
            </div>
            <div className="field-group">
              <label>Álbum de imágenes (URLs separadas por comas)</label>
              <input value={cardAlbumInput} onChange={e => setCardAlbumInput(e.target.value)} placeholder="https://... , https://..." />
            </div>
            <div className="field-group">
              <label>Subir imágenes del álbum</label>
              <input type="file" accept="image/*" multiple onChange={e => {
                const files = Array.from(e.target.files || []);
                Promise.all(files.map(file => new Promise(resolve => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.readAsDataURL(file);
                }))).then(results => {
                  setCardAlbumUrls(prev => [...prev, ...results.filter(Boolean)]);
                });
              }} />
            </div>
            <div className="form-footer">
              <button className="primary" onClick={saveCard}>Guardar tarjeta</button>
            </div>
          </section>
        )}

        {mode === 'create-narrator' && (
          <section className="form-panel">
            <div className="form-header">
              <h2>Crear narrador</h2>
              <button className="secondary" onClick={() => setMode('dashboard')}>Volver</button>
            </div>
            <div className="field-group">
              <label>Nombre</label>
              <input value={narratorName} onChange={e => setNarratorName(e.target.value)} placeholder="Nombre del narrador" />
            </div>
            <div className="field-group">
              <label>Biografía / preset</label>
              <textarea value={narratorBio} onChange={e => setNarratorBio(e.target.value)} rows={4} />
            </div>
            <div className="field-group">
              <label>Estilo narrativo</label>
              <input value={narratorStyle} onChange={e => setNarratorStyle(e.target.value)} placeholder="Adulto, dramático, humorístico..." />
            </div>
            <div className="field-group">
              <label>Tono</label>
              <input value={narratorTone} onChange={e => setNarratorTone(e.target.value)} placeholder="Oscuro, épico, sensual..." />
            </div>
            <div className="field-group">
              <label>Reglas / gameplay</label>
              <textarea value={narratorRules} onChange={e => setNarratorRules(e.target.value)} rows={3} />
            </div>
            <div className="field-group">
              <label>Randomización</label>
              <textarea value={narratorRandomization} onChange={e => setNarratorRandomization(e.target.value)} rows={3} />
            </div>
            <div className="form-footer">
              <button className="primary" onClick={saveNarrator}>Guardar narrador</button>
            </div>
          </section>
        )}
      </div>
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={cropSrc}
        aspectRatio={targetCropField === 'card-personaje' ? 3/4 : 16/9}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={(croppedImage) => {
          if (targetCropField === 'scenario') {
            setScenarioCover(croppedImage);
          } else {
            setCardCover(croppedImage);
          }
        }}
      />
    </div>
  );
}
