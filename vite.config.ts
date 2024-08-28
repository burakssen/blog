import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "markdown-hot-reload",
      configureServer({ watcher, ws }) {
        watcher.add(path.resolve(__dirname, "public/**/*.md"));

        watcher.on("change", (file) => {
          if (file.endsWith(".md")) {
            ws.send({
              type: "full-reload",
              path: "*"
            });
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/blog/",
});
