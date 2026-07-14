import React, { useState, useEffect, useMemo } from "react";
import {
  Printer, Laptop, Cpu, Cable, Plus, Minus, Trash2, ShoppingCart,
  Search, Package, Receipt, BarChart3, X, Save, AlertTriangle, CheckCircle2,
  Star, MapPin, ChevronDown, Phone, Truck, CreditCard, Wallet, Banknote,
} from "lucide-react";
import "./storage.js"; // sets up window.storage backed by localStorage

const C = {
  navyDark: "#131921", navy: "#232F3E", navyLight: "#37475A",
  orange: "#FF9900", gold: "#FFD814", goldBorder: "#FCD200",
  ink: "#0F1111", gray: "#565959", bg: "#EAEDED", link: "#007185", price: "#B12704",
};

const CATEGORIES = [
  { id: "ink", label: "Ink & Cartridges", icon: Printer },
  { id: "laptop", label: "Laptops", icon: Laptop },
  { id: "pc", label: "Desktop PCs", icon: Cpu },
  { id: "acc", label: "Accessories", icon: Cable },
];

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash" },
  { id: "vodafone", label: "Vodafone Cash" },
  { id: "visa", label: "Visa / Mastercard" },
  { id: "instapay", label: "InstaPay" },
];

const seedProducts = [
  { id: "p1", name: "HP 63 Black Ink Cartridge", category: "ink", price: 350, cost: 220, qty: 18, sku: "INK-063B", rating: 4 },
  { id: "p2", name: "Canon 725 Color Cartridge", category: "ink", price: 420, cost: 280, qty: 12, sku: "INK-725C", rating: 5 },
  { id: "p3", name: "Epson 664 Ink Bottle Refill", category: "ink", price: 180, cost: 110, qty: 30, sku: "INK-664R", rating: 4 },
  { id: "p4", name: "Lenovo IdeaPad i5 Laptop", category: "laptop", price: 18500, cost: 15800, qty: 4, sku: "LT-LNV-I5", rating: 5 },
  { id: "p5", name: "HP Pavilion i7 Laptop", category: "laptop", price: 26900, cost: 23200, qty: 2, sku: "LT-HP-I7", rating: 4 },
  { id: "p6", name: "Core i5 Desktop PC", category: "pc", price: 15200, cost: 12900, qty: 3, sku: "PC-CI5", rating: 4 },
  { id: "p7", name: "Logitech Wireless Mouse", category: "acc", price: 320, cost: 190, qty: 25, sku: "ACC-MSE", rating: 5 },
  { id: "p8", name: "Mechanical Keyboard", category: "acc", price: 950, cost: 650, qty: 9, sku: "ACC-KBD", rating: 4 },
  { id: "p9", name: "64GB USB Flash Drive", category: "acc", price: 220, cost: 130, qty: 40, sku: "ACC-USB64", rating: 5 },
];

function money(n) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n); }
function todayStr(d = new Date()) { return d.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" }); }

export default function POSApp() {
  const [tab, setTab] = useState("cashier");
  const [products, setProducts] = useState(null);
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [settings, setSettings] = useState({ engineerPhone: "01000000000", deliveryPhone: "01100000000" });

  useEffect(() => {
    (async () => {
      try {
        let p, s, st;
        try { const r = await window.storage.get("shop-products", false); p = JSON.parse(r.value); }
        catch { p = seedProducts; await window.storage.set("shop-products", JSON.stringify(p), false); }
        try { const r = await window.storage.get("shop-sales", false); s = JSON.parse(r.value); }
        catch { s = []; await window.storage.set("shop-sales", JSON.stringify(s), false); }
        try { const r = await window.storage.get("shop-settings", false); st = JSON.parse(r.value); }
        catch { st = settings; await window.storage.set("shop-settings", JSON.stringify(st), false); }
        setProducts(p); setSales(s); setSettings(st);
      } catch { setProducts(seedProducts); setSales([]); }
      finally { setLoading(false); }
    })();
  }, []);

  async function persistProducts(next) { setProducts(next); try { await window.storage.set("shop-products", JSON.stringify(next), false); } catch {} }
  async function persistSales(next) { setSales(next); try { await window.storage.set("shop-sales", JSON.stringify(next), false); } catch {} }
  async function persistSettings(next) { setSettings(next); try { await window.storage.set("shop-settings", JSON.stringify(next), false); } catch {} }
  function showToast(msg, kind = "ok") { setToast({ msg, kind }); setTimeout(() => setToast(null), 2200); }

  if (loading || !products || !sales) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif" }} className="h-screen w-full flex items-center justify-center">
        <div className="text-sm" style={{ color: C.navyDark }}>Loading store data...</div>
      </div>
    );
  }

  return (
    <div dir="ltr" style={{ fontFamily: "'Inter', sans-serif", background: C.bg }} className="h-screen w-full flex flex-col overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@500;700&display=swap');
        .mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #c7c7c7; border-radius: 8px; }
        .amz-btn { background: linear-gradient(to bottom, #f7dfa5, ${C.gold}); border: 1px solid ${C.goldBorder}; }
        .amz-btn:hover { background: linear-gradient(to bottom, #f5d78e, #f2c200); }
      `}</style>

      <TopNav tab={tab} setTab={setTab} cartCount={cartCount} settings={settings} setSettings={persistSettings} />

      <main className="flex-1 min-w-0 overflow-y-auto">
        {tab === "cashier" && (
          <Cashier products={products} setProducts={persistProducts} sales={sales} setSales={persistSales} showToast={showToast} onCartChange={setCartCount} />
        )}
        {tab === "inventory" && <Inventory products={products} setProducts={persistProducts} showToast={showToast} />}
        {tab === "invoices" && <Invoices sales={sales} />}
        {tab === "reports" && <Reports products={products} sales={sales} />}
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white text-sm flex items-center gap-2"
          style={{ background: toast.kind === "ok" ? C.navyDark : C.price }}>
          {toast.kind === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function TopNav({ tab, setTab, cartCount, settings, setSettings }) {
  const [editOpen, setEditOpen] = useState(false);
  const items = [
    { id: "cashier", label: "Store", icon: ShoppingCart },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "invoices", label: "Orders & Invoices", icon: Receipt },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];
  return (
    <div className="shrink-0">
      <div style={{ background: C.ink }} className="text-white text-xs flex items-center gap-4 px-4 py-1.5 overflow-x-auto">
        <span className="flex items-center gap-1 shrink-0">
          <Phone size={12} style={{ color: C.orange }} />
          Technician: <span className="mono font-bold">{settings.engineerPhone}</span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Truck size={12} style={{ color: C.orange }} />
          Delivery: <span className="mono font-bold">{settings.deliveryPhone}</span>
        </span>
        <button onClick={() => setEditOpen(true)} className="ml-auto shrink-0 underline text-white/60 hover:text-white">Edit numbers</button>
      </div>
      <div style={{ background: C.navyDark }} className="text-white flex items-center gap-4 px-4 py-2.5">
        <div className="flex-1 flex max-w-3xl">
          <div className="hidden sm:flex items-center bg-[#F3F3F3] text-black text-xs px-2 rounded-l border-r border-black/10">
            All <ChevronDown size={12} className="ml-1" />
          </div>
          <input placeholder="Search the store..." className="flex-1 px-3 py-2 text-sm text-black focus:outline-none" />
          <button style={{ background: C.orange }} className="px-4 flex items-center justify-center rounded-r">
            <Search size={16} className="text-black" />
          </button>
        </div>
        <div className="relative flex items-center gap-1 shrink-0">
          <ShoppingCart size={26} />
          <span className="absolute -top-2 -left-1 font-black text-xs px-1 rounded-full" style={{ background: C.orange, color: C.navyDark }}>{cartCount}</span>
          <span className="hidden md:inline text-xs font-bold mt-3">Cart</span>
        </div>
      </div>
      <div style={{ background: C.navy }} className="text-white flex items-center gap-1 px-3 overflow-x-auto">
        {items.map((it) => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-transparent hover:border-white shrink-0"
              style={active ? { background: C.navyLight } : {}}
            >
              <Icon size={14} />
              {it.label}
            </button>
          );
        })}
      </div>

      {editOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setEditOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded w-full max-w-sm p-5 border-t-4" style={{ borderColor: C.orange }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black" style={{ color: C.navyDark }}>Contact Numbers</h2>
              <button onClick={() => setEditOpen(false)}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <Field label="Technician phone number">
                <input value={settings.engineerPhone} onChange={(e) => setSettings({ ...settings, engineerPhone: e.target.value })} className="input" />
              </Field>
              <Field label="Delivery phone number">
                <input value={settings.deliveryPhone} onChange={(e) => setSettings({ ...settings, deliveryPhone: e.target.value })} className="input" />
              </Field>
            </div>
            <button onClick={() => setEditOpen(false)} className="amz-btn mt-5 w-full py-2.5 rounded-full font-bold flex items-center justify-center gap-2" style={{ color: C.ink }}>
              <Save size={15} /> Save
            </button>
            <style>{`.input { border:1px solid rgba(0,0,0,0.15); border-radius:6px; padding:8px 12px; font-size:14px; width:100%; }`}</style>
          </div>
        </div>
      )}
    </div>
  );
}

function Stars({ n }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} fill={i <= n ? C.orange : "none"} stroke={i <= n ? C.orange : "#ccc"} />
      ))}
    </div>
  );
}

function Cashier({ products, setProducts, sales, setSales, showToast, onCartChange }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [paid, setPaid] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("cash");

  useEffect(() => { onCartChange(cart.reduce((s, i) => s + i.qty, 0)); }, [cart]);

  const filtered = products.filter((p) => {
    const matchCat = cat === "all" || p.category === cat;
    const matchQ = p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  function addToCart(p) {
    if (p.qty <= 0) { showToast("This item is out of stock", "err"); return; }
    setCart((c) => {
      const existing = c.find((i) => i.id === p.id);
      if (existing) {
        if (existing.qty + 1 > p.qty) { showToast("Not enough stock available", "err"); return c; }
        return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { id: p.id, qty: 1 }];
    });
    setCartOpen(true);
    showToast("Added to cart");
  }
  function changeQty(id, delta) {
    const prod = products.find((p) => p.id === id);
    setCart((c) => c.map((i) => {
      if (i.id !== id) return i;
      const nextQty = i.qty + delta;
      if (nextQty > prod.qty) { showToast("Not enough stock available", "err"); return i; }
      return { ...i, qty: nextQty };
    }).filter((i) => i.qty > 0));
  }
  function removeFromCart(id) { setCart((c) => c.filter((i) => i.id !== id)); }

  const cartLines = cart.map((i) => { const p = products.find((pp) => pp.id === i.id); return { ...p, qty: i.qty, lineTotal: p.price * i.qty }; });
  const total = cartLines.reduce((s, l) => s + l.lineTotal, 0);
  const paidNum = parseFloat(paid || "0");
  const change = paidNum - total;

  async function checkout() {
    if (cartLines.length === 0) { showToast("Cart is empty", "err"); return; }
    if (paidNum < total) { showToast("Amount paid is less than the total", "err"); return; }
    const nextProducts = products.map((p) => { const line = cartLines.find((l) => l.id === p.id); return line ? { ...p, qty: p.qty - line.qty } : p; });
    const invoice = {
      id: "INV-" + Date.now(),
      date: new Date().toISOString(),
      items: cartLines.map((l) => ({ id: l.id, name: l.name, price: l.price, qty: l.qty, lineTotal: l.lineTotal, cost: l.cost })),
      total, paid: paidNum, change, payMethod,
    };
    await setProducts(nextProducts);
    await setSales([invoice, ...sales]);
    setCart([]); setPaid(""); setCartOpen(false); setPayMethod("cash");
    showToast("Invoice issued successfully");
  }

  return (
    <div className="relative">
      <div className="bg-white border-b border-black/10 px-4 py-3 flex gap-2 overflow-x-auto sticky top-0 z-10">
        <CatChip active={cat === "all"} onClick={() => setCat("all")} label="All Categories" />
        {CATEGORIES.map((c) => (
          <CatChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} label={c.label} icon={c.icon} />
        ))}
        <div className="ml-auto relative shrink-0 hidden sm:block">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-black/30" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by name or SKU" className="pl-7 pr-2 py-1.5 text-xs border border-black/15 rounded" />
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white rounded p-3 border border-black/5 flex flex-col hover:shadow-md transition-shadow">
            <div className="w-full aspect-square rounded mb-2 flex items-center justify-center" style={{ background: C.bg }}>
              {(() => { const Icon = CATEGORIES.find((c) => c.id === p.category)?.icon || Package; return <Icon size={40} style={{ color: C.navyLight }} />; })()}
            </div>
            <div className="text-sm leading-snug mb-1 flex-1" style={{ color: C.link }}>{p.name}</div>
            <Stars n={p.rating || 4} />
            <div className="mt-1 mb-1">
              <span className="text-xs align-top" style={{ color: C.price }}>EGP</span>
              <span className="text-xl font-bold" style={{ color: C.price }}> {money(p.price)}</span>
            </div>
            <div className="text-[11px] mb-2" style={{ color: p.qty <= 3 ? C.price : C.gray }}>
              {p.qty > 0 ? `In stock: ${p.qty}` : "Currently unavailable"}
            </div>
            <button onClick={() => addToCart(p)} disabled={p.qty <= 0} className="amz-btn w-full py-1.5 rounded-full text-xs font-bold disabled:opacity-40" style={{ color: C.ink }}>
              Add to Cart
            </button>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center text-black/30 py-16">No matching results</div>}
      </div>

      <button onClick={() => setCartOpen(true)} className="fixed bottom-5 right-5 z-30 rounded-full shadow-lg px-5 py-3 font-bold text-sm flex items-center gap-2 text-white" style={{ background: C.navyDark }}>
        <ShoppingCart size={16} /> Cart ({cart.reduce((s, i) => s + i.qty, 0)}) · EGP {money(total)}
      </button>

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setCartOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
            <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between" style={{ background: C.navyDark }}>
              <span className="text-white font-bold text-sm">Shopping Cart</span>
              <button onClick={() => setCartOpen(false)} className="text-white"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {cartLines.length === 0 && <div className="text-center text-black/30 text-sm mt-10">Your cart is empty</div>}
              {cartLines.map((l) => (
                <div key={l.id} className="border-b border-black/5 pb-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{l.name}</div>
                    <div className="text-xs" style={{ color: C.price }}>EGP {money(l.price)}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => changeQty(l.id, -1)} className="w-6 h-6 rounded bg-[#F0F2F2] border border-black/10 flex items-center justify-center"><Minus size={12} /></button>
                    <span className="w-5 text-center mono text-xs">{l.qty}</span>
                    <button onClick={() => changeQty(l.id, 1)} className="w-6 h-6 rounded bg-[#F0F2F2] border border-black/10 flex items-center justify-center"><Plus size={12} /></button>
                    <button onClick={() => removeFromCart(l.id)} style={{ color: C.link }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-black/10 p-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm"><span className="text-black/50">Total</span><span className="font-black">EGP {money(total)}</span></div>
              <div className="text-xs text-black/50 mb-1">Payment method</div>
              <div className="grid grid-cols-2 gap-2 mb-1">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.id === "cash" ? Banknote : m.id === "vodafone" ? Wallet : m.id === "visa" ? CreditCard : Wallet;
                  const active = payMethod === m.id;
                  return (
                    <button key={m.id} onClick={() => setPayMethod(m.id)} className="flex items-center gap-1.5 px-2 py-2 rounded border text-xs font-bold" style={active ? { background: C.navyDark, borderColor: C.navyDark, color: "#fff" } : { borderColor: "#0000001a", color: C.gray }}>
                      <Icon size={13} /> {m.label}
                    </button>
                  );
                })}
              </div>
              <input type="number" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="Amount paid by customer" className="w-full px-3 py-2 rounded border border-black/15 text-sm" />
              {paid !== "" && (
                <div className="text-xs" style={{ color: change < 0 ? C.price : C.gray }}>
                  {change < 0 ? "Amount short: " : "Change due: "}EGP {money(Math.abs(change))}
                </div>
              )}
              <button onClick={checkout} className="amz-btn mt-1 w-full py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2" style={{ color: C.ink }}>
                <Receipt size={15} /> Complete Sale & Issue Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CatChip({ active, onClick, label, icon: Icon }) {
  return (
    <button onClick={onClick} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors" style={active ? { background: C.navyDark, borderColor: C.navyDark, color: "#fff" } : { borderColor: "#0000001a", color: C.gray }}>
      {Icon && <Icon size={13} />}
      {label}
    </button>
  );
}

function Inventory({ products, setProducts, showToast }) {
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()));

  async function saveProduct(form) {
    if (!form.name || !form.price) { showToast("Name and price are required", "err"); return; }
    let next;
    if (form.id) next = products.map((p) => (p.id === form.id ? { ...form, price: +form.price, cost: +form.cost, qty: +form.qty } : p));
    else next = [...products, { ...form, id: "p" + Date.now(), price: +form.price, cost: +form.cost, qty: +form.qty, rating: 4 }];
    await setProducts(next); setEditing(null); showToast("Saved successfully");
  }
  async function deleteProduct(id) { await setProducts(products.filter((p) => p.id !== id)); showToast("Item deleted"); }

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-black" style={{ color: C.navyDark }}>Inventory Management</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-2 rounded border border-black/15 text-sm" />
          </div>
          <button onClick={() => setEditing({ name: "", category: "ink", price: "", cost: "", qty: "", sku: "" })} className="amz-btn px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1" style={{ color: C.ink }}>
            <Plus size={15} /> New Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded border border-black/10 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-black/40 text-xs border-b border-black/10" style={{ background: "#F7F8F8" }}>
              <th className="p-3 font-medium">Item</th>
              <th className="p-3 font-medium">SKU</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Sale Price</th>
              <th className="p-3 font-medium">Cost</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const catInfo = CATEGORIES.find((c) => c.id === p.category);
              return (
                <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                  <td className="p-3 font-bold" style={{ color: C.link }}>{p.name}</td>
                  <td className="p-3 mono text-black/50">{p.sku}</td>
                  <td className="p-3"><span className="text-xs px-2 py-1 rounded-full" style={{ background: "#EAEDED", color: C.navy }}>{catInfo?.label}</span></td>
                  <td className="p-3 mono font-bold" style={{ color: C.price }}>EGP {money(p.price)}</td>
                  <td className="p-3 mono text-black/50">EGP {money(p.cost)}</td>
                  <td className="p-3 mono"><span style={p.qty <= 3 ? { color: C.price, fontWeight: 700 } : {}}>{p.qty}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setEditing(p)} className="text-xs px-2 py-1 rounded border border-black/10">Edit</button>
                      <button onClick={() => deleteProduct(p.id)} style={{ color: C.price }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {editing && <ProductModal product={editing} onClose={() => setEditing(null)} onSave={saveProduct} />}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product);
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded w-full max-w-md p-5 border-t-4" style={{ borderColor: C.orange }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black" style={{ color: C.navyDark }}>{product.id ? "Edit Item" : "New Item"}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-3">
          <Field label="Item name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
          <Field label="SKU"><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" /></Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sale price"><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" /></Field>
            <Field label="Cost price"><input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="input" /></Field>
          </div>
          <Field label="Stock quantity"><input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} className="input" /></Field>
        </div>
        <button onClick={() => onSave(form)} className="amz-btn mt-5 w-full py-2.5 rounded-full font-bold flex items-center justify-center gap-2" style={{ color: C.ink }}>
          <Save size={15} /> Save
        </button>
        <style>{`.input { border:1px solid rgba(0,0,0,0.15); border-radius:6px; padding:8px 12px; font-size:14px; width:100%; }`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-1 text-xs text-black/50">{label}{children}</label>;
}

function Invoices({ sales }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="p-5 md:p-8">
      <h1 className="text-xl font-black mb-6" style={{ color: C.navyDark }}>Orders & Invoices</h1>
      {sales.length === 0 && <div className="text-black/30 text-sm">No invoices yet</div>}
      <div className="flex flex-col gap-2">
        {sales.map((inv) => (
          <button key={inv.id} onClick={() => setOpen(inv)} className="bg-white rounded border border-black/10 p-4 flex items-center justify-between text-left hover:shadow-sm">
            <div>
              <div className="font-bold text-sm mono" style={{ color: C.link }}>{inv.id}</div>
              <div className="text-xs text-black/40">{todayStr(new Date(inv.date))} · {inv.items.length} items · {PAYMENT_METHODS.find((m) => m.id === inv.payMethod)?.label || "Cash"}</div>
            </div>
            <div className="font-black mono" style={{ color: C.price }}>EGP {money(inv.total)}</div>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded w-full max-w-sm p-5 border-t-4" style={{ borderColor: C.orange }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-black mono text-sm">{open.id}</h2>
              <button onClick={() => setOpen(null)}><X size={18} /></button>
            </div>
            <div className="text-xs text-black/40 mb-4">{todayStr(new Date(open.date))} · Paid via {PAYMENT_METHODS.find((m) => m.id === open.payMethod)?.label || "Cash"}</div>
            <div className="flex flex-col gap-2 border-t border-dashed border-black/15 pt-3">
              {open.items.map((it) => (
                <div key={it.id} className="flex justify-between text-sm">
                  <span>{it.name} × {it.qty}</span>
                  <span className="mono">{money(it.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-black/15 mt-3 pt-3 flex justify-between font-black">
              <span>Total</span><span className="mono" style={{ color: C.price }}>EGP {money(open.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Reports({ products, sales }) {
  const totalRevenue = sales.reduce((s, i) => s + i.total, 0);
  const totalProfit = sales.reduce((s, i) => s + i.items.reduce((ss, it) => ss + (it.price - it.cost) * it.qty, 0), 0);
  const totalOrders = sales.length;
  const lowStock = products.filter((p) => p.qty <= 3);

  const bestSellers = useMemo(() => {
    const map = {};
    sales.forEach((inv) => inv.items.forEach((it) => { map[it.name] = (map[it.name] || 0) + it.qty; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [sales]);
  const maxSold = bestSellers[0]?.[1] || 1;

  return (
    <div className="p-5 md:p-8">
      <h1 className="text-xl font-black mb-6" style={{ color: C.navyDark }}>Reports</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Sales" value={"EGP " + money(totalRevenue)} />
        <StatCard label="Net Profit" value={"EGP " + money(totalProfit)} />
        <StatCard label="Number of Invoices" value={totalOrders} />
        <StatCard label="Low Stock Items" value={lowStock.length} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded border border-black/10 p-5">
          <h3 className="font-bold text-sm mb-4">Best Sellers</h3>
          {bestSellers.length === 0 && <div className="text-black/30 text-sm">No data yet</div>}
          <div className="flex flex-col gap-3">
            {bestSellers.map(([name, qty]) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1"><span>{name}</span><span className="mono">{qty}</span></div>
                <div className="h-2 rounded-full bg-black/5">
                  <div className="h-2 rounded-full" style={{ width: `${(qty / maxSold) * 100}%`, background: C.orange }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded border border-black/10 p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-1.5"><AlertTriangle size={14} style={{ color: C.price }} /> Stock Alerts</h3>
          {lowStock.length === 0 && <div className="text-black/30 text-sm">Stock levels look good, nothing running low</div>}
          <div className="flex flex-col gap-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex justify-between text-sm rounded px-3 py-2" style={{ background: "#FDF3F1" }}>
                <span>{p.name}</span>
                <span className="mono font-bold" style={{ color: C.price }}>{p.qty} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded border border-black/10 p-4 border-t-4" style={{ borderTopColor: C.orange }}>
      <div className="text-xs text-black/40 mb-1">{label}</div>
      <div className="font-black mono text-lg" style={{ color: C.navyDark }}>{value}</div>
    </div>
  );
}
