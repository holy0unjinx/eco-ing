import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const session = await locals.auth.validate();
		if (!session) {
			throw redirect(302, '/login');
		}
	} catch (error) {
		console.error(error);
	}
};
