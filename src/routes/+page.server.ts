import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProfile } from '$lib/account';
import CoolsmsMessageService from 'coolsms-node-sdk';
import { COOLSMS_API_KEY, COOLSMS_API_SECRET } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
	// const session = await locals.auth.validate();
	// if (!session) {
	// 	throw redirect(302, '/auth/register');
	// }

	const session = await locals.auth.validate();
};
