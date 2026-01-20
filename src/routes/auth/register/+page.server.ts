import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { register } from '$lib/account';

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
	default: async ({ request }) => {
		const { name, password, studentsId, barcode } = Object.fromEntries(
			await request.formData()
		) as Record<string, string>;

		try {
			await register(name, password, studentsId, barcode);
		} catch (err) {
			console.error(err);
			return fail(400, { message: '회원가입에 실패하였습니다.' });
		}
		throw redirect(302, '/auth/login');
	}
};
