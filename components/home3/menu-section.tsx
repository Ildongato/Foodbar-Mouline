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
        <h3>{item.name}</h3>
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
    // Read the resolved sticky offset so category changes use the same
    // compact header height as CSS at every breakpoint.
    const stickyTop = nav ? parseFloat(getComputedStyle(nav).top) : 0;
    const before = nav?.getBoundingClientRect();
    const wasSticky = !!before && before.top <= stickyTop + 2;
    // Commit before measuring: a shorter panel can release the sticky navigation.
    flushSync(() => setCategory(value));
    if (!nav || !wasSticky) return;
    // Let native scroll anchoring settle after the panel height changes.
    requestAnimationFrame(() => {
      if (!nav.isConnected) return;
      const panel = nav.parentElement?.querySelector<HTMLElement>(
        '.category-content:not([hidden])',
      );
      const after = nav.getBoundingClientRect();
      const panelTop = panel?.getBoundingClientRect().top;
      const contentHasPassed =
        panelTop !== undefined && panelTop < after.bottom - 8;
      const root = nav.parentElement;
      if (root && (Math.abs(after.top - stickyTop) > 1 || contentHasPassed))
        window.scrollTo({
          top: window.scrollY + root.getBoundingClientRect().top - stickyTop,
          behavior: 'instant',
        });
    });
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
      {/* Matching values let Base UI link each panel to its tab with
          aria-labelledby / aria-controls, without a duplicate heading. */}
      {menus[mode].map((c) => (
        <TabsContent
          key={c.id}
          value={c.id}
          keepMounted
          className="category-content"
        >
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
      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as MenuMode)}
        className="menu-mode"
      >
        <div className="menu-header">
          <h2>De menukaart.</h2>
          <TabsList
            className="menu-switch"
            aria-label="Kies menu ter plaatse of takeaway"
          >
            <TabsTrigger value="onsite">Ter plaatse</TabsTrigger>
            <TabsTrigger value="takeaway">Takeaway</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="onsite" keepMounted className="mode-panel">
          <div className="mode-note">
            <span>Ontbijt tot 11u. Lunch vanaf 11u.</span>
            <a
              href="#contact-request"
              onClick={onReserve}
              className="text-link"
            >
              Een tafel aanvragen <ArrowUpRight size={16} />
            </a>
          </div>
          <CategoryMenu mode="onsite" />
        </TabsContent>
        <TabsContent value="takeaway" keepMounted className="mode-panel">
          <div className="takeaway-note">
            <strong>Bestel voor 11u.</strong>
            <a className="text-link" href={business.phoneHref}>
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
