export const variants = {
  orbita: "Uma órbita",
  colunas: "Três colunas",
  palavras: "Em palavras",
} as const;

export type Variant = keyof typeof variants;
