import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { ModulePage } from "./pages/ModulePage";
import { NotFound } from "./pages/NotFound";
import { TrackPage } from "./pages/TrackPage";
import { Loading } from "./ui/Feedback";
import { Footer } from "./ui/Footer";
import { Header } from "./ui/Header";
import { KeyBar } from "./ui/KeyBar";
import { useViewportVars } from "./ui/viewport";

const Lab = lazy(() => import("./pages/Lab"));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Rodapé com créditos só nas páginas de conteúdo (não nos módulos nem no Laboratório). */
function FooterIfContent() {
  const { pathname } = useLocation();
  const show = pathname === "/" || pathname.startsWith("/trilha/") || pathname === "/sobre";
  return show ? <Footer /> : null;
}

export function App() {
  useViewportVars();
  return (
    <>
      <ScrollTop />
      <a href="#conteudo" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById("conteudo")?.focus(); }}>
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trilha/:trackId" element={<TrackPage />} />
            <Route path="/m/:slug" element={<ModulePage />} />
            <Route path="/laboratorio" element={<Lab />} />
            <Route path="/sobre" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <FooterIfContent />
      <KeyBar />
    </>
  );
}
