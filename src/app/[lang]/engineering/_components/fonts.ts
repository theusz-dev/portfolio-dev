import { Cormorant_Garamond, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

/**
 * Engineering blog faces. Plex Sans carries the reading (calm, technical,
 * very legible on screens); Plex Mono does labels and code, as in the
 * portfolio; Cormorant only sets the masthead, the bridge to the portfolio.
 */
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--eng-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--eng-mono",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--eng-display",
});

export const fontVariables = `${sans.variable} ${mono.variable} ${display.variable}`;
