import { createSignal, onCleanup, onMount, Show } from "solid-js";
import './style.css'

const Chevron = () => <svg xmlns="http://www.w3.org/2000/svg" 
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="rotate-180">
    <path d="m6 9 6 6 6-6"/>
</svg>

const Antenna = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path style="animation: 2s linear .66s infinite pulse-in" d="M16.247 7.761a6 6 0 0 1 0 8.478"/>
    <path style="animation: 2s linear 1.33s infinite pulse-in" d="M19.075 4.933a10 10 0 0 1 0 14.134"/>
    <path style="animation: 2s linear 1.33s infinite pulse-in" d="M4.925 19.067a10 10 0 0 1 0-14.134"/>
    <path style="animation: 2s linear .66s infinite pulse-in" d="M7.753 16.239a6 6 0 0 1 0-8.478"/>
    <circle cx="12" cy="12" r="2" style="animation: 2s linear 0 infinite pulse-in"/>
</svg>

const Edit = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9"/><path d="m18 15 4-4"/>
    <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 
    3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>
</svg>

export default function Nav() {
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
        <header class="mt-2 mr-2 mx-auto sm:mr-4 sm:mt-4 rounded-full h-auto sm:h-12 w-fit sm:w-2/3 lg:w-3/5 xl:w-2/5 
            p-1 bg-white/10 text-white sticky sm:relative top-0 backdrop-blur-xs z-30
            flex flex-row items-center justify-between gap-2">
            <p class="bg-white/75 text-gray-800 ml-1 px-2 py-1 font-bold rounded-full hidden sm:block">
                https://bourse-folle.isenengineering.fr
            </p>
            {/* <nav class="flex flex-row flex-wrap sm:flex-nowrap items-center gap-0.5">
            </nav> */}

            <div class="flex flex-row items-center gap-0.5">
                <a href="/" class="p-2 hover:bg-gray-800 transition-colors 
                    uppercase font-bold select-none rounded-full" 
                    draggable={false}>
                    <Antenna/>
                </a>
                <a href="/dash" class="p-2 hover:bg-gray-800 transition-colors 
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