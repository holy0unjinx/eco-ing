/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '$lib/prisma';
import genResponse from '$lib/type/response';

export async function GET({ request }: { request: any }): Promise<Response> {
	const hak_list = [1, 2, 3];
	const ban_list = [1, 2, 3, 4, 5, 6];

	type Dictionary = Record<string, number>;
	let result: Dictionary = {};

	for (let haks of hak_list) {
		for (let bans of ban_list) {
			const profile = await prisma.profile.findMany({
				where: {
					class: haks + '0' + bans
				}
			});

			let points: number = 0;
			for (let point of profile) {
				points = points + point.point;
			}

			result['s' + haks + '0' + bans] = points;
		}
	}

	return genResponse(302, { message: '포인트가 있습니다.', result });
}

export async function POST({ request }: { request: any }): Promise<Response> {
	try {
		const { ban, hak }: { ban: string; hak: string } = await request.json();
		const profile = await prisma.profile.findMany({
			where: {
				class: ban + '0' + hak
			},
			select: {
				point: true
			}
		});
		let points: number = 0;
		for (let point of profile) {
			points = points + point.point;
		}

		if (!profile) {
			return genResponse(302, { error: '포인트가 없습니다.', points });
		}

		return genResponse(302, { message: '포인트가 있습니다.', points });
	} catch (err) {
		console.error(err);
		return genResponse(404, { message: '프로필을 가져오는 과정에서, 오류가 발생했습니다.', err });
	}
}
