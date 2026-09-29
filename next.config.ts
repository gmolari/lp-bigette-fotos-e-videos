import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * Hosts autorizados a puxar os recursos de /_next/ em DESENVOLVIMENTO.
   *
   * O `next dev` bloqueia origem estranha por padrão. Ao expor a página
   * por um túnel (ngrok, cloudflared) para mostrar no celular ou para o
   * cliente, o HTML chega mas TODO chunk de JS e CSS é recusado — e o
   * sintoma é "a página não renderiza nada", que parece erro do site.
   *
   * Só vale em dev; em produção esta chave é ignorada.
   * Para um host que não esteja na lista:  NEXT_DEV_ORIGIN=seu.host npm run dev
   */
  allowedDevOrigins: [
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.ngrok.io",
    "*.trycloudflare.com",
    "*.loca.lt",
    ...(process.env.NEXT_DEV_ORIGIN ? [process.env.NEXT_DEV_ORIGIN] : []),
  ],

  poweredByHeader: false,
  compress: true,

  experimental: {
    serverActions: {
      /**
       * O upload de foto passa inteiro por uma server action, e o padrão
       * é 1 MB. A foto pode ter até 4 MB (MAX_PICTURE_BYTES, em
       * modules/pictures/domain/picture.ts) + a sobra do multipart.
       * Não suba além de 4,5 MB: é onde a Vercel corta o corpo da
       * função, e o erro de lá não chega a ser uma resposta da action.
       */
      bodySizeLimit: "4.5mb",
    },
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    /**
     * As fotos do portfólio moram num Vercel Blob PRIVADO e chegam pela
     * rota /media/… do próprio site — caminho local, então o otimizador
     * aceita sem `remotePatterns`.
     *
     * O único host de fora: a miniatura do YouTube, usada como capa do
     * vídeo quando o painel não tem uma (spec 007). Só `/vi/`.
     */
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Fotos são o ativo: cache longo e imutável
        source: "/portfolio/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
