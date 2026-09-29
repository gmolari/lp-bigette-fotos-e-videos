const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export const formatDateTime = (d: Date | string | null) => (d ? dateTime.format(new Date(d)) : null);
