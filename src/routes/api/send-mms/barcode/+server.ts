import genResponse from '$lib/type/response.js';
import sharp from 'sharp';

// 현재 모듈의 디렉토리 경로를 가져옵니다.
export async function GET({ url }): Promise<Response> {
	const text = url.searchParams.get('text');

	if (!text) {
		return genResponse(400, { message: '오류' });
	}

	try {
		const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(
			text
		)}&scale=3&height=10&includetext=true&textalign=center&padding=5&backgroundcolor=ffffff`;

		const response = await fetch(barcodeUrl);
		if (!response.ok) {
			throw new Error('Failed to fetch barcode');
		}

		const pngBuffer = await response.arrayBuffer();
		const jpgBuffer = await sharp(pngBuffer).jpeg().toBuffer();

		return new Response(jpgBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'image/jpeg',
				'Content-Disposition': 'inline'
			}
		});
	} catch (err) {
		console.error(err);
		return genResponse(400, { error: '오류', err });
	}
}
