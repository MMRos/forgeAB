import React, { useEffect, useMemo, useRef, useState } from 'react';
import sample from '../data/scenarios';
import HeaderSlider from '../components/HeaderSlider';
import SearchBar from '../components/SearchBar';
import ScenarioCard from '../components/ScenarioCard';
import './home.css';

function CategoryCarousel({ title, items, onOpen }) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const row = rowRef.current;
    if (!row) return;
    setCanScrollLeft(row.scrollLeft > 8);
    setCanScrollRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 8);
  };

  const scrollByWidth = (direction) => {
    const row = rowRef.current;
    if (!row) return;
    const amount = row.clientWidth * 0.9;
    row.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    updateScrollButtons();
    const onResize = () => updateScrollButtons();
    row.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', onResize);
    return () => {
      row.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', onResize);
    };
  }, [items]);

  return (
    <div className="section">
      <div className="section-header">
        <h3>{title}</h3>
        <div className="section-controls">
          <button className="section-arrow" onClick={() => scrollByWidth('prev')} disabled={!canScrollLeft} aria-label={`Anterior en ${title}`}>
            ‹
          </button>
          <button className="section-arrow" onClick={() => scrollByWidth('next')} disabled={!canScrollRight} aria-label={`Siguiente en ${title}`}>
            ›
          </button>
        </div>
      </div>
      <div className="section-row" ref={rowRef}>
        {items.map(s => (
          <ScenarioCard key={s.id} s={s} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export default function Home({ onOpenScenario, scenarios = [], cards = [] }){
  const [searchResult, setSearchResult] = useState(null);
  const [nsfwAllowed, setNsfwAllowed] = useState(false);

  // Combinar escenarios de muestra con escenarios y tarjetas del usuario
  const userHistoryCards = (cards || []).filter(c => (c.type || '').toLowerCase() === 'historia').map(c => ({
    id: c.id,
    title: c.title || c.name,
    intro: c.intro || c.text || 'Sin descripción',
    cover: c.cover || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    category: 'Mis Creaciones',
    visits: 1,
    rating: '10.0',
    creatorName: 'Tú'
  }));

  const all = useMemo(() => [...scenarios, ...userHistoryCards, ...sample], [scenarios, userHistoryCards]);
  
  const headerItems = [...scenarios, ...userHistoryCards]
    .sort((a,b)=> new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 50);
  if (headerItems.length < 50) {
    headerItems.push(...sample.slice(0, 50 - headerItems.length));
  }

  const sections = useMemo(()=>{
    const recent = [...all].sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)).slice(0,8);
    const popular = [...all].sort((a,b)=> (b.messagesCount - a.messagesCount) || (b.visits - a.visits)).slice(0,8);
    const byCat = {};
    all.forEach(s=>{ if (!byCat[s.category]) byCat[s.category]=[]; byCat[s.category].push(s); });
    Object.keys(byCat).forEach(cat=> byCat[cat].sort((a,b)=> (b.messagesCount - a.messagesCount) || (b.visits - a.visits)));
    return { recent, popular, byCat };
  }, [all]);

  const doSearch = ({ q, category, sort, nsfw }) => {
    setNsfwAllowed(nsfw);
    let results = all.filter(s => (nsfw || !s.nsfw));
    if (q) {
      const qq = q.toLowerCase();
      results = results.filter(s=> (s.title+ ' '+ s.intro + ' ' + s.content).toLowerCase().includes(qq));
    }
    if (category) results = results.filter(s=> s.category===category);
    if (sort==='recent') results = results.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    if (sort==='popular') results = results.sort((a,b)=> (b.messagesCount - a.messagesCount) || (b.visits - a.visits));
    if (sort==='relevance' && q) {
      const qq=q.toLowerCase();
      results = results.sort((a,b)=> ((b.title+ ' '+ b.intro+ ' '+ b.content).toLowerCase().split(qq).length) - ((a.title+ ' '+ a.intro+ ' '+ a.content).toLowerCase().split(qq).length));
    }
    setSearchResult(results);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <HeaderSlider items={headerItems} nsfwAllowed={nsfwAllowed} onOpen={onOpenScenario} />
        <SearchBar onSearch={doSearch} />
      </header>

      <section className="home-body">
        {searchResult ? (
          <div className="results-list">
            {searchResult.map(s=> <ScenarioCard key={s.id} s={s} onOpen={onOpenScenario} />)}
          </div>
        ) : (
          <>
            <CategoryCarousel title="Recientes" items={sections.recent} onOpen={onOpenScenario} />
            <CategoryCarousel title="Populares" items={sections.popular} onOpen={onOpenScenario} />
            {Object.keys(sections.byCat).map(cat=> (
              <CategoryCarousel key={cat} title={cat} items={sections.byCat[cat]} onOpen={onOpenScenario} />
            ))}
          </>
        )}
      </section>
    </div>
  );
}
