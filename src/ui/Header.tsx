import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { MODULES, TRACKS, modulesOfTrack, trackById } from "../modules/registry";
import { Logo, SITE_NAME, trackColor } from "./brand";
import { Icon } from "./icons";
import { currentTheme, saveTheme, type Theme } from "../theme";

/** Fecha um painel ao clicar fora dele ou apertar Esc. */
function useDismiss(open: boolean, close: () => void, ...refs: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (refs.every((r) => !r.current || !r.current.contains(e.target as Node))) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const isDark = theme === "dark";
  const toggle = () => {
    const next: Theme = isDark ? "light" : "dark";
    saveTheme(next);
    setTheme(next);
  };
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={isDark ? "Usar tema claro" : "Usar tema escuro"} title={isDark ? "Tema claro" : "Tema escuro"}>
      <Icon name={isDark ? "sun" : "moon"} />
    </button>
  );
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Busca de módulos. `inline` é a versão usada dentro de páginas (ex.: página não encontrada). */
export function Search({ inline = false }: { inline?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const nav = useNavigate();
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return [];
    return MODULES.filter((x) => norm(`${x.id} ${x.title} ${x.summary}`).includes(t)).slice(0, 8);
  }, [q]);
  useDismiss(open || expanded, () => {
    setOpen(false);
    setExpanded(false);
  }, box);

  // Atalhos "/" e Ctrl+K (só na busca do cabeçalho)
  useEffect(() => {
    if (inline) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
      if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setExpanded(true);
        window.setTimeout(() => input.current?.focus(), 0);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [inline]);

  const go = (slug: string) => {
    nav(`/m/${slug}`);
    setQ("");
    setOpen(false);
    setExpanded(false);
    input.current?.blur();
  };
  return (
    <div className={`search${inline ? " inline" : ""}${expanded ? " expanded" : ""}`} ref={box}>
      {!inline && (
        <button
          type="button"
          className="icon-btn search-toggle"
          aria-label="Buscar módulo"
          onClick={() => {
            setExpanded(true);
            window.setTimeout(() => input.current?.focus(), 0);
          }}
        >
          <Icon name="search" />
        </button>
      )}
      <div className="search-field">
        <Icon name="search" size={16} />
        <input
          ref={input}
          type="search"
          placeholder="Buscar módulo"
          aria-label="Buscar módulo"
          role="combobox"
          aria-expanded={open && q.trim() !== ""}
          aria-autocomplete="list"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            }
            if (e.key === "Enter" && results[active]) go(results[active].slug);
            if (e.key === "Escape") {
              setOpen(false);
              setExpanded(false);
            }
          }}
        />
        {!inline && <kbd className="search-kbd" aria-hidden="true">/</kbd>}
        {!inline && (
          <button type="button" className="search-close" aria-label="Fechar busca" onClick={() => setExpanded(false)}>
            <Icon name="close" size={16} />
          </button>
        )}
      </div>
      {open && q.trim() && (
        <ul className="search-results" role="listbox">
          {results.length === 0 && <li className="search-empty">Nenhum módulo encontrado.</li>}
          {results.map((r, i) => {
            const t = trackById(r.track)!;
            return (
              <li key={r.id} role="option" aria-selected={i === active}>
                <a
                  href={`#/m/${r.slug}`}
                  className={i === active ? "active" : ""}
                  onMouseEnter={() => setActive(i)}
                  onClick={(e) => {
                    e.preventDefault();
                    go(r.slug);
                  }}
                >
                  <span className="chip" style={trackColor(t.color)}>{r.id}</span>
                  <span className="search-text">
                    {r.title}
                    <small>{r.summary}</small>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Lista das trilhas, usada no menu do cabeçalho e no menu do celular. */
function TrackLinks({ onPick }: { onPick: () => void }) {
  return (
    <ul className="track-links">
      {TRACKS.map((t) => (
        <li key={t.id}>
          <Link to={`/trilha/${t.id}`} onClick={onPick} style={trackColor(t.color)}>
            <span className="track-letter">{t.letter}</span>
            <span>
              {t.title}
              <small>{modulesOfTrack(t.id).length} {modulesOfTrack(t.id).length === 1 ? "módulo" : "módulos"}</small>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TracksMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), wrap);
  return (
    <div className="nav-menu" ref={wrap}>
      <button type="button" className={`nav-item${active ? " active" : ""}`} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
        Trilhas <Icon name="chevronDown" size={15} />
      </button>
      {open && (
        <div className="dropdown">
          <TrackLinks onPick={() => setOpen(false)} />
          <Link to="/" className="dropdown-foot" onClick={() => setOpen(false)}>
            Ver todas na página inicial <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useDismiss(open, () => setOpen(false), wrap);
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div className="mobile-menu" ref={wrap}>
      <button type="button" className="icon-btn" aria-label={open ? "Fechar menu" : "Menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name={open ? "close" : "menu"} />
      </button>
      {open && (
        <nav className="mobile-panel" aria-label="Menu">
          <div className="mobile-label">Trilhas</div>
          <TrackLinks onPick={() => setOpen(false)} />
          <div className="mobile-links">
            <Link to="/laboratorio" className="btn" onClick={() => setOpen(false)}>
              <Icon name="flask" size={16} /> Laboratório
            </Link>
            <Link to="/sobre" className="btn" onClick={() => setOpen(false)}>
              Sobre
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const inTracks = pathname === "/" || pathname.startsWith("/trilha/") || pathname.startsWith("/m/");
  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label={`${SITE_NAME}, página inicial`}>
        <Logo />
        <span>{SITE_NAME}</span>
      </Link>
      <nav className="topnav" aria-label="Principal">
        <TracksMenu active={inTracks} />
        <NavLink to="/laboratorio" className="nav-item">
          Laboratório
        </NavLink>
        <NavLink to="/sobre" className="nav-item">
          Sobre
        </NavLink>
      </nav>
      <div className="spacer" />
      <Search />
      <ThemeToggle />
      <MobileMenu />
    </header>
  );
}
