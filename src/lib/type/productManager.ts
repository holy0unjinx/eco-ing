import { prisma } from '$lib/prisma';
import genResponse from './response';

export async function addAmount(productId: number) {
	const product = await prisma.product.findUnique({
		where: {
			id: productId
		}
	});
	if (!product) {
		return genResponse(404, { error: '제품을 찾지 못하였습니다.' });
	}
	await prisma.product.update({
		where: {
			id: productId
		},
		data: {
			amount: product?.amount + 1
		}
	});
}

export async function subtractAmount(productId: number) {
	const product = await prisma.product.findUnique({
		where: {
			id: productId
		}
	});
	if (!product) {
		return genResponse(404, { error: '제품을 찾지 못하였습니다.' });
	}
	await prisma.product.update({
		where: {
			id: productId
		},
		data: {
			amount: product?.amount - 1
		}
	});
}
