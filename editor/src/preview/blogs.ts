// The blogs' own reading-page pieces, imported from the site by relative path.
// The preview builds the page out of these, so it changes when the site does.

import engArticle from "../../../src/app/[lang]/engineering/article.module.css";
import engShared from "../../../src/app/[lang]/engineering/blog.module.css";
import { strings as engStrings } from "../../../src/app/[lang]/engineering/_strings";
import { mdxComponents as engMdx } from "../../../src/app/[lang]/engineering/_components/mdx";
import { Toc as EngToc } from "../../../src/app/[lang]/engineering/_components/Toc";
import { Firmament as EngFirmament } from "../../../src/app/[lang]/engineering/_components/Firmament";
import * as engIcons from "../../../src/app/[lang]/engineering/_components/icons";

import refArticle from "../../../src/app/[lang]/reflections/article.module.css";
import refShared from "../../../src/app/[lang]/reflections/blog.module.css";
import { strings as refStrings } from "../../../src/app/[lang]/reflections/_strings";
import { mdxComponents as refMdx } from "../../../src/app/[lang]/reflections/_components/mdx";
import { Toc as RefToc } from "../../../src/app/[lang]/reflections/_components/Toc";
import { Firmament as RefFirmament } from "../../../src/app/[lang]/reflections/_components/Firmament";
import * as refIcons from "../../../src/app/[lang]/reflections/_components/icons";

import type { Collection } from "../lib/types";

/**
 * `fontVar`: the CSS variable each blog's `next/font` setup defines
 * (_components/fonts.ts). next/font doesn't exist here, so the preview sets
 * the same variables to the @fontsource families.
 */
export const blogs = {
  engineering: {
    article: engArticle,
    shared: engShared,
    strings: engStrings,
    mdxComponents: engMdx,
    Toc: EngToc,
    Firmament: EngFirmament,
    icons: engIcons,
    fontVar: "eng",
  },
  reflections: {
    article: refArticle,
    shared: refShared,
    strings: refStrings,
    mdxComponents: refMdx,
    Toc: RefToc,
    Firmament: RefFirmament,
    icons: refIcons,
    fontVar: "ref",
  },
} satisfies Record<Collection, unknown>;
