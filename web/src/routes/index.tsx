import Prix, { PRIX_PLACEHOLDER } from "../components/prix/mod"
import Graph from "../components/graph/mod"
import { createContext, JSX, onCleanup, onMount, Show } from "solid-js";
import Resizable from "@corvu/resizable";
import Shader from "../components/shader/mod"
import { createStore, StoreReturn } from "solid-js/store";

const Main = (props: { graph: JSX.Element, prix: JSX.Element }) => {
    return <Show when={window.innerWidth > 900} fallback={<main class="h-full w-full gap-3 p-3 flex flex-col z-20">
        {/* affichage téléphone (colonne) */}
        <section class="border-2 border-gray-700 rounded-lg overflow-hidden min-h-[40vh]">
            {props.graph}
        </section>
        <section class="border-2 border-gray-700 h-full rounded-lg overflow-hidden">
            {props.prix}
        </section>
    </main>}>
        {/* affichage ordinateur (ligne) */}
        <Resizable class="h-full w-full gap-3 p-3 z-20 min-h-0
        flex flex-col md:flex-row" orientation="horizontal" as="main"
            initialSizes={[0.7, 0.3]}>
            <Resizable.Panel minSize="600px" class="border-2 border-gray-700 rounded-lg min-h-0
                overflow-hidden bg-gray-700/25" as="section">
                {props.graph}
            </Resizable.Panel>
            <Resizable.Handle class="w-1"/>
            <Resizable.Panel collapsible={true} minSize="500px" class="border-2 border-gray-700 h-full rounded-lg 
                overflow-hidden bg-gray-700/25" as="section">
                {props.prix}
            </Resizable.Panel>
        </Resizable>
    </Show>
}

export const RessourcesCtx = createContext<StoreReturn<BourseFolle.Ressource[]>>()
export default () => {
    const [ressources, setRessources] = createStore(PRIX_PLACEHOLDER)

    onMount(() => {
        let i = setInterval(() => {
            setRessources(u => u.map(r => {
                const prix = Math.floor((r.prix + Math.random() * 20 - 10) * 100) / 100
                return { 
                    ...r,
                    variation: r.historique.length > 2 ? Math.floor((r.historique.at(0).prix - r.historique.at(-1).prix) * 100) / 100 : 0,
                    historique: [...(r.historique.length > 30 ? r.historique.slice(1) : r.historique), { prix, ts: Date.now() }],
                    prix
                }
            }))
        }, 500)

        onCleanup(() => clearInterval(i))
    })
    
    return <RessourcesCtx.Provider value={[ressources, setRessources]}>
        <div class="absolute z-10 top-0 left-0 w-screen h-full">
            <Shader/>
        </div>
        <Main
            graph={<Graph/>}
            prix={<Prix/>}/>
    </RessourcesCtx.Provider>
}