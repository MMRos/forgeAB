import React, { useEffect, useRef, useState } from 'react';
import './home.css';

export default function HeaderSlider({ items = [], nsfwAllowed = false, onOpen }){
  const slides = items.filter(s => nsfwAllowed || !s.nsfw).slice(0,50)
    .sort((a,b)=> (b.messagesCount - a.messagesCount) || (b.visits - a.visits));
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  useEffect(()=>{
    timer.current = setInterval(()=>{
      setIndex(i => (i+1) % (slides.length || 1));
    }, 10000);
    return ()=> clearInterval(timer.current);
  },[slides.length]);

  if (!slides.length) return null;

  const current = slides[index] || slides[0];

  const go = (dir) => {
    setIndex(i => {
      if (dir==='next') return (i+1)%slides.length;
      return (i-1+slides.length)%slides.length;
    });
    clearInterval(timer.current);
  };

  const coverUrl = current.cover || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80';

  return (
    <div className="header-slider-split">
      <button className="hs-arrow left" onClick={()=>go('prev')} aria-label="Anterior">◀</button>

      <div className="hs-split-container" onClick={()=> onOpen && onOpen(current)} role="button" tabIndex={0}>
        {/* Lado Izquierdo: Información del escenario sobre fondo oscuro */}
        <div className="hs-info-side">
          <h2>{current.title}</h2>
          <p className="hs-meta">{current.visits || 0} visitas • ★ {current.rating || '10.0'}</p>
          <p className="hs-intro">{current.intro || current.text || 'Sin descripción previa.'}</p>
        </div>

        {/* Lado Derecho: Imagen de portada adaptada horizontalmente */}
        <div className="hs-image-side" style={{ backgroundImage: `url(${coverUrl})` }} />
      </div>

      <button className="hs-arrow right" onClick={()=>go('next')} aria-label="Siguiente">▶</button>
    </div>
  );
}
