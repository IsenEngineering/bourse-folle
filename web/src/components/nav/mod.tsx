import { createSignal, onCleanup, onMount, Show } from "solid-js";

const Chevron = () => <svg xmlns="http://www.w3.org/2000/svg"
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="rotate-180">
    <path d="m6 9 6 6 6-6"/>
</svg>

const Layout = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
	class="data-[orientation=vertical]:rotate-90"
	stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
	<rect width="18" height="18" x="3" y="3" rx="2" />
	<path d="M3 12h18" />
</svg>

const Github = () => <svg viewBox="0 0 24 24" width="24" height="24" fill="#FFF">
	<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
</svg>

const Edit = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
	stroke="currentColor" stroke-width="2" stroke-linecap="round"
	stroke-linejoin="round">
	<path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
	<path d="M14 6a6 6 0 0 1 6 6v3" />
	<path d="M4 15v-3a6 6 0 0 1 6-6" />
	<rect x="2" y="15" width="20" height="4" rx="1" />
</svg>

export default function Nav(props: { orientation: 'horizontal' | 'vertical', onOrientationChange: () => void }) {
    const [hidden, setHidden] = createSignal(false)
    onMount(() => {
        const listener = (e: KeyboardEvent) => {
            if(e.key.toLowerCase() === 'h') {
                if(!document.startViewTransition) setHidden(!hidden());
                else document.startViewTransition(() => setHidden(!hidden()))
            }
        }

        document.addEventListener('keypress', listener)
        onCleanup(() => {
            document.removeEventListener("keypress", listener)
        })
    })

    return <Show when={!hidden()}>
        <header class="mt-2 mr-2 mx-auto sm:mr-4 sm:mt-4 rounded-full h-auto sm:h-12 w-fit sm:w-auto
            p-1 bg-white/10 text-white sticky sm:relative top-0 backdrop-blur-xs z-30
            flex flex-row items-center justify-between gap-2">
            <p class="bg-white/75 text-black ml-1 px-2 py-1 font-bold rounded-full hidden sm:block">
                https://bourse-folle.isenengineering.fr
            </p>
            {/* <nav class="flex flex-row flex-wrap sm:flex-nowrap items-center gap-0.5">
            </nav> */}

            <div class="flex flex-row items-center gap-0.5">
				<div class="p-2 hover:bg-gray-800 transition-colors cursor-pointer hidden lg:block
                	data-[orientation=vertical]:*:rotate-90 *:transition-transform
                    uppercase font-bold select-none rounded-full" data-orientation={props.orientation}
                    draggable={false}
                    onClick={props.onOrientationChange}>
					<Layout />
                </div>
                <a href="https://github.com/IsenEngineering/bourse-folle" target="_blank" rel="external" class="p-2 hover:bg-gray-800 transition-colors
                    uppercase font-bold select-none rounded-full"
                    draggable={false}>
                    <Github/>
                </a>
                <a href="/auth/google" rel="external" class="p-2 hover:bg-gray-800 transition-colors
                    uppercase font-bold select-none rounded-full"
                    draggable={false}>
                    <Edit/>
                </a>
                <div class="flex-row gap-3 items-center bg-gray-500/75 font-black text-xl px-3 py-1.5
                    select-none cursor-pointer hover:bg-gray-500/60 transition-colors rounded-full hidden lg:flex"
                    onClick={() => {
                        if(!document.startViewTransition) setHidden(!hidden());
                        else document.startViewTransition(() => setHidden(!hidden()))
                    }}>
                    <Chevron/>
                    <code>H</code>
                </div>
            </div>
        </header>
    </Show>
}
