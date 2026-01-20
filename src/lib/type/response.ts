export default function genResponse(
	status: number,
	contents: { message?: string; error?: string; [key: string]: any }
): Response {
	return new Response(JSON.stringify({ contents }), {
		status: status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
