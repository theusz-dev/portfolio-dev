import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The engineering blog was `/tech` on the old site; keep those links alive.
      { source: "/:lang(pt|en)/tech/:path*", destination: "/:lang/engineering/:path*", permanent: true },
      { source: "/tech/:path*", destination: "/engineering/:path*", permanent: true },
    ];
  },
};

// Blog posts (src/content/{engineering,reflections}/{pt,en}/<slug>.mdx).
// Plugins are named by string so Turbopack can load them; options must stay serializable.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: [
      "rehype-slug",
      [
        "rehype-pretty-code",
        {
          // Both themes are emitted as CSS variables (--shiki-light / --shiki-dark);
          // each blog's CSS picks one, so code follows the blog's light/dark theme.
          theme: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
          keepBackground: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
