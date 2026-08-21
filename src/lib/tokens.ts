/** Substitui os marcadores {CIDADE}, {PRAZO}, {RAIO} nos textos. */
import { site } from "@/config/site";

export function fillTokens(text: string): string {
  return text
    .replaceAll("{CIDADE}", site.city)
    .replaceAll("{ESTADO}", site.state)
    .replaceAll("{REGIAO}", site.region)
    .replaceAll("{PRAZO}", String(site.prazoEntregaDias))
    .replaceAll("{RAIO}", String(site.serviceRadiusKm))
    .replaceAll("{NOME}", site.shortName);
}
