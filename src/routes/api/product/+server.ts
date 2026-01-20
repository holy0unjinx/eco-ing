/* eslint-disable @typescript-eslint/no-explicit-any */
import { SECRET_KEY } from '$env/static/private';
import { prisma } from '$lib/prisma';
import genResponse from '$lib/type/response';

export async function POST({ request }: { request: any }): Promise<Response> {
	try {
		const {
			id,
			name,
			imgURL,
			description,
			published,
			price,
			secret,
			where_to_use
		}: {
			id: number;
			name: string;
			imgURL: string;
			description: string;
			published: boolean;
			price: number;
			where_to_use: string;
			secret: string;
		} = await request.json();

		if (id === undefined) {
			if (secret !== SECRET_KEY) {
				return genResponse(403, { error: 'Secret 코드가 다릅니다.' });
			}

			await prisma.product.create({
				data: {
					name,
					imgURL,
					description,
					published,
					price,
					where_to_use,
					amount: 0
				}
			});

			return genResponse(302, { message: '새 제품을 생성하는데 성공했습니다.' });
		} else {
			const product = await prisma.product.findUnique({
				where: {
					id
				}
			});

			return genResponse(302, { message: '제품을 불러오는데 성공했습니다.', product });
		}
	} catch (err) {
		console.error(err);
		return genResponse(404, { error: '제품을 불러오지 못하였습니다.' });
	}
}

export async function GET(): Promise<Response> {
	try {
		const products = await prisma.product.findMany({
			orderBy: {
				id: 'asc'
			}
		});

		return genResponse(302, { message: '제품 목록을 불러오는데 성공하였습니다.', products });
	} catch (err) {
		console.error(err);
		return genResponse(404, { error: '제품 목록을 불러오지 못하였습니다.' });
	}
}

export async function DELETE({ request }: { request: any }): Promise<Response> {
	try {
		const { id, secret }: { id: number; secret: string } = await request.json();
		if (secret !== SECRET_KEY) {
			return genResponse(403, { error: 'Secret 코드가 다릅니다.' });
		}
		const product_keys = await prisma.product_key.findMany({
			where: {
				productId: id
			}
		});
		if (!product_keys) {
			return genResponse(404, { error: '지울 제품이 존재하지 않습니다.' });
		}
		for (let key of product_keys) {
			await prisma.product_key.delete({
				where: {
					id: key.id
				}
			});
		}

		await prisma.product.delete({
			where: {
				id: id
			}
		});

		return genResponse(302, { message: '제품을 삭제하는데 성공하였습니다.' });
	} catch (err) {
		console.error(err);
		return genResponse(404, { message: '제품을 지우는 도중 오류가 발생했습니다.' });
	}
}
