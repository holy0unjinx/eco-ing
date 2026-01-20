import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { prisma } from '$lib/prisma';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { name, email } = Object.fromEntries(await request.formData()) as Record<string, string>;
		try {
			const session = await locals.auth.validate();
			if (!session || !session.user) {
				console.log('No session or user found');
				console.log(session);
				throw redirect(302, '/');
			}

			await prisma.profile.update({
				where: {
					user_id: session.user.userId
				},
				data: {
					email: email
				}
			});

			await prisma.user.update({
				where: {
					id: session.user.userId
				},
				data: {
					name: name
				}
			});
		} catch (err) {
			console.error(err);
			return fail(400, { message: 'Could not change user config' });
		}
		throw redirect(302, '/');
	}
};
