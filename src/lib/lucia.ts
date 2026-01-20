import { lucia } from 'lucia';
import { prisma } from '@lucia-auth/adapter-prisma';
import { sveltekit } from 'lucia/middleware';
import { dev } from '$app/environment';
import { prisma as client } from '$lib/prisma';

export const auth = lucia({
	adapter: prisma(client, {
		user: 'user',
		key: 'key',
		session: 'session'
	}),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	// previously `transformDatabaseUser`
	getUserAttributes: (userData) => {
		return {
			// `userId` included by default!!
			username: userData.username,
			name: userData.name,
			profile: userData
		};
	}
});

export type Auth = typeof auth;
