import { auth } from './lucia';
import { prisma } from './prisma';
import { v4 } from 'uuid';

export async function register(
	name: string,
	password: string | null,
	studentsId: string,
	barcode: string
) {
	try {
		await auth.createUser({
			key: {
				providerId: 'studentsId',
				providerUserId: studentsId,
				password
			},
			attributes: {
				name,
				studentsId
			}
		});

		const key = await auth.useKey('studentsId', studentsId, password);

		await prisma.profile.create({
			data: {
				id: v4(),
				user_id: key.userId,
				class: studentsId.charAt(0) + '0' + studentsId.charAt(2),
				point: 0,
				level: 1,
				barcode: barcode
			}
		});
	} catch (error) {
		console.error(error);
	}
}

export async function getProfile(userId: any) {
	const profile = await prisma.profile.findUnique({
		where: {
			user_id: userId
		}
	});

	return profile;
}
