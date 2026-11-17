import { Children, createContext, isValidElement, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "react-router";
import { MODULES, trackById, type ModuleMeta } from "../modules/registry";
import { SnapContext } from "../state/context";
import { trackColor } from "./brand";
import { Block, Presets, useScrollFade } from "./controls";
import { createEqPin, EqPinContext, type EqPin } from "./eqPin";
import { useGraphSplit } from "./GraphSplit";
import { Icon } from "./icons";
import { COARSE, useMedia } from "./media";
import { Tex } from "./Tex";

export const ModuleMetaContext = createContext<ModuleMeta | null>(null);

type TabId = "explorar" | "explicacao" | "passos";

const HINT_KEY = "dica-grafico-vista";

function hintSeen(): boolean {
  try {
    return sessionStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Os exemplos (Presets) são atalhos: sobem para logo depois do bloco da equação.
 * Só mexe em filhos de primeiro nível; se não houver bloco de equação, mantém a ordem original.
 */
function presetsAfterEquation(children: ReactNode): ReactNode[] {
  const arr = Children.toArray(children);
  const isPresets = (el: ReactNode) => isValidElement(el) && el.type === Presets;
  const presets = arr.filter(isPresets);
  if (presets.length === 0) return arr;
  const rest = arr.filter((el) => !isPresets(el));
  const eq = rest.findIndex((el) => isValidElement<{ title?: unknown }>(el) && el.type === Block && /^Equa/.test(String(el.props.title ?? "")));
  if (eq < 0) return arr;
  return [...rest.slice(0, eq + 1), ...presets, ...rest.slice(eq + 1)];
}

/**
 * Barra entre o gráfico e o painel (só no celular): alça para mudar o tamanho do gráfico
 * e a equação viva atual, que fica visível em qualquer ponto da rolagem.
 */
function EqBar({ pin, split }: { pin: EqPin; split: ReturnType<typeof useGraphSplit> }) {
  const { tex } = useSyncExternalStore(pin.subscribe, pin.get, pin.get);
  const ref = useRef<HTMLDivElement>(null);
  useScrollFade(ref);
  return (
    <div className="eqbar" {...split.barProps}>
      <div className={`eqbar-handle${tex ? "" : " alone"}`} {...split.handleProps}>
        <span />
      </div>
      {tex && (
        <div className="eqbar-eq" ref={ref} aria-live="off">
          <Tex block>{tex}</Tex>
        </div>
      )}
    </div>
  );
}

/**
 * Página de módulo: gráfico à esquerda e painel à direita no computador.
 * No celular em pé: gráfico em cima, barra da equação (que também é a alça) e painel com rolagem própria.
 * No celular deitado: gráfico à esquerda e, à direita, a barra da equação e o painel.
 */
export function ModuleLayout({
  graph,
  children,
  explain,
  steps,
  onReset,
  snapToggle = true,
}: {
  graph: ReactNode;
  children: ReactNode;
  explain: ReactNode;
  steps?: ReactNode;
  onReset: () => void;
  snapToggle?: boolean;
}) {
  const meta = useContext(ModuleMetaContext);
  const [snap, setSnap] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<TabId>("explorar");
  const [hint, setHint] = useState(() => !hintSeen());
  const coarse = useMedia(COARSE);
  const pin = useMemo(createEqPin, []);
  const moduleRef = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const head = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const split = useGraphSplit(moduleRef);
  const base = useId();
  const track = meta ? trackById(meta.track) : undefined;
  const sameTrack = meta ? MODULES.filter((x) => x.track === meta.track) : [];
  const idx = meta ? MODULES.indexOf(meta) : -1;
  const prev = idx > 0 ? MODULES[idx - 1] : undefined;
  const next = idx >= 0 && idx < MODULES.length - 1 ? MODULES[idx + 1] : undefined;
  const current: TabId = tab === "passos" && !steps ? "explorar" : tab;

  useEffect(() => {
    // Computador: o corpo do painel rola. Celular: o painel inteiro rola e as abas grudam no topo.
    body.current?.scrollTo?.({ top: 0 });
    const p = panel.current;
    const headH = head.current?.offsetHeight ?? 0;
    if (p && p.scrollHeight > p.clientHeight && p.scrollTop > headH) p.scrollTo({ top: headH });
  }, [current]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copie o link:", window.location.href);
    }
  };

  const dismissHint = () => {
    if (!hint) return;
    setHint(false);
    try {
      sessionStorage.setItem(HINT_KEY, "1");
    } catch {
      /* sem armazenamento: some só nesta página */
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "explorar", label: "Explorar" },
    { id: "explicacao", label: "Explicação" },
  ];
  if (steps) tabs.push({ id: "passos", label: "Passo a passo" });

  const is3d = meta?.dimension === "3d";
  const hintText = coarse
    ? is3d
      ? "Um dedo gira · dois dedos movem e dão zoom"
      : "Arraste os pontos · pinça para zoom"
    : is3d
      ? "Arraste para girar"
      : "Arraste os pontos coloridos";

  return (
    <SnapContext.Provider value={{ snap, step: 0.5 }}>
      <EqPinContext.Provider value={pin}>
        <div
          className="module"
          ref={moduleRef}
          style={{ ...(track ? trackColor(track.color) : {}), ...split.style }}
          data-dragging={split.dragging ? "" : undefined}
        >
          <div className="module-graph" onPointerDownCapture={dismissHint}>
            {graph}
            {hint && (
              <div className="graph-hint" aria-hidden="true">
                <Icon name="drag" size={16} />
                {hintText}
              </div>
            )}
          </div>
          <EqBar pin={pin} split={split} />
          <aside className="module-panel" ref={panel} aria-label="Painel do módulo">
            {meta && (
              <header className="panel-head" ref={head}>
                <div className="panel-head-row">
                  <div className="crumb">
                    {track && (
                      <Link to={`/trilha/${track.id}`} className="crumb-track">
                        {track.letter} · {track.title}
                      </Link>
                    )}
                    <span className="dots" aria-label={`Módulo ${sameTrack.indexOf(meta) + 1} de ${sameTrack.length} da trilha`}>
                      {sameTrack.map((m) => (
                        <Link
                          key={m.id}
                          to={`/m/${m.slug}`}
                          className={`dot${m === meta ? " on" : ""}`}
                          title={`${m.id} · ${m.title}`}
                          aria-label={`${m.id} · ${m.title}`}
                          aria-current={m === meta ? "page" : undefined}
                        />
                      ))}
                    </span>
                  </div>
                  <div className="panel-actions">
                    <button type="button" className="icon-btn small" onClick={onReset} aria-label="Reiniciar valores" title="Reiniciar valores">
                      <Icon name="reset" size={17} />
                    </button>
                    <button type="button" className="icon-btn small" onClick={copy} aria-label="Copiar link deste estado" title="Copiar link deste estado">
                      <Icon name={copied ? "check" : "link"} size={17} />
                    </button>
                    {snapToggle && (
                      <button
                        type="button"
                        className="icon-btn small"
                        aria-pressed={snap}
                        onClick={() => setSnap((s) => !s)}
                        aria-label="Encaixar pontos na grade"
                        title={snap ? "Encaixar na grade: ligado" : "Encaixar na grade: desligado"}
                      >
                        <Icon name="grid" size={17} />
                      </button>
                    )}
                    {copied && (
                      <span className="toast" role="status">
                        Link copiado
                      </span>
                    )}
                  </div>
                </div>
                <h1>{meta.title}</h1>
                <p className="summary">{meta.summary}</p>
              </header>
            )}
            <div className="module-tabs" role="tablist" aria-label="Seções do módulo">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`${base}-${t.id}`}
                  aria-selected={t.id === current}
                  aria-controls={`${base}-panel`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="panel-body" ref={body} role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-${current}`}>
              {/* Explorar fica sempre montado (escondido nas outras abas) para a equação da barra continuar viva. */}
              <div hidden={current !== "explorar"}>{presetsAfterEquation(children)}</div>
              {current === "explicacao" && (
                <div className="explain">
                  {meta && <p className="explain-summary">{meta.summary}</p>}
                  {explain}
                </div>
              )}
              {current === "passos" && <div className="explain">{steps}</div>}
              <nav className="pager" aria-label="Módulos vizinhos">
                {prev ? (
                  <Link to={`/m/${prev.slug}`} className="pager-card prev">
                    <small>
                      <Icon name="arrowLeft" size={14} /> Anterior
                    </small>
                    <span>
                      {prev.id} · {prev.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link to={`/m/${next.slug}`} className="pager-card next">
                    <small>
                      Próximo <Icon name="arrowRight" size={14} />
                    </small>
                    <span>
                      {next.id} · {next.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            </div>
          </aside>
        </div>
      </EqPinContext.Provider>
    </SnapContext.Provider>
  );
}
