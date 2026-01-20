/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '$lib/prisma';
import genResponse from '$lib/type/response';
import { v4 } from 'uuid';
import { SECRET_KEY } from '$env/static/private';

export async function POST({ request }: { request: any }): Promise<Response> {
	try {
		const {
			title,
			imgURL,
			style,
			url,
			secret,
			description
		}: {
			title: string;
			imgURL: string;
			style: string;
			url: string;
			secret: string;
			description: string;
		} = await request.json();

		if (secret !== SECRET_KEY) {
			return genResponse(403, { error: 'Secret 코드가 다릅니다.' });
		}

		if (title.length > 20) {
			return genResponse(404, { error: '제목이 너무 깁니다. (제목은 19글자 이하여야됨)' });
		}

		const cardId = v4();

		await prisma.card.create({
			data: {
				id: cardId,
				title,
				imgURL,
				style,
				url,
				description
			}
		});
		const card = await prisma.card.findUnique({
			where: {
				id: cardId
			}
		});
		return genResponse(302, { message: '카드를 생성했습니다.', card });
	} catch (err) {
		console.error(err);
		return genResponse(404, { error: '카드를 생성하는 도중 에러가 발생했습니다.', err });
	}
}

export async function GET(): Promise<Response> {
	try {
		const cards = await prisma.card.findMany();
		return genResponse(302, { cards });
	} catch (err) {
		console.error(err);
		return genResponse(404, { error: '카드를 불러오는 도중 에러가 발생했습니다.', err });
	}
}

export async function DELETE({ request }: { request: any }): Promise<Response> {
	try {
		const { id }: { id: string } = await request.json();
		await prisma.card.delete({
			where: {
				id: id
			}
		});
		return genResponse(302, { message: '카드를 지우는데 성공했습니다.' });
	} catch (err) {
		console.error(err);
		return genResponse(404, { error: '카드를 불러오는 도중 에러가 발생했습니다.', err });
	}
}
