
import { redirect } from '@sveltejs/kit';
import { loggedInUsers } from './routes/lib/variables.js';

export const handle = async ({ event, resolve }) => {
    if (event.url.pathname == '/login' || event.url.pathname == '/api/login')
        return await resolve(event);
  const { cookies } = event
  const sessionId = cookies.get('Randomnumber')
if (loggedInUsers[sessionId]) {
    return await resolve(event);
}

  throw redirect(307, '/login');
}