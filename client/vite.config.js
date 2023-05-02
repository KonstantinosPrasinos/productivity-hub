import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import react from '@vitejs/plugin-react';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [
        svgrPlugin({
            svgrOptions: {
                icon: true,
            },
        }),
        react()
    ]
})