import type { Accessor, JSX } from "solid-js"

export interface LayoutMenuProps {
    items: Accessor<{
        href?: string,
        onClick?: () => void,
        isActive?: () => boolean,
        children: JSX.Element
    }[]>,
    children: JSX.Element
}

export default ({ items, children }: LayoutMenuProps) => <section class="h-full w-full flex flex-col lg:flex-row text-white">
    <nav class="lg:h-full flex flex-row flex-wrap lg:flex-nowrap lg:flex-col border-r border-ie">
        {
            items().map(item => <a href={item.href} onClick={item.onClick}
                style={(item.isActive && item.isActive()) ? 'background: var(--color-ie);' : ''}
            class="px-3 py-2 uppercase h-fit hover:bg-ie/50 transition-colors" >{item.children}</a>)
        }
    </nav>
    {children}
</section>
