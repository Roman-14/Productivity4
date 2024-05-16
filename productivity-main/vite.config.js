import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { configureServer } from './src/routes/api/websocket.js'

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'webSocketServer',
			configureServer
		}
	]
});
