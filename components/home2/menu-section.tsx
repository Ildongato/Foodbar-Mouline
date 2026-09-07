'use client';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowUpRight, ArrowRight, Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { menus, type MenuMode, type MenuItem } from '@/lib/menu';
import { business } from '@/lib/business';
import CulinaryIcon from './culinary-icon';

function Item({ item }: { item: MenuItem }) {
  return (
    <div className="menu-item">
      <div className="dish-copy">
        <h4>{item.name}</h4>
        {item.description && <p>{item.description}</p>}
      </div>
      <span className={`dish-price ${!item.price ? 'price-question' : ''}`}>
        {item.price ?? 'Vraag naar de meerprijs'}
      </span>
    </div>
  );
}
function CategoryMenu({ mode }: { mode: MenuMode }) {
  const [category, setCategory] = useState(menus[mode][0].id);
  const navRef = useRef<HTMLDivElement>(null);
  function selectCategory(value: string) {
    const header = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header'),
    );
    const wasSticky =
      !!navRef.current &&
      navRef.current.getBoundingClientRect().top <= header + 2;
    flushSync(() => setCategory(value));
    const categoryRoot = navRef.current?.parentElement;
    if (wasSticky && categoryRoot) {
      window.scrollTo({
        top:
          window.scrollY +
          categoryRoot.getBoundingClientRect().top -
          header -
          8,
        behavior: 'instant',
      });
    }
  }
  return (
    <Tabs
      value={category}
      onValueChange={(v) => selectCategory(String(v))}
      className="category-tabs"
    >
      <TabsList
        variant="line"
        ref={navRef}
        className="category-list"
        aria-label={
          mode === 'onsite' ? 'Categorie ter plaatse' : 'Categorie takeaway'
        }
      >
        {menus[mode].map((c) => (
          <TabsTrigger value={c.id} key={c.id}>
            <CulinaryIcon categoryId={c.id} />
            {c.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {menus[mode].map((c) => (
        <TabsContent
          key={c.id}
          value={c.id}
          keepMounted
          className="category-content"
        >
          <div className="category-heading">
            <div className="category-title">
              <CulinaryIcon categoryId={c.id} />
              <h3>{c.label}</h3>
            </div>
            <p>{c.tagline}</p>
          </div>
          <div className="dish-list">
            {c.items.map((item, i) => (
              <Item item={item} key={item.name + i} />
            ))}
          </div>
          {c.extras && (
            <details className="menu-extras">
              <summary>
                Iets extra <Plus size={16} />
              </summary>
              <div className="dish-list">
                {c.extras.map((item, i) => (
                  <Item item={item} key={item.name + i} />
                ))}
              </div>
            </details>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
export default function MenuSection({
  mode,
  onModeChange,
  onReserve,
}: {
  mode: MenuMode;
  onModeChange: (mode: MenuMode) => void;
  onReserve: () => void;
}) {
  return (
    <section id="menu" className="menu-section container">
      <div className="section-heading">
        <h2>De menukaart.</h2>
        <p>
          Een rustig ontbijt, een lunch aan tafel of iets lekkers voor onderweg.
        </p>
      </div>
      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as MenuMode)}
        className="menu-mode"
      >
        <div className="menu-switch-wrap">
          <TabsList
            className="menu-switch"
            aria-label="Kies menu ter plaatse of takeaway"
          >
            <TabsTrigger value="onsite">
              <span>
                <strong>Ter plaatse</strong>
              </span>
            </TabsTrigger>
            <TabsTrigger value="takeaway">
              <span>
                <strong>Takeaway</strong>
              </span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="onsite" keepMounted className="mode-panel">
          <div className="mode-note">
            <span>Ontbijt tot 11u. Lunch vanaf 11u.</span>
            <a href="#contact" onClick={onReserve} className="text-link">
              Een tafel aanvragen <ArrowUpRight size={16} />
            </a>
          </div>
          <CategoryMenu mode="onsite" />
        </TabsContent>
        <TabsContent value="takeaway" keepMounted className="mode-panel">
          <div className="takeaway-note">
            <div>
              <strong>Bestel voor 11u.</strong>
              <p>Dan staat je bestelling klaar op het afgesproken uur.</p>
            </div>
            <a className="button button-ink" href={business.phoneHref}>
              Bel {business.phone} <ArrowUpRight size={17} />
            </a>
          </div>
          <CategoryMenu mode="takeaway" />
        </TabsContent>
      </Tabs>
      <div className="menu-foot">
        <p>Een allergie of een vraag over een gerecht? Laat het ons weten.</p>
        <a className="text-link" href={business.phoneHref}>
          Bel ons even <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
