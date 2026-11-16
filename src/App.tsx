import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from "react-router";
import { MODULES } from "./modules/registry";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { ModulePage } from "./pages/ModulePage";
import { TrackPage } from "./pages/TrackPage";

const Lab = lazy(() => import("./pages/Lab"));

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="var(--accent)" />
      <path d="M6 24 L26 8" stroke="var(--surface)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 24 L24 24" stroke="var(--surface)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="17" cy="15" r="2.6" fill="var(--surface)" />
    </svg>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<string | undefined>(() => document.documentElement.dataset.theme);
  const systemDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme ? theme === "dark" : systemDark;
  const toggle = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("tema", next);
    } catch {
      /* ignora */
    }
    setTheme(next);
    window.dispatchEvent(new Event("themechange"));
  };
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={isDark ? "Usar tema claro" : "Usar tema escuro"} title={isDark ? "Tema claro" : "Tema escuro"}>
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      )}
    </button>
  );
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Search() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const nav = useNavigate();
  const box = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return [];
    return MODULES.filter((x) => norm(`${x.id} ${x.title} ${x.summary}`).includes(t)).slice(0, 8);
  }, [q]);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const go = (slug: string) => {
    nav(`/m/${slug}`);
    setQ("");
    setOpen(false);
  };
  return (
    <div className="search" ref={box}>
      <input
        type="search"
        placeholder="Buscar módulo"
        aria-label="Buscar módulo"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === "Enter" && results[active]) go(results[active].slug);
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && q.trim() && (
        <ul className="search-results" role="listbox">
          {results.length === 0 && <li className="muted" style={{ padding: 10, fontSize: 14 }}>Nenhum módulo encontrado.</li>}
          {results.map((r, i) => (
            <li key={r.id} role="option" aria-selected={i === active}>
              <a href={`#/m/${r.slug}`} className={i === active ? "active" : ""} onClick={(e) => { e.preventDefault(); go(r.slug); }}>
                {r.id} · {r.title}
                <small>{r.summary}</small>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollTop />
      <header className="topbar">
        <Link to="/" className="brand" aria-label="GAAL Interativo, página inicial">
          <Logo />
          <span>GAAL Interativo</span>
        </Link>
        <nav className="topnav" aria-label="Principal">
          <NavLink to="/" end>Trilhas</NavLink>
          <NavLink to="/laboratorio">Laboratório</NavLink>
          <NavLink to="/sobre">Sobre</NavLink>
        </nav>
        <div className="spacer" />
        <Search />
        <ThemeToggle />
      </header>
      <main>
        <Suspense fallback={<div className="page muted">Carregando…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trilha/:trackId" element={<TrackPage />} />
            <Route path="/m/:slug" element={<ModulePage />} />
            <Route path="/laboratorio" element={<Lab />} />
            <Route path="/sobre" element={<About />} />
            <Route path="*" element={<div className="page"><h1>Página não encontrada</h1><p><Link to="/">Voltar para o início</Link></p></div>} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
