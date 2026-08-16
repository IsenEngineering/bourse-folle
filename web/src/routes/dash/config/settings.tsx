import { createMemo } from "solid-js";
import { createStore } from "solid-js/store";

export default () => {
    const [config, setConfig] = createStore({
        interval: undefined as number | undefined,
        eventId: undefined as string | undefined,
        consommations: undefined as number | undefined
    })
    const disabled = createMemo(() => config.eventId === undefined 
        && config.interval === undefined 
        && config.consommations)

    return <section class="flex flex-col p-3">
        <div class="flex flex-col gap-5 max-w-md">
            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Interval des mises à jour</span>
                <span class="text-white/50 text-xs">
                    Fréquence (en minutes) à laquelle les ressources sont recalculées et mises à jour.
                </span>
                <input
                    type="number"
                    min={1}
                    value={15}
                    onInput={e => setConfig('interval', Number(e.target.value))}
                    class="bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                />
            </label>
            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Consommations attendues</span>
                <span class="text-white/50 text-xs">
                    Le nombre de consommations attendues permet au système d'avoir une référence pour tous les calculs.
                </span>
                <span class="text-xs text-white/25">
                    les variations de 10 consommations pour 5000 personnes seront moins importantes
                    que 1 consommation pour 10 personnes
                </span>
                <input
                    type="number"
                    min={1}
                    value={15}
                    onInput={e => setConfig('consommations', Number(e.target.value))}
                    class="bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                />
            </label>

            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Identifiant de l'évènement</span>
                <span class="text-white/50 text-xs">
                    ⚠️ Changer cet identifiant revient à changer de sauvegarde : les boissons seront réinitialisées en cas de nouvel identifiant.
                </span>
                <input
                    type="text"
                    value={""}
                    maxLength={16}
                    onInput={e => setConfig('eventId', e.target.value.trim().toLowerCase().replaceAll(' ', '-').slice(0, 16))}
                    placeholder="ex: saison-2026-hiver"
                    class="bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                />
            </label>

            <div class="flex flex-col gap-1" 
                style={disabled() ? 'opacity: 0.5' : ''}>
                <span class="uppercase text-sm">Changements</span>
                <p class="text-white/50 text-xs">
                    { config.eventId !== undefined && <>- ⚠️ changement de sauvegarde -&gt { config.eventId }<br/></> }
                    { config.interval !== undefined && <>- interval -&gt { config.interval }<br/></> }
                    { config.consommations !== undefined && <>- consommations -&gt { config.consommations }<br/></> }
                </p>
                <div class="mt-2 px-3 py-2 uppercase bg-ie/25 w-fit hover:bg-ie/75 transition-colors select-none"
                    style={disabled() ? 'cursor: not-allowed' : 'cursor: pointer'}>
                    Enregistrer
                </div>
            </div>
        </div>
    </section>;
};