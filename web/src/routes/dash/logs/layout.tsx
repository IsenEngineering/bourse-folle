import { useLocation } from "@solidjs/router"
import { ComponentProps } from "solid-js"
import LayoutMenu from "../../../components/layouts/menu"

export default (props: Pick<ComponentProps<'section'>, 'children'>) => {
    const location = useLocation()

    return <LayoutMenu
        items={() => [
            {
                href: "/dash/logs/1",
                children: <>Ajouter une boissons</>,
                isActive: () => location.pathname === "/dash/logs/1"
            },
        ]}>
        {props.children}
    </LayoutMenu>
}
