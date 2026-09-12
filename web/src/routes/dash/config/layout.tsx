import { useLocation, useNavigate } from "@solidjs/router"
import { ComponentProps, createContext, createMemo, createResource } from "solid-js"
import LayoutMenu from "../../../components/layouts/menu"

export const RefreshLayoutCtx = createContext<(info?: unknown) =>
	Record<string, BourseFolle.Resource> |
	Promise<Record<string, BourseFolle.Resource> | undefined>
	| null
	| undefined>()

export default (props: Pick<ComponentProps<'section'>, 'children'>) => {
	const location = useLocation()
	const nav = useNavigate()
	const [resources, { refetch }] = createResource(async () => {
		const response = await fetch("/api/resources", {
			credentials: "include"
		})

		if (response.status !== 200) {
			console.error("GET /api/resources", response.status, response.statusText)
			throw nav("/dash/service")
		}
		const resources = await response.json()

		return resources as Record<string, BourseFolle.Resource>
    })

	const items = createMemo(() => ([
		{
			href: "/dash/config/settings",
			children: <>Paramètres</>,
			isActive: () => location.pathname === "/dash/config/settings"
		},
		{
			href: "/dash/config/new-resource",
			children: <>Ajouter une ressource</>,
			isActive: () => location.pathname === "/dash/config/new-resource"
		},
		...Object.values(resources() || {}).map(resource => ({
			href: `/dash/config/${resource.id}`,
			children: <>{resource.name}</>,
			isActive: () => location.pathname === `/dash/config/${resource.id}`
		}))
	]))

	return <RefreshLayoutCtx.Provider value={refetch}>
		<LayoutMenu
	        items={items}>
	        {props.children}
	    </LayoutMenu>
	</RefreshLayoutCtx.Provider>
}
