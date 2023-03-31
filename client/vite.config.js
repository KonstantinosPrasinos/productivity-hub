import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svgrPlugin({
            svgrOptions: {
                icon: true,
            },
        }),
        react()
    ],
})