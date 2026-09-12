import { useNavigate } from "@solidjs/router"
import { createContext, createResource, ParentProps, Resource, Show, useContext } from "solid-js"

export const Profile = () => {
	const session = useContext(SessionCtx)
	return <Show when={session && session() !== undefined && session()!.picture}
		fallback={<div class="w-6 h-6 md:w-11 md:h-11 rounded-full
		aspect-square overflow-hidden bg-gray-300 animate-pulse" />}>
		<img src={session!()!.picture!} alt="Photo de profile"
			class="w-6 h-6 md:w-11 md:h-11 rounded-full
			aspect-square overflow-hidden" />
	</Show>
}

const SESSION_TTL = 1000 * 60 * 2.5 // ms
export const SessionCtx = createContext<Resource<BourseFolle.SessionData>>()
export const SessionProvider = (props: ParentProps) => {
	const nav = useNavigate()
	const [session] = createResource(async () => {
		const cache = sessionStorage.getItem("whoami")
		if (cache !== null) {
			const [t, data] = JSON.parse(cache) as [number, BourseFolle.SessionData]
			if (t + SESSION_TTL >= Date.now()) {
				return data
			}
		}

		const response = await fetch("/auth/whoami", {
			credentials: "include"
		})

		if (response.status === 200) {
			const data: BourseFolle.SessionData = await response.json()
			sessionStorage.setItem("whoami", JSON.stringify([Date.now(), data]))

			return data
		} else {
			console.error("GET /auth/whoami", response.status, response.statusText)
			throw nav('/auth')
		}
	})
	return <SessionCtx.Provider value={session}>
		{props.children}
	</SessionCtx.Provider>
}
