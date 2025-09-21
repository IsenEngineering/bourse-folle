import { InlineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite"
import deno from "@deno/vite-plugin"

const inputs = [
    "config/index.html",
    "menu/index.html",
    "event/index.html",
    "tv/index.html",
]

export default {
    plugins: [ tailwindcss(), deno() ],
    server: {
        host: "0.0.0.0"
    },
    build: {
        target: "esnext",
        outDir: "../dist",
        emptyOutDir: true,
        rollupOptions: {
            input: inputs.reduce((o, input) => {
                o[input] = "./web/" + input
                return o
            }, {} as Record<string, string>)
        }
    },
    root: "./web",
    appType: "mpa"
} as InlineConfig