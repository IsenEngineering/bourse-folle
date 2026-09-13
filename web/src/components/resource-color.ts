export default function resourceColor(resource_id: string, saturation = 65, lightness = 55) {
	let hash = 0
	for (let i = 0; i < resource_id.length; i++) {
		hash = resource_id.charCodeAt(i) + ((hash << 5) - hash)
	}
	const hue = Math.abs(hash) % 360
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
