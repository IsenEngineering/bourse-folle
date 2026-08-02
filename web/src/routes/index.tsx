import Prix, { PRIX_PLACEHOLDER } from "../components/prix/mod"
import Graph from "../components/graph/mod"
import { Show } from "solid-js";
import Resizable from "@corvu/resizable";
import Shader from "../components/shader/mod"

export default () => <>
    <div class="absolute z-10 top-0 left-0 w-screen h-full">
        <Shader/>
    </div>
    <Show when={window.innerWidth > 900} fallback={<main class="h-full w-full gap-3 p-3 flex flex-col z-20">
        <section class="border-2 border-gray-700 rounded-lg overflow-hidden min-h-[40vh]">
            <Graph ressources={PRIX_PLACEHOLDER}/>
        </section>
        <section class="border-2 border-gray-700 h-full rounded-lg overflow-hidden">
            <Prix ressources={PRIX_PLACEHOLDER}/>
        </section>
    </main>}>
        <Resizable class="h-full w-full gap-3 p-3 z-20
        flex flex-col md:flex-row" orientation="horizontal" as="main">
            <Resizable.Panel minSize="400px" class="border-2 border-gray-700 rounded-lg 
                overflow-hidden bg-gray-700/25" as="section">
                <Graph ressources={PRIX_PLACEHOLDER}/>
            </Resizable.Panel>
            <Resizable.Handle class="w-1"/>
            <Resizable.Panel collapsible={true} minSize="500px" class="border-2 border-gray-700 h-full rounded-lg 
                overflow-hidden bg-gray-700/25" as="section">
                <Prix ressources={PRIX_PLACEHOLDER}/>
            </Resizable.Panel>
        </Resizable>
    </Show>
</>