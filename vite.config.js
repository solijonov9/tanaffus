import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const sourceEntry = resolve(projectRoot, "seminar-source.html");
const publishedEntry = resolve(projectRoot, "index.html");
export default defineConfig({
  root: projectRoot,
  base: "./",
  plugins: [
    {
      name: "seminar-source-entry",
      // Pages serves index.html directly; Vite always builds the editable source entry.
      transformIndexHtml: {
        order: "pre",
        handler(html, context) {
          return context.filename &&
            resolve(context.filename) === publishedEntry
            ? readFileSync(sourceEntry, "utf8")
            : html;
        },
      },
      configureServer(server) {
        server.watcher.add(sourceEntry);
        server.watcher.on("change", (file) => {
          if (resolve(file) === sourceEntry)
            server.ws.send({ type: "full-reload" });
        });
      },
    },
  ],
  server: {
    host: "0.0.0.0",
    watch: {
      ignored: [
        "**/.artifacts/**",
        "**/test-results/**",
        "**/playwright-report/**",
      ],
    },
  },
});
