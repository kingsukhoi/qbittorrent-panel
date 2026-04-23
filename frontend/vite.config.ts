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
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
                        return 'vendor-react';
                    }
                    if (id.includes('@tanstack/react-router') || id.includes('@tanstack/react-query') || id.includes('@tanstack/react-table')) {
                        return 'vendor-tanstack';
                    }
                    if (id.includes('node_modules/graphql/') || id.includes('node_modules/graphql-request/')) {
                        return 'vendor-graphql';
                    }
                    if (id.includes('@headlessui/react') || id.includes('node_modules/lucide-react/')) {
                        return 'vendor-ui';
                    }
                },
            },
        },
    },
})
