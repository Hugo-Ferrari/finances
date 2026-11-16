import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Não recarregar a página quando a internet volta: o reload interrompia
  // o envio da fila offline (transação duplicada) e fazia a tela "piscar".
  // A sincronização é feita pelo useOfflineSync.
  reloadOnOnline: false,
});

const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://finances-koqv.onrender.com";

const nextConfig = {
  env: {
    NEXT_PUBLIC_API_MODE:
      process.env.VERCEL === "1" ? "same-origin" : "direct",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default withSerwist(nextConfig);