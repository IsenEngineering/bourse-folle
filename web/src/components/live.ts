export default async function consumeLiveStream(
	url: string,
	update: (resources: BourseFolle.Resource[]) => void,
	abort?: AbortController
) {
	const response = await fetch(url, {
		signal: abort?.signal
	});
	if (!response.ok || !response.body) return;

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer: string | undefined = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });

		const lines: string[] = buffer?.split("\n") || [];
		buffer = lines.pop();

		for (const line of lines) {
			if (line.startsWith("data:")) {
				const data = JSON.parse(line.slice(5).trim()) as BourseFolle.Resource[];
				update(data)
			}
		}
	}
}
