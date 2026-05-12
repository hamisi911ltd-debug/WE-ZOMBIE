import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    router: {
      entry: "frontend/router",
      routesDirectory: "frontend/routes",
      generatedRouteTree: "frontend/routeTree.gen.ts",
    },
  },
  cloudflare: true,
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-[hash].js`,
        chunkFileNames: `assets/chunk-[hash].js`,
        assetFileNames: `assets/style-[hash].[ext]`,
      },
    },
  },
  ssr: {
    external: ["lucide-react", "jose", "bcryptjs", "better-sqlite3", "drizzle-orm"],
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
