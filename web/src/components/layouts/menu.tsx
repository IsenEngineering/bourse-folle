import type { JSX } from "solid-js"

export interface LayoutMenuProps {
    items: {
        href?: string,
        onClick?: () => void,
        isActive?: () => boolean,
        children: JSX.Element
    }[],
    children: JSX.Element
}

export default ({ items, children }: LayoutMenuProps) => {
    if(window.innerWidth < 640) return <section class="h-full w-full flex items-center justify-center text-white">
        <p class="text-center max-w-3/4">⚠️ Page inaccessible depuis un téléphone</p>
    </section>

    return <section class="h-full w-full flex flex-row text-white">
        <nav class="h-full flex flex-col border-r border-ie">
            {
                items.map(item => <a href={item.href} onClick={item.onClick}
                    style={(item.isActive && item.isActive()) ? 'background: var(--color-ie);' : ''}
                class="px-3 py-2 uppercase hover:bg-ie/50 transition-colors" >{item.children}</a>)
            }
        </nav>
        {children}
    </section>
}