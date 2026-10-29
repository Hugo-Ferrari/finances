import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
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