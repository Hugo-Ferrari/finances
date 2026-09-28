import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({ // pega a configuração normal do nest e adiciona a configuração necessaria para o serwist gerar o service wolker
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig = {};

export default withSerwist(nextConfig);