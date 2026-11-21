export const variants = {
  relevo: "Relevo",
  luar: "Luar",
  meridiano: "Meridiano",
} as const;

export type Variant = keyof typeof variants;
