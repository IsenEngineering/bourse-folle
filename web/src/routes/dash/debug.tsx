import { useLocation } from "@solidjs/router"
import { createMemo, useContext } from "solid-js"
import { SessionCtx } from "./session"

export default () => {
	const location = useLocation()
	const session = useContext(SessionCtx)
	const whoami = createMemo(() => {
		if(!session) return null
		const data = session()
		if (!data) return null

		return {
			...data,
			expires_at: data.expires_at
				? new Date(data.expires_at * 1000).toLocaleString()
				: undefined
		}
	})

	return <>
        <pre class="p-4 text-white">
			{JSON.stringify({
				location,
				whoami: whoami()
            }, undefined, 4)}
        </pre>
    </>
}
