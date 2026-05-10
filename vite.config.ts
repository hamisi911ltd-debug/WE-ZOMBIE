// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// After restructuring src/ into src/frontend/ and src/backend/, we need to tell
// TanStack Start where the router entry, routes directory, and generated route tree live.
// All paths under `router` are resolved relative to `srcDirectory` (default: "src").
export default defineConfig({
  tanstackStart: {
    router: {
      entry: "frontend/router",
      routesDirectory: "frontend/routes",
      generatedRouteTree: "frontend/routeTree.gen.ts",
    },
    server: { entry: "server" },
  },
});
