/* eslint-disable @typescript-eslint/no-explicit-any */
import { SECRET_KEY } from '$env/static/private';
import { prisma } from '$lib/prisma';
import genResponse from '$lib/type/response';

export async function POST({ request, locals }: { request: any; locals: any }): Promise<Response> {
	try {
		const { barcode, points, secret }: { barcode: string; points: string; secret: string } =
			await request.json();
		if (secret !== SECRET_KEY) {
			return genResponse(403, { error: 'Secret 코드가 다릅니다.' });
		}

		const profile = await prisma.profile.findUnique({
			where: { barcode }
		});

		if (!profile) {
			return genResponse(404, { error: '프로필을 찾지 못하였습니다.' });
		}

		await prisma.profile.update({
			where: {
				barcode
			},
			data: {
				point: profile.point + Number(points)
			}
		});

		return genResponse(302, { error: '성공했습니다.' });
	} catch (err) {
		console.error(err);
		return genResponse(404, { error: '사용자 정보를 수정하는 과정에서 오류가 발생했습니다.' });
	}
}
