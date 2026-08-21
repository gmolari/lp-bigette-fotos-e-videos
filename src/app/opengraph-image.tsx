import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagem gerada no build para WhatsApp, Instagram, Facebook e X.
 * É o que aparece quando alguém cola o link da Bigette em qualquer lugar —
 * e como o tráfego dela vem de link compartilhado, isso importa muito.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0A0911 0%, #22202F 52%, #3B2E63 100%)",
          padding: "72px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#E6B13F",
            fontWeight: 700,
          }}
        >
          {site.city} · Ensaios · Eventos · Vídeo
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            lineHeight: 1.08,
            color: "#F3F2FA",
            maxWidth: "17ch",
          }}
        >
          Você vai se ver de um jeito que ainda não viu.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", width: 56, height: 4, background: "#AC95FA" }} />
          <div style={{ display: "flex", fontSize: 30, color: "#F3F2FA" }}>
            {site.name}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
