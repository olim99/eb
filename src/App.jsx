import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

// =============================
// 1) TYPES (JSDoc for hints)
// =============================
/**
 * @typedef {"light"|"dark"} Theme
 * @typedef {{
 *   user: null | { id: string; name: string; role: "user"|"admin" };
 *   login: (name: string, role?: "user"|"admin") => void;
 *   logout: () => void;
 * }} AuthCtx
 * @typedef {{
 *   theme: Theme;
 *   toggleTheme: () => void;
 * }} ThemeCtx
 * @typedef {{
 *   locale: "ru"|"uz"|"en";
 *   t: (key: string, vars?: Record<string,string|number>) => string;
 *   setLocale: (l: "ru"|"uz"|"en") => void;
 * }} I18nCtx
 * @typedef {{
 *   items: { id: number; title: string; price: number; qty: number }[];
 *   add: (p: { id: number; title: string; price: number }) => void;
 *   remove: (id: number) => void;
 *   change: (id: number, qty: number) => void;
 *   clear: () => void;
 *   total: number;
 *   count: number;
 * }} CartCtx
 * @typedef {{
 *   push: (type: "success"|"error"|"info", msg: string) => void;
 *   list: { id: number; type: string; msg: string }[];
 *   dismiss: (id: number) => void;
 * }} ToastCtx
 */

// =============================
// 2) CONTEXTS
// =============================
const ThemeContext = createContext(/** @type {ThemeCtx} */(null));
const AuthContext = createContext(/** @type {AuthCtx} */(null));
const I18nContext = createContext(/** @type {I18nCtx} */(null));
const CartContext = createContext(/** @type {CartCtx} */(null));
const ToastContext = createContext(/** @type {ToastCtx} */(null));

// =============================
// 3) I18N
// =============================
const STRINGS = {
  ru: {
    app_title: "MegaShop — очень большой сайт на useContext",
    home: "Главная",
    products: "Товары",
    cart: "Корзина",
    account: "Аккаунт",
    admin: "Админ",
    settings: "Настройки",
    search: "Поиск...",
    add_to_cart: "В корзину",
    price: "Цена",
    pcs: "шт.",
    total: "Итого",
    checkout: "Оформить",
    empty_cart: "Корзина пуста",
    login: "Войти",
    logout: "Выйти",
    welcome: "Добро пожаловать, {{name}}!",
    theme: "Тема",
    language: "Язык",
    light: "Светлая",
    dark: "Тёмная",
    save: "Сохранить",
    you_are_admin: "Вы администратор — здесь можно управлять товарами.",
    only_admin: "Доступно только админам",
    add_product: "Добавить товар",
    name: "Название",
    create: "Создать",
    filters: "Фильтры",
    category: "Категория",
    min_price: "Мин. цена",
    max_price: "Макс. цена",
    reset: "Сбросить",
    items_count: "Товаров: {{n}}",
  },
  uz: {
    app_title: "MegaShop — juda katta sayt useContext bilan",
    home: "Bosh sahifa",
    products: "Mahsulotlar",
    cart: "Savat",
    account: "Profil",
    admin: "Admin",
    settings: "Sozlamalar",
    search: "Qidiruv...",
    add_to_cart: "Savatga qo'shish",
    price: "Narx",
    pcs: "dona",
    total: "Jami",
    checkout: "Buyurtma",
    empty_cart: "Savat bo'sh",
    login: "Kirish",
    logout: "Chiqish",
    welcome: "Xush kelibsiz, {{name}}!",
    theme: "Mavzu",
    language: "Til",
    light: "Oq",
    dark: "Qora",
    save: "Saqlash",
    you_are_admin: "Siz admin — mahsulotlarni boshqarish mumkin.",
    only_admin: "Faqat adminlar uchun",
    add_product: "Mahsulot qo'shish",
    name: "Nomi",
    create: "Yaratish",
    filters: "Filtrlar",
    category: "Kategoriya",
    min_price: "Min narx",
    max_price: "Maks narx",
    reset: "Tozalash",
    items_count: "Mahsulotlar: {{n}}",
  },
  en: {
    app_title: "MegaShop — VERY BIG site using useContext",
    home: "Home",
    products: "Products",
    cart: "Cart",
    account: "Account",
    admin: "Admin",
    settings: "Settings",
    search: "Search...",
    add_to_cart: "Add to cart",
    price: "Price",
    pcs: "pcs",
    total: "Total",
    checkout: "Checkout",
    empty_cart: "Cart is empty",
    login: "Login",
    logout: "Logout",
    welcome: "Welcome, {{name}}!",
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    save: "Save",
    you_are_admin: "You are admin — manage products here.",
    only_admin: "Admins only",
    add_product: "Add product",
    name: "Name",
    create: "Create",
    filters: "Filters",
    category: "Category",
    min_price: "Min price",
    max_price: "Max price",
    reset: "Reset",
    items_count: "Items: {{n}}",
  }
};

// Helper translate
function useT(){
  const { locale } = useContext(I18nContext);
  return (key, vars={}) => {
    const s = STRINGS[locale][key] || key;
    return s.replace(/\{\{(.*?)\}\}/g, (_,k)=>String(vars[k.trim()] ?? ""));
  };
}

// =============================
// 4) PROVIDERS
// =============================
function ThemeProvider({ children }){
  const [theme,setTheme] = useState(/** @type {Theme} */((localStorage.getItem("theme")||"light")));
  useEffect(()=>{
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  },[theme]);
  const value = useMemo(()=>({ theme, toggleTheme(){ setTheme(p=> p==="light"?"dark":"light") } }),[theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function AuthProvider({ children }){
  const [user,setUser] = useState(()=>{
    const raw = localStorage.getItem("user");
    return raw? JSON.parse(raw): null;
  });
  useEffect(()=>{ localStorage.setItem("user", JSON.stringify(user)); },[user]);
  /** @type {AuthCtx} */
  const value = useMemo(()=>({
    user,
    login(name, role="user"){ setUser({ id: String(Date.now()), name, role }); },
    logout(){ setUser(null); }
  }),[user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function I18nProvider({ children }){
  const [locale,setLocale] = useState(/** @type {"ru"|"uz"|"en"} */(localStorage.getItem("locale")||"ru"));
  useEffect(()=>{ localStorage.setItem("locale", locale); },[locale]);
  const tMemo = useMemo(()=>({ locale, setLocale, t:(k,v)=>STRINGS[locale]?.[k]? STRINGS[locale][k].replace(/\{\{(.*?)\}\}/g, (_,k2)=>String((v||{})[k2.trim()] ?? "")) : k }),[locale]);
  return <I18nContext.Provider value={tMemo}>{children}</I18nContext.Provider>;
}

function cartReducer(state, action){
  switch(action.type){
    case "add": {
      const idx = state.items.findIndex(i=>i.id===action.item.id);
      if(idx>-1){ const items = state.items.slice(); items[idx] = {...items[idx], qty: items[idx].qty+1}; return {...state, items}; }
      return { ...state, items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case "remove":
      return { ...state, items: state.items.filter(i=>i.id!==action.id) };
    case "change":{
      const items = state.items.map(i=> i.id===action.id? {...i, qty: Math.max(1, action.qty)} : i);
      return { ...state, items };
    }
    case "clear":
      return { items: [] };
    default: return state;
  }
}

function CartProvider({ children }){
  const [state, dispatch] = useReducer(cartReducer, null, ()=>{
    const raw = localStorage.getItem("cart");
    return raw? JSON.parse(raw): { items: [] };
  });
  useEffect(()=>{ localStorage.setItem("cart", JSON.stringify(state)); },[state]);
  const total = state.items.reduce((s,i)=> s + i.price*i.qty, 0);
  const count = state.items.reduce((s,i)=> s + i.qty, 0);
  /** @type {CartCtx} */
  const value = useMemo(()=>({
    items: state.items,
    add: (p)=>dispatch({ type:"add", item: p }),
    remove: (id)=>dispatch({ type:"remove", id }),
    change: (id,qty)=>dispatch({ type:"change", id, qty }),
    clear: ()=>dispatch({ type:"clear" }),
    total, count
  }),[state,total,count]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function ToastProvider({ children }){
  const [list,setList] = useState([]);
  const push = (type, msg)=> setList(prev=> [...prev, { id: Date.now()+Math.random(), type, msg }]);
  const dismiss = (id)=> setList(prev=> prev.filter(x=>x.id!==id));
  const value = useMemo(()=>({ push, list, dismiss }),[list]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

function Providers({ children }){
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

// =============================
// 5) FAKE DB & API
// =============================
const CATEGORIES = ["phones","laptops","sport","food","books","games","fashion"];
const FAKE_PRODUCTS = Array.from({length:84}).map((_,i)=>({
  id: i+1,
  title: `Product ${i+1}`,
  price: Math.round(5 + Math.random()*995),
  category: CATEGORIES[i % CATEGORIES.length],
  rating: +(3 + Math.random()*2).toFixed(1),
  img: `https://picsum.photos/seed/p${i+1}/400/300`
}));

function fakeFetchProducts({ query="", category="", min=0, max=Infinity, page=1, perPage=24 }){
  return new Promise(resolve=>{
    setTimeout(()=>{
      const filtered = FAKE_PRODUCTS.filter(p=>
        p.title.toLowerCase().includes(query.toLowerCase()) &&
        (!category || p.category===category) &&
        p.price>=min && p.price<=max
      );
      const total = filtered.length;
      const pages = Math.max(1, Math.ceil(total/perPage));
      const items = filtered.slice((page-1)*perPage, page*perPage);
      resolve({ items, total, pages });
    }, 500 + Math.random()*600);
  });
}

// =============================
// 6) UI PRIMITIVES
// =============================
function Button({ as:Tag="button", className="", children, ...rest }){
  return (
    <Tag
      className={"inline-flex items-center justify-center px-4 py-2 rounded-2xl shadow-sm text-sm font-medium border border-transparent bg-gray-900 text-white hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition " + className}
      {...rest}
    >{children}</Tag>
  );
}

function Card({ className="", children }){
  return <div className={"rounded-2xl shadow-lg border border-black/5 bg-white dark:bg-zinc-900 dark:text-zinc-100 "+className}>{children}</div>;
}

function Input(props){
  return <input {...props} className={"w-full rounded-xl border px-3 py-2 outline-none bg-white dark:bg-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 "+(props.className||"")} />
}

function Select({ value, onChange, children, className="" }){
  return <select value={value} onChange={e=>onChange(e.target.value)} className={"w-full rounded-xl border px-3 py-2 bg-white dark:bg-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 "+className}>{children}</select>
}

function Badge({ children, className="" }){
  return <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 "+className}>{children}</span>
}

// =============================
// 7) PAGES & LARGE LAYOUT
// =============================
function Header({ current, setCurrent }){
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const { count } = useContext(CartContext);
  const { locale, setLocale } = useContext(I18nContext);
  const t = useT();

  const nav = [
    { key:"home", label: t("home") },
    { key:"products", label: t("products") },
    { key:"cart", label: t("cart") },
    { key:"account", label: t("account") },
    { key:"admin", label: t("admin") },
    { key:"settings", label: t("settings") },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-zinc-900/70 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="text-xl font-bold">🛒 MegaShop</div>
        <nav className="hidden md:flex gap-1">
          {nav.map(n=> (
            <button key={n.key} onClick={()=>setCurrent(n.key)}
              className={`px-3 py-1.5 rounded-xl text-sm ${current===n.key?"bg-black text-white dark:bg-white dark:text-black":"hover:bg-black/5 dark:hover:bg-white/10"}`}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Badge>{t("items_count", { n: count })}</Badge>
          <Select value={locale} onChange={setLocale} className="w-[110px]">
            <option value="ru">RU</option>
            <option value="uz">UZ</option>
            <option value="en">EN</option>
          </Select>
          <Button onClick={toggleTheme} className="!px-3">{theme==="light"?"🌞":"🌙"}</Button>
          {user? (
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700">{user.role}</Badge>
              <Button onClick={logout} className="bg-red-600">{t("logout")}</Button>
            </div>
          ) : (
            <AuthButton />
          )}
        </div>
      </div>
      <div className="md:hidden px-4 pb-3 flex gap-2 overflow-x-auto">
        {nav.map(n=> (
          <button key={n.key} onClick={()=>setCurrent(n.key)}
            className={`px-3 py-1.5 rounded-xl text-sm ${current===n.key?"bg-black text-white dark:bg-white dark:text-black":"hover:bg-black/5 dark:hover:bg-white/10"}`}>
            {n.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function Footer(){
  return (
    <footer className="border-t border-black/5 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <div className="font-semibold mb-2">MegaShop</div>
          <p className="text-zinc-600 dark:text-zinc-400">Очень большой демонстрационный сайт на React с useContext, без сторонних зависимостей.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Категории</div>
          <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
            {CATEGORIES.map(c=> <li key={c} className="capitalize">{c}</li>)}
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">О нас</div>
          <p className="text-zinc-600 dark:text-zinc-400">Контакты, адрес, правила, политика — всё как положено в большом сайте.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Подписка</div>
          <div className="flex gap-2">
            <Input placeholder="email@example.com" />
            <Button>OK</Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SidebarFilters({ onApply }){
  const t = useT();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  return (
    <Card className="p-4 sticky top-[64px]">
      <div className="font-semibold mb-3">{t("filters")}</div>
      <div className="space-y-3">
        <Input placeholder={t("search")} value={query} onChange={e=>setQuery(e.target.value)} />
        <div>
          <div className="text-sm mb-1">{t("category")}</div>
          <Select value={category} onChange={setCategory}>
            <option value="">—</option>
            {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-sm mb-1">{t("min_price")}</div>
            <Input type="number" value={min} onChange={e=>setMin(e.target.value)} />
          </div>
          <div>
            <div className="text-sm mb-1">{t("max_price")}</div>
            <Input type="number" value={max} onChange={e=>setMax(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={()=>onApply({ query, category, min: Number(min||0), max: Number(max||Infinity) })} className="w-full">OK</Button>
          <Button onClick={()=>{ setQuery(""); setCategory(""); setMin(""); setMax(""); onApply({ query:"", category:"", min:0, max:Infinity }); }} className="w-full bg-zinc-700">{t("reset")}</Button>
        </div>
      </div>
    </Card>
  );
}

function ProductsPage(){
  const t = useT();
  const { add } = useContext(CartContext);
  const [filters, setFilters] = useState({ query:"", category:"", min:0, max:Infinity });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items:[], total:0, pages:1 });

  useEffect(()=>{
    setLoading(true);
    fakeFetchProducts({ ...filters, page }).then(res=>{ setData(res); setLoading(false); });
  },[filters, page]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-3">
        <SidebarFilters onApply={(f)=>{ setPage(1); setFilters(f); }} />
      </div>
      <div className="md:col-span-9">
        {loading? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({length:12}).map((_,i)=> <Card key={i} className="h-52 animate-pulse" />)}
          </div>
        ):(
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.items.map(p=> (
                <Card key={p.id} className="overflow-hidden">
                  <img src={p.img} alt={p.title} className="w-full h-40 object-cover" />
                  <div className="p-3 space-y-2">
                    <div className="font-medium line-clamp-1" title={p.title}>{p.title}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">{t("price")}: ${p.price}</div>
                      <Badge>{p.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge>⭐ {p.rating}</Badge>
                      <Button onClick={()=>add(p)}>{t("add_to_cart")}</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({length:data.pages}).map((_,i)=> (
                <button key={i} onClick={()=>setPage(i+1)} className={`px-3 py-1.5 rounded-xl text-sm border ${page===i+1?"bg-black text-white dark:bg-white dark:text-black":"hover:bg-black/5 dark:hover:bg-white/10"}`}>{i+1}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CartPage(){
  const t = useT();
  const { items, total, change, remove, clear } = useContext(CartContext);
  return (
    <div>
      <div className="text-xl font-semibold mb-4">{t("cart")}</div>
      {items.length===0? (
        <Card className="p-6 text-center text-zinc-600 dark:text-zinc-400">{t("empty_cart")}</Card>
      ):(
        <>
          <div className="space-y-3">
            {items.map(i=> (
              <Card key={i.id} className="p-4 flex items-center gap-4">
                <img src={`https://picsum.photos/seed/cart${i.id}/120/80`} className="rounded-xl w-28 h-20 object-cover" />
                <div className="flex-1">
                  <div className="font-medium">{i.title}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">${i.price} × {i.qty} {t("pcs")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={()=>change(i.id, Math.max(1, i.qty-1))} className="!px-3">−</Button>
                  <Input type="number" value={i.qty} onChange={e=>change(i.id, Number(e.target.value||1))} className="w-16 text-center" />
                  <Button onClick={()=>change(i.id, i.qty+1)} className="!px-3">+</Button>
                </div>
                <Button onClick={()=>remove(i.id)} className="bg-red-600">×</Button>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-xl font-semibold">{t("total")}: ${total.toFixed(2)}</div>
            <div className="flex gap-2">
              <Button onClick={clear} className="bg-zinc-700">Clear</Button>
              <Button>{t("checkout")}</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function HomePage(){
  const t = useT();
  const { add } = useContext(CartContext);
  return (
    <div className="space-y-10">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
          <img src="https://picsum.photos/seed/hero/960/520" className="w-full h-full object-cover" />
          <div className="p-8 flex flex-col justify-center">
            <div className="text-3xl font-bold mb-3">{t("app_title")}</div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">Всё — через контексты: тема, язык, авторизация, корзина, тосты. Огромная страница с карточками, фильтрами, пагинацией, и т.п.</p>
            <div className="flex gap-3">
              <Button onClick={()=>add({ id:9999, title:"Mega Box", price:199 })}>🔥 Buy Mega Box</Button>
              <a href="#products" className="px-4 py-2 rounded-2xl border hover:bg-black/5 dark:hover:bg-white/10">Каталог</a>
            </div>
          </div>
        </div>
      </Card>

      <div id="products" className="space-y-4">
        <div className="text-xl font-semibold">Popular</div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {FAKE_PRODUCTS.slice(0,12).map(p=> (
            <Card key={p.id} className="overflow-hidden">
              <img src={p.img} className="w-full h-32 object-cover" />
              <div className="p-3">
                <div className="font-medium line-clamp-1">{p.title}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">${p.price}</div>
                <Button onClick={()=>add(p)} className="mt-2 w-full">{t("add_to_cart")}</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({length:6}).map((_,i)=> (
            <div key={i} className="flex items-start gap-3">
              <div className="text-2xl">{["🚀","🧠","🔒","⚙️","📦","💾"][i%6]}</div>
              <div>
                <div className="font-semibold">Feature #{i+1}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Большой блок описания функционала. Контексты позволяют удобно делиться состоянием по всему приложению.</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AccountPage(){
  const { user, login } = useContext(AuthContext);
  const t = useT();
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  return (
    <div className="max-w-lg">
      {user? (
        <Card className="p-6">
          <div className="text-xl font-semibold mb-2">{t("welcome", { name: user.name })}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">ID: {user.id} • Role: {user.role}</div>
        </Card>
      ): (
        <Card className="p-6 space-y-3">
          <div className="text-xl font-semibold">{t("login")}</div>
          <Input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
          <Select value={role} onChange={setRole}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </Select>
          <Button onClick={()=> name && login(name, /** @type any */(role))}>{t("login")}</Button>
        </Card>
      )}
    </div>
  );
}

function AdminPage(){
  const { user } = useContext(AuthContext);
  const t = useT();
  const toast = useContext(ToastContext);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  if(!user || user.role!=="admin"){
    return <Card className="p-6 text-center text-zinc-600 dark:text-zinc-400">{t("only_admin")}</Card>
  }
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{t("you_are_admin")}</div>
        <div className="grid md:grid-cols-3 gap-3">
          <Input placeholder={t("name")} value={name} onChange={e=>setName(e.target.value)} />
          <Input placeholder={t("price")} type="number" value={price} onChange={e=>setPrice(e.target.value)} />
          <Button onClick={()=>{ if(!name||!price) return toast.push("error","Заполните поля"); toast.push("success",`Создано: ${name} ($${price})`); setName(""); setPrice(""); }}>{t("create")}</Button>
        </div>
      </Card>
      <Card className="p-6">
        <div className="font-semibold mb-3">{t("add_product")}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({length:12}).map((_,i)=> (
            <Card key={i} className="overflow-hidden">
              <img src={`https://picsum.photos/seed/admin${i}/400/300`} className="w-full h-28 object-cover" />
              <div className="p-3">
                <div className="font-medium">New #{i+1}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Draft</div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SettingsPage(){
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { locale, setLocale } = useContext(I18nContext);
  const t = useT();
  return (
    <Card className="p-6 max-w-xl">
      <div className="text-xl font-semibold mb-4">{t("settings")}</div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{t("theme")}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{t("light")} / {t("dark")}</div>
          </div>
          <Button onClick={toggleTheme}>{theme==="light"?t("dark"):t("light")}</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{t("language")}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">RU / UZ / EN</div>
          </div>
          <Select value={locale} onChange={setLocale} className="w-32">
            <option value="ru">RU</option>
            <option value="uz">UZ</option>
            <option value="en">EN</option>
          </Select>
        </div>
      </div>
    </Card>
  );
}

function AuthButton(){
  const t = useT();
  const { login } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  return (
    <>
      <Button onClick={()=>setOpen(true)}>{t("login")}</Button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={()=>setOpen(false)}>
          <Card className="w-full max-w-sm p-5" onClick={e=>e.stopPropagation()}>
            <div className="text-lg font-semibold mb-3">{t("login")}</div>
            <div className="space-y-3">
              <Input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
              <Select value={role} onChange={setRole}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </Select>
              <Button onClick={()=>{ if(name){ login(name, /** @type any */(role)); setOpen(false);} }}>{t("login")}</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function Toasts(){
  const { list, dismiss } = useContext(ToastContext);
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      {list.map(t=> (
        <div key={t.id} className={`rounded-xl px-4 py-3 shadow-lg border text-sm ${t.type==="success"?"bg-emerald-600 text-white border-emerald-700": t.type==="error"?"bg-red-600 text-white border-red-700":"bg-zinc-900 text-white border-zinc-700"}`}
             onClick={()=>dismiss(t.id)}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// =============================
// 8) ROOT APP
// =============================
export default function App(){
  const [current, setCurrent] = useState("home");
  return (
    <Providers>
      <main className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
        <Header current={current} setCurrent={setCurrent} />
        <div className="max-w-7xl mx-auto px-4 py-6">
          {current==="home" && <HomePage />}
          {current==="products" && <ProductsPage />}
          {current==="cart" && <CartPage />}
          {current==="account" && <AccountPage />}
          {current==="admin" && <AdminPage />}
          {current==="settings" && <SettingsPage />}
        </div>
        <Footer />
        <Toasts />
      </main>
    </Providers>
  );
}
