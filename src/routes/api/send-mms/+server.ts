import { COOLSMS_API_KEY, COOLSMS_API_SECRET, MY_URL, PHONE_NUMBER } from '$env/static/private';
import { CoolsmsMessageService } from '$lib/coolsms/coolsms.js';
import { prisma } from '$lib/prisma.js';
import genResponse from '$lib/type/response';
// 현재 모듈의 디렉토리 경로를 가져옵니다.
const coolsms = new CoolsmsMessageService(COOLSMS_API_KEY, COOLSMS_API_SECRET);
export const POST = async ({ request }) => {
	const { to, text, where_to_use, due_date, pid } = await request.json();
	if (!to || !text || !where_to_use || !due_date || !pid) {
		return new Response('Recipient number and text are required', { status: 400 });
	}
	try {
		const imgUrl = `${MY_URL}/api/send-mms/barcode?text=${text}`;
		const fileId = await coolsms.uploadFile(imgUrl, 'MMS').then((res) => res.fileId);

		const product = await prisma.product.findUnique({
			where: {
				id: pid
			}
		});

		const response = await coolsms
			.sendOne({
				imageId: fileId,
				to: to,
				from: PHONE_NUMBER,
				text: `${product?.name} 제품이 구매처리가 완료되었습니다. 전국 ${where_to_use} 에서 ${due_date} 이전 까지 사용 가능한 상품권입니다. \n 영수증 링크 : ${MY_URL}/receipt?ref=${pid}&barcode=${text}`,
				subject: '구매 처리 완료',
				autoTypeDetect: true
			})
			.then((res) => console.log(res));
		return genResponse(200, { message: '성공', response });
	} catch (err) {
		console.error(err);
		return genResponse(404, { error: '오류가 발생했습니다', err });
	}
};
