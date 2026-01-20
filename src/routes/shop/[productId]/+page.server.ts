import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { COOLSMS_API_KEY, COOLSMS_API_SECRET, MY_URL, PHONE_NUMBER } from '$env/static/private';
import msgModule from 'coolsms-node-sdk';
import genResponse from '$lib/type/response';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const session = await locals.auth.validate();
		if (session) {
			throw redirect(302, '/');
		}
	} catch (error) {
		console.error(error);
	}
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const pid = params.productId;
		const session = await locals.auth.validate();
		const { phone } = Object.fromEntries(await request.formData()) as Record<string, string>;
		try {
			const product = await prisma.product.findUnique({
				where: {
					id: Number(pid)
				}
			});
			const product_key = await prisma.product_key.findFirst({
				where: {
					productId: Number(pid)
				}
			});
			const user = await prisma.profile.findUnique({
				where: {
					user_id: session.user.userId
				}
			});
			if (!user) {
				throw Error('사용자를 찾지 못하였습니다');
			}
			if (!product) {
				throw Error('제품을 찾지 못하였습니다');
			}
			if (user.point < product.price) {
				throw Error('돈 부족');
			}
			await prisma.profile.update({
				where: {
					user_id: session.user.userId
				},
				data: {
					point: user?.point - product?.price
				}
			});
			const product_d = await prisma.product.findUnique({
				where: {
					id: Number(pid)
				}
			});
			if (!product_d) {
				return genResponse(404, { error: '제품을 찾지 못하였습니다.' });
			}
			await prisma.product.update({
				where: {
					id: Number(pid)
				},
				data: {
					amount: product_d?.amount - 1
				}
			});
			const key = product_key?.keys;
			const response: any = await fetch(`${MY_URL}/api/send-mms`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					to: phone,
					text: key,
					where_to_use: product?.where_to_use,
					due_date: product_key?.due_date,
					pid: product.id
				})
			});
			console.log(response);
			await prisma.product_key.delete({
				where: {
					id: product_key?.id
				}
			});
		} catch (err) {
			console.error(err);
			return fail(400, { message: '구매 도중 오류가 발생했습니다.' });
		}
		throw redirect(302, '/');
	}
};
