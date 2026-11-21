import { Newsreader } from "next/font/google";

// Running-text face for Meridiano; titles and the hero stay in Cormorant.
export const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
});
