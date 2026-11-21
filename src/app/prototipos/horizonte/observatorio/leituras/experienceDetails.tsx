export const notes: Record<string, { label: string; summary: string }> = {
  "umobi-fullstack": {
    label: "Umobi · Full stack",
    summary: "Cuidei do Orca, aplicativo de orçamentos para Android e iOS. Além das telas em Flutter, desenvolvi interfaces em Angular e painéis administrativos com Laravel e Filament.",
  },
  "umobi-mobile-freelance": {
    label: "Umobi · Mobile",
    summary: "No Revela Fácil, da Fujioka, transformei os layouts do Figma em telas Flutter e integrei as APIs de autenticação e produtos. Para uma startup de construção civil, entreguei um app com mais de 30 telas e mais de 60 rotas de API.",
  },
  "cett-ufg-web": {
    label: "CETT/UFG · Web",
    summary: "Otimizei consultas em Django e PostgreSQL em páginas que levavam de 20 a 60 segundos para carregar. Também desenvolvi um app para registrar o uso de veículos, com fotos e assinatura eletrônica.",
  },
};

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  month: "short", year: "numeric", timeZone: "UTC",
});

export function Month({ value }: { value: string }) {
  return <time dateTime={value}>{dateFormat.format(new Date(value + "-01T00:00:00Z"))}</time>;
}
