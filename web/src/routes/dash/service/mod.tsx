import Resizable from "@corvu/resizable";
import { createSignal, For, Setter, useContext } from "solid-js";
import { DashLayoutCtx } from "../layout";

type Resource = { name: string, id: string, price: number, demande: number }
type MsgOutResources = {
	"Resources": Resource[]
}
type MsgOutLog = {
	"Log": string
}
type MsgOut = MsgOutLog | MsgOutResources

const setupSocket = (setLogs: Setter<string>, setResources: Setter<Resource[]>) => {
	const url = new URL("/api/service", location.origin)
	url.protocol = "ws"

	const socket = new WebSocket(url)
	socket.addEventListener("open", console.info)
	socket.addEventListener("close", console.info)
	socket.addEventListener("message", e => {
		const data = JSON.parse(e.data) as MsgOut

		if ('Resources' in data) {
			setResources(data.Resources)
		}
		if ('Log' in data) {
			setLogs(data.Log)
		}
	})
	socket.addEventListener("error", console.error)

	return socket
}

export default () => {
	const [logs, setLogs] = createSignal("")
	const [resources, setResources] = createSignal<Resource[]>([])
	const [ws, setWs] = createSignal<WebSocket | null>(null)
    const [aide, setAide] = createSignal(localStorage.getItem('aide') !== '0')
    const [_, setDashDisplay] = useContext(DashLayoutCtx)!

    return <Resizable class="text-white font-jetbrains h-full w-full overflow-y-auto sm:overflow-hidden"
        orientation={ window.innerWidth < 640 ? 'vertical' : 'horizontal'} as="main"
        initialSizes={[0.1, 0.9]}>
        <Resizable.Panel collapsible={true} data-collapsed class="p-3 border-r border-ie h-full" as="section">
            <div class="hover:bg-ie/50 transition-colors uppercase font-bold select-none cursor-pointer
                bg-white/10 text-white text-base px-4 py-2 mb-3"
                draggable={false}
                style={ws() !== null ? 'background: var(--color-ie)' : ''}
                onClick={() => {
					const callback = () => {
						if (ws() === null) {
							const socket = setupSocket(setLogs, setResources)
							setWs(socket)
						} else setWs(null)

                        setDashDisplay(ws() === null)
                    }

                    if(!document.startViewTransition) callback()
                    else document.startViewTransition(callback)
                }}>
                Service { ws() !== null ? 'actif' : 'inactif' }
            </div>
            <div class="hover:bg-white/25 transition-colors uppercase font-bold select-none cursor-pointer
                bg-white/10 text-white text-base px-4 py-2 mb-3"
				draggable={false} onClick={() => {
					ws()?.send(JSON.stringify("Undo"))
                }}>
                Annuler la dernière action
            </div>
			<pre class="truncate overflow-x-hidden overflow-y-auto hidden sm:block">
				<For each={logs().split('\n')}>
					{log => <>
						<span>{log}</span>
						<br/>
					</>}
				</For>
            </pre>
            {/* historique + mode service + reverse */}
        </Resizable.Panel>
        <Resizable.Handle class="w-1"/>
        <Resizable.Panel class="p-2 md:p-4 gap-2 md:gap-4 content-start
            grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" as="section">
            <div style={aide() ? '' : 'display: none'}
                class="text-xs md:text-sm
                col-span-2 md:col-span-3 lg:col-span-5 xl:col-span-6">
                Activez le <strong>mode service</strong> pour pouvoir mettre à jours le prix des boissons.<br/>
                En cliquant sur une boisson vous faite augmenter son prix.<br/>
                Plus une boisson est cliquée plus son prix augmente jusqu'à un plafond.<br/>
                Si une boisson n'est pas cliquée son prix baissera jusqu'à un plafond

                <div class="hover:bg-white/25 transition-colors uppercase font-bold select-none cursor-pointer
                bg-white/10 text-white px-2 py-1 text-xs w-fit mt-1.5"
                draggable={false}
                onClick={() => {
                    setAide(false)
                    localStorage.setItem('aide', '0')
                }}>
                    Masquer l'aide
                </div>
			</div>
			<For each={resources()}>
				{resource => <div class="hover:bg-white/25 transition-colors bg-white/10 text-white
	                uppercase font-bold select-none cursor-pointer text-xs md:text-base
	                px-2 py-1  md:px-4 md:py-2 min-h-16
	                flex flex-col gap-0.5 h-full w-full justify-center items-center"
					draggable={false}
					onClick={() => ws()?.send(JSON.stringify({
						"Demande": resource.id
					}))}
	                title="Suspension de la mise à jour du prix des boissons">
	                <p class="truncate">{ resource.name }</p>
					<p class="text-white/50 italic font-light">{resource.price}€ - {resource.demande}</p>
	            </div>}
            </For>

        </Resizable.Panel>
    </Resizable>
}
