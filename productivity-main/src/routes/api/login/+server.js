import { loggedInUsers } from '../../lib/variables.js';
import { redirect } from '@sveltejs/kit';
export async function POST({ request, cookies }) {
    const password = new URLSearchParams(await request.text()).get("password");
	if (password =="Namor2009") {
		const number = Math.random(1,100000);
		cookies.set('Randomnumber', number, { path: '/' })
		loggedInUsers[number]=true;
	}
	throw redirect(307, '/');
}