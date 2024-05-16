import express from 'express'
import { createServer } from 'https'
import { Server } from 'socket.io'

import { env } from './build/env.js'
import { handler } from './build/handler.js'
import { initListeners } from './build/websocket.js'
import fs from 'fs';

const port = env('PORT', '3000');
const host = '0.0.0.0'

const app = express()
const server = createServer({
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt'),
}, app)

const io = new Server(server)
initListeners(io);

// SvelteKit should handle everything else using Express middleware
// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server
app.use(handler)

server.listen({ port, host },  () => {
	console.log(`Listening on ${host + ':' + port}`);
})
