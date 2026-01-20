import { auth } from '$lib/lucia';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const session = await locals.auth.validate();
		if (session) {
			throw redirect(302, '/');
		}
	} catch (error) {
		console.error(error);
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { username, password } = Object.fromEntries(await request.formData()) as Record<
			string,
			string
		>;

		try {
			const key = await auth.useKey('studentsId', username, password);
			const session = await auth.createSession({
				userId: key.userId,
				attributes: {}
			});
			locals.auth.setSession(session);
		} catch (err) {
			console.error(err);
			return fail(400, { message: '로그인하지 못하였습니다.' });
		}
		throw redirect(302, '/');
	}
};
