import type { Metadata } from "next";
import { profile } from "@/content/portfolio";
import { HorizonteHero } from "./prototipos/horizonte/_components/HorizonteHero";
import { fontVariables } from "./prototipos/horizonte/_components/fonts";
import theme from "./prototipos/horizonte/_components/theme.module.css";
import { Ai } from "./prototipos/horizonte/observatorio/leituras/Ai";
import { Experience } from "./prototipos/horizonte/observatorio/leituras/Experience";
import { Footer } from "./prototipos/horizonte/observatorio/leituras/Footer";
import { Projects } from "./prototipos/horizonte/observatorio/leituras/projects/Projects";
import { Reading } from "./prototipos/horizonte/observatorio/leituras/Reading";
import { Skills } from "./prototipos/horizonte/observatorio/leituras/Skills";
import meridiano from "./prototipos/horizonte/observatorio/leituras/meridiano.module.css";
import { newsreader } from "./prototipos/horizonte/observatorio/leituras/textFont";

export const metadata: Metadata = {
  title: `${profile.shortName} — ${profile.role}`,
};

/** The chosen design (Horizonte · Observatório · Carta celeste · Meridiano). */
export default function Home() {
  return (
    <main className={`${theme.theme} ${fontVariables} ${newsreader.variable} ${meridiano.meridiano}`}>
      <HorizonteHero
        projectId="projetos"
        sectionLinks={{ Experiência: "#experiencia", Habilidades: "#habilidades", IA: "#ia", Contato: "#contato" }}
      />
      <Reading variant="meridiano" />
      <Experience />
      <Skills />
      <Projects />
      <Ai />
      <Footer />
    </main>
  );
}
