import {defineConfig} from 'vite'
import {devtools} from '@tanstack/devtools-vite'
import viteReact, {reactCompilerPreset} from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'

import {fileURLToPath, URL} from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        devtools(),
        viteReact(),
        babel({presets: [reactCompilerPreset()]}),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
