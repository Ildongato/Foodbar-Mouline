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
// Keep the original reading order: down the first column, then the second.
// Explicit groups avoid CSS-column rebalancing when details or fonts change.
function DishList({ items }: { items: MenuItem[] }) {
  // Described dishes occupy more lines. Choose one stable, content-based split;
  // both columns still contain consecutive items in their original order.
  const weights = items.map(
    (item) =>
      1 +
      (item.description ? Math.ceil(item.description.length / 60) * 0.7 : 0),
  );
  const half = weights.reduce((total, weight) => total + weight, 0) / 2;
  let midpoint = 1;
  let sum = weights[0] ?? 0;
  for (let index = 1; index < items.length - 1; index++) {
    if (Math.abs(sum + weights[index] - half) >= Math.abs(sum - half)) break;
    sum += weights[index];
    midpoint = index + 1;
  }
  const columns = [items.slice(0, midpoint), items.slice(midpoint)].filter(
    (part) => part.length,
  );
  return (
    <div className="dish-list">
      {columns.map((part, column) => (
        <div className="dish-column" key={column}>
          {part.map((item, index) => (
            <Item item={item} key={item.name + index} />
          ))}
        </div>
      ))}
    </div>
  );
}
function CategoryMenu({ mode }: { mode: MenuMode }) {
  const [category, setCategory] = useState(menus[mode][0].id);
  const navRef = useRef<HTMLDivElement>(null);
  function selectCategory(value: string) {
    if (value === category) return;
    const nav = navRef.current;
    const header = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header'),
    );
    const before = nav?.getBoundingClientRect();
    const wasSticky = !!before && before.top <= header + 2;
    // Commit before measuring: a shorter panel can release the sticky navigation.
    flushSync(() => setCategory(value));
    if (!nav || !wasSticky) return;
    const panel = nav.parentElement?.querySelector<HTMLElement>(
      '.category-content:not([hidden])',
    );
    const after = nav.getBoundingClientRect();
    const panelTop = panel?.getBoundingClientRect().top;
    const contentHasPassed =
      panelTop !== undefined && panelTop < after.bottom - 8;
    if (after.top < header || contentHasPassed) {
      const root = nav.parentElement;
      if (root)
        window.scrollTo({
          top: window.scrollY + root.getBoundingClientRect().top - header,
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
          <DishList items={c.items} />
          {c.extras && (
            <details className="menu-extras">
              <summary>
                Iets extra <Plus size={16} />
              </summary>
              <DishList items={c.extras} />
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
