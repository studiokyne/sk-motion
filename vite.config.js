import { defineConfig } from "vite";
import { resolve } from "node:path";
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const version = process.env.SK_MOTION_VERSION || pkg.version;

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "StudioKyneMotion",
      formats: ["iife"],
      fileName: () => "sk-motion.full.iife.min.js",
    },
    minify: "oxc",
    sourcemap: false,
    emptyOutDir: true,
  },
  define: {
    __SK_MOTION_VERSION__: JSON.stringify(version),
  },
});
