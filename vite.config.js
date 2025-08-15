import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        watch: {
            usePolling: true,     // Force polling
            interval: 500,        // Check for changes every 500ms
        },
        host: false,
    },
});