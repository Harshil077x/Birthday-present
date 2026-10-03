import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: "/Birthday-present/",
  },

  tanstackStart: {
    server: { entry: "server" },

    spa: {
      prerender: {
        outputPath: "/index.html",
      },
    },
  },
});
