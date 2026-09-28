'use client';

import { useEffect, useState } from 'react';

const CART_KEY = 'tamp-cart';
const WISH_KEY = 'tamp-wishlist';

type SavedItem = { slug: string; name: string; merchant: string; price: number; icon: string };

function read(key: string): SavedItem[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function write(key: string, items: SavedItem[]) {
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event('tamp-storage'));
}

export function HeaderCounts() {
  const [counts, setCounts] = useState({ cart: 0, wishlist: 0 });
  useEffect(() => {
    const refresh = () => setCounts({ cart: read(CART_KEY).length, wishlist: read(WISH_KEY).length });
    refresh(); window.addEventListener('storage', refresh); window.addEventListener('tamp-storage', refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('tamp-storage', refresh); };
  }, []);
  return <><a className="header-save-count" href="/wishlist" aria-label="Wishlist">♡ {counts.wishlist}</a><a className="header-cart-count" href="/cart" aria-label="Shopping list">🛒 {counts.cart}</a></>;
}

export function SaveButton({ item }: { item: SavedItem }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(read(WISH_KEY).some(x => x.slug === item.slug)), [item.slug]);
  const toggle = async () => {
    const me = await fetch('/api/auth/me').then(r => r.ok ? r.json() : {user:null}).catch(() => ({user:null}));
    if (me.user) {
      const exists = saved;
      await fetch(`/api/wishlist${exists ? `?slug=${encodeURIComponent(item.slug)}` : ''}`, { method: exists ? 'DELETE' : 'POST', headers: {'content-type':'application/json'}, body: exists ? undefined : JSON.stringify(item) });
      setSaved(!exists); window.dispatchEvent(new Event('tamp-storage')); return;
    }
    const items = read(WISH_KEY); const exists = items.some(x => x.slug === item.slug);
    write(WISH_KEY, exists ? items.filter(x => x.slug !== item.slug) : [...items, item]); setSaved(!exists);
  };
  return <button className={`save-button ${saved ? 'saved' : ''}`} onClick={toggle} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}>{saved ? '♥ Saved' : '♡ Save'}</button>;
}

export function AddToListButton({ item }: { item: SavedItem }) {
  const [added, setAdded] = useState(false);
  useEffect(() => setAdded(read(CART_KEY).some(x => x.slug === item.slug)), [item.slug]);
  const add = () => {
    const items = read(CART_KEY); if (!items.some(x => x.slug === item.slug)) write(CART_KEY, [...items, item]); setAdded(true);
  };
  return <button className={`yellow-btn list-button ${added ? 'added' : ''}`} onClick={add}>{added ? '✓ In shopping list' : '+ Add to shopping list'}</button>;
}

export function RemoveListButton({ slug }: { slug: string }) {
  const remove = () => { write(CART_KEY, read(CART_KEY).filter(x => x.slug !== slug)); window.location.reload(); };
  return <button className="text-button" onClick={remove}>Remove</button>;
}

export function ClearWishlistButton() {
  const clear = () => { write(WISH_KEY, []); window.location.reload(); };
  return <button className="text-button" onClick={clear}>Clear saved items</button>;
}

export function ShoppingListClient() {
  const [items, setItems] = useState<SavedItem[]>([]);
  useEffect(() => setItems(read(CART_KEY)), []);
  if (!items.length) return <div className="empty-state"><div>🛒</div><h2>Your shopping list is empty</h2><p>Add products here while you compare. When you are ready, TAMP sends you to the merchant for checkout.</p><a className="yellow-btn" href="/products">Explore products →</a></div>;
  return <div className="shopping-list"><div className="shopping-list-head"><div><b>{items.length} saved for shopping</b><span>Checkout happens directly with the merchant.</span></div><a href="/products">Continue browsing →</a></div>{items.map(item => <article className="shopping-list-item" key={item.slug}><div className="mini-product-icon">{item.icon}</div><div className="shopping-list-copy"><h3><a href={`/products/${item.slug}`}>{item.name}</a></h3><p>Merchant source: <strong>{item.merchant}</strong> · Listed price: <strong>${item.price.toLocaleString()}</strong></p></div><a className="outline-btn" href={`/products/${item.slug}`}>Compare offer</a><RemoveListButton slug={item.slug}/></article>)}</div>;
}

export function WishlistClient() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [account, setAccount] = useState(false);
  useEffect(() => { fetch('/api/wishlist').then(async r => { if (r.ok) { const d = await r.json(); setAccount(true); setItems(d.items); } else setItems(read(WISH_KEY)); }).catch(() => setItems(read(WISH_KEY))); }, []);
  const clear = async () => { if (account) { await Promise.all(items.map(i => fetch(`/api/wishlist?slug=${encodeURIComponent(i.slug)}`, {method:'DELETE'}))); setItems([]); } else { write(WISH_KEY, []); setItems([]); } };
  if (!items.length) return <div className="empty-state"><div>♡</div><h2>No saved products yet</h2><p>{account ? 'Save products while you compare merchants and destination availability.' : 'Save products on this device, or sign in to sync them across devices.'}</p><a className="yellow-btn" href="/products">Browse products →</a></div>;
  return <div className="shopping-list"><div className="shopping-list-head"><div><b>{items.length} saved products</b><span>{account ? 'Synced to your TAMP account.' : 'Saved on this device.'}</span></div><button className="text-button" onClick={clear}>Clear saved items</button></div>{items.map(item => <article className="shopping-list-item" key={item.slug}><div className="mini-product-icon">{item.icon}</div><div className="shopping-list-copy"><h3><a href={`/products/${item.slug}`}>{item.name}</a></h3><p>Merchant source: <strong>{item.merchant}</strong> · Listed price: <strong>${item.price.toLocaleString()}</strong></p></div><a className="yellow-btn" href={`/products/${item.slug}`}>View product</a></article>)}</div>;
}
