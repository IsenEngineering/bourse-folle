import { useLocation } from "@solidjs/router"
import { ComponentProps } from "solid-js"
import LayoutMenu from "../../../components/layouts/menu"

export default (props: Pick<ComponentProps<'section'>, 'children'>) => {
    const location = useLocation()

    return <LayoutMenu
        items={[
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
            {
                href: "/dash/config/1",
                children: <>R001</>,
                isActive: () => location.pathname === "/dash/config/1"
            },
            {
                href: "/dash/config/2",
                children: <>R002</>,
                isActive: () => location.pathname === "/dash/config/2"
            },
            {
                href: "/dash/config/3",
                children: <>R003</>,
                isActive: () => location.pathname === "/dash/config/3"
            },
            {
                href: "/dash/config/4",
                children: <>R004</>,
                isActive: () => location.pathname === "/dash/config/4"
            },
        ]}>
        {props.children}
    </LayoutMenu>
}