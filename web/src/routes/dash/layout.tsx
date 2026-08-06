import { useLocation } from "@solidjs/router"
import { ComponentProps, createEffect, createMemo } from "solid-js"

export default (props: ComponentProps<'nav'>) => {
    const location = useLocation()

    return <>
        <header class="flex flex-row items-start md:items-center justify-between gap-2 p-3 border-b border-white/25 bg-white/5">
            <nav class="flex flex-row items-center flex-wrap gap-2">
                <a href="/dash/service" style={location.pathname === "/dash/service" ? 'background: #FFF8;' : ''} 
                    class="hover:bg-white/25 transition-colors uppercase font-bold select-none
                    bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2" 
                    draggable={false}>
                    Service
                </a>
                <a href="/dash/config" style={location.pathname === "/dash/config" ? 'background: #FFF8;' : ''} 
                    class="hover:bg-white/25 transition-colors uppercase font-bold select-none
                    bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2" 
                    draggable={false}>
                    Configuration
                </a>
                <a href="/dash/actions" style={location.pathname === "/dash/actions" ? 'background: #FFF8;' : ''} 
                    class="hover:bg-white/25 transition-colors uppercase font-bold select-none
                    bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2" 
                    draggable={false}>
                    Actions
                </a>
                <a href="/dash/debug" style={location.pathname === "/dash/debug" ? 'background: #FFF8;' : ''} 
                    class="hover:bg-white/25 transition-colors uppercase font-bold select-none
                    bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2" 
                    draggable={false}>
                    Debug
                </a>
                <a href="/"
                    class="hover:bg-white/25 transition-colors uppercase font-bold select-none
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