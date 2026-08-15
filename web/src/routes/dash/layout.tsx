import { useLocation } from "@solidjs/router"
import { ComponentProps } from "solid-js"

export default (props: ComponentProps<'nav'>) => {
    const location = useLocation()

    return <>
        <header class="flex flex-row items-start md:items-center justify-between gap-2 p-2 border-b border-ie">
            <nav class="flex flex-row items-center flex-wrap gap-2">
                <a href="/dash/service" style={location.pathname === "/dash/service" ? 'background: var(--color-ie);' : ''} 
                    class="hover:bg-ie/50 transition-colors uppercase font-bold select-none
                    bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2" 
                    draggable={false}>
                    Service
                </a>
                <a href="/dash/config/settings" style={location.pathname.startsWith("/dash/config") ? 'background: var(--color-ie);' : ''} 
                    class="hover:bg-ie/50 transition-colors uppercase font-bold select-none
                    bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2" 
                    draggable={false}>
                    Configuration
                </a>
                <a href="/dash/actions" style={location.pathname === "/dash/actions" ? 'background: var(--color-ie);' : ''} 
                    class="hover:bg-ie/50 transition-colors uppercase font-bold select-none
                    bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2" 
                    draggable={false}>
                    Actions
                </a>
                <a href="/dash/logs" style={location.pathname.startsWith("/dash/logs") ? 'background: var(--color-ie);' : ''} 
                    class="hover:bg-ie/50 transition-colors uppercase font-bold select-none
                    bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2" 
                    draggable={false}>
                    Logs
                </a>
                <a href="/dash/debug" style={location.pathname === "/dash/debug" ? 'background: var(--color-ie);' : ''} 
                    class="hover:bg-ie/50 transition-colors uppercase font-bold select-none
                    bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2" 
                    draggable={false}>
                    Debug
                </a>
                <a href="/"
                    class="hover:bg-ie/50 transition-colors uppercase font-bold select-none
                    bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2" 
                    draggable={false}>
                    Graphique
                </a>
            </nav>
            <div class="aspect-square w-6 h-6 md:w-11 md:h-11 rounded-full bg-pink-600"/>
        </header>
        {props.children}
    </>
}