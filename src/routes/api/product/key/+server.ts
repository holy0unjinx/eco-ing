/* eslint-disable @typescript-eslint/no-explicit-any */
import { SECRET_KEY } from '$env/static/private';
import { prisma } from '$lib/prisma';
import { addAmount, subtractAmount } from '$lib/type/productManager';
import genResponse from '$lib/type/response';
import { v4 } from 'uuid';

export async function POST({ request }: { request: any }): Promise<Response> {
	try {
		const {
			key,
			productId,
			secret,
			due_date
		}: {
			key: string;
			productId: number;
			secret: string;
			due_date: string;
		} = await request.json();

		if (secret !== SECRET_KEY) {
			return genResponse(403, { error: 'Secret 코드가 다릅니다.' });
		}

		if (key === undefined) {
			// KEY가 제공되지 않는다면, ProductId 값을 가진 첫번째 키를 불러온다.
			const product_key = await prisma.product_key.findFirst({
				where: {
					productId
				}
			});

			return genResponse(302, { product_key });
		} else {
			await prisma.product_key.create({
				data: {
					id: v4(),
					keys: key,
					productId,
					due_date
				}
			});

			await addAmount(productId);

			return genResponse(302, { message: '성공적으로 제품 키를 추가했습니다.' });
		}
	} catch (err) {
		console.error(err);
		return genResponse(404, { error: '오류가 발생했습니다.', err });
	}
}

export async function DELETE({ request }: { request: any }): Promise<Response> {
	try {
		const { id }: { id: string } = await request.json();
		const product = await prisma.product_key.findUnique({
			where: {
				id
			}
		});
		if (!product) {
			return genResponse(404, { error: '제품이 존재하지 않습니다.' });
		}
		const productId = product.productId;
		await prisma.product_key.delete({
			where: {
				id
			}
		});

		await subtractAmount(productId);

		return genResponse(302, { message: '제품 키를 삭제하는데 성공하였습니다.' });
	} catch (err) {
		console.error(err);
		return genResponse(404, { error: '제품 키를 삭제하는데 오류가 발생했습니다.', err });
	}
}
