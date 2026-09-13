import Prix from "../components/prix/mod"
import { createContext, createSignal, JSX, lazy, onMount, Show } from "solid-js";
import Resizable from "@corvu/resizable";
import { createStore, StoreReturn } from "solid-js/store";
import Nav from "../components/nav/mod";
import live from "../components/live";

const Shader = lazy(() => import('../components/shader/mod'))
const Graph = lazy(() => import('../components/graph/mod'))
const Main = (props: { graph: JSX.Element, prix: JSX.Element, orientation: 'horizontal' | 'vertical' }) => {
    return <Show when={window.innerWidth > 900} fallback={<main class="h-full w-full gap-3 p-1 sm:p-3 flex flex-col z-20">
        {/* affichage téléphone (colonne) */}
        <section id="main-graph" class="border-2 border-gray-700 rounded-lg overflow-hidden min-h-[40vh] flex-3">
            {props.graph}
        </section>
        <section class="border-2 border-gray-700 h-full rounded-lg overflow-hidden flex-1">
            {props.prix}
        </section>
    </main>}>
        {/* affichage ordinateur (ligne) */}
        <Resizable class="h-full w-full gap-3 p-3 z-20 min-h-0
        flex flex-col md:flex-row" orientation={props.orientation} as="main"
            initialSizes={[0.7, 0.3]}>
            <Resizable.Panel minSize={ props.orientation === 'horizontal' ? "500px" : "300px"  } class="border-2 border-gray-700 rounded-lg min-h-0
                overflow-hidden bg-gray-700/25" as="section" id="main-graph">
                {props.graph}
            </Resizable.Panel>
            <Resizable.Handle style={props.orientation === 'horizontal' ? 'width: 4px' : 'height: 4px'} />
            <Resizable.Panel collapsible={true} minSize={ props.orientation === 'horizontal' ? "500px" : "100px" } class="border-2 border-gray-700 h-full rounded-lg
                overflow-hidden bg-gray-700/25" as="section">
                {props.prix}
            </Resizable.Panel>
        </Resizable>
    </Show>
}

export const RessourcesCtx = createContext<StoreReturn<BourseFolle.Resource[]>>()
export default () => {
	const [resources, setResources] = createStore<BourseFolle.Resource[]>([])
	const [orientation, setOrientation] = createSignal<'horizontal' | 'vertical'>(
		window.innerWidth < 900 ? 'vertical' : 'horizontal'
	)

	onMount(async () => {
		const session_orientation = sessionStorage.getItem("orientation") as 'horizontal' | 'vertical' | null
		if(session_orientation) setOrientation(session_orientation)
		live("/api/live", setResources)
    })

    return <RessourcesCtx.Provider value={[resources, setResources]}>
		<Nav orientation={orientation()}
			onOrientationChange={() => {
				const new_orientation = orientation() == 'horizontal' ? 'vertical' : 'horizontal'
				setOrientation(new_orientation)
				sessionStorage.setItem("orientation", new_orientation)
			}
			} />
        {/*<div class="absolute z-10 top-0 left-0 w-screen h-full">
            <Shader/>
        </div>*/}
        <Main orientation={orientation()}
            graph={<Graph/>}
            prix={<Prix/>}/>
    </RessourcesCtx.Provider>
}
