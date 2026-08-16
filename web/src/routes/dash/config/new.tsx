import { createSignal, For } from 'solid-js';
import Chart from './chart';
import { createStore } from 'solid-js/store';

export default () => {
    const [name, setName] = createSignal('');
    const [id, setId] = createSignal('');
    const [price, setPrice] = createStore({
        initial: 3,
        min: 2,
        max: 5
    })
    const [force, setForce] = createSignal(1)
    const [volatilite, setVolatilite] = createSignal(0.1)

    // identifiant : majuscules + chiffres uniquement
    const onIdInput = (raw: string) => {
        setId(raw.toUpperCase().replace(/[^A-Z0-9]/g, ''));
    };

    return <section class="scrollable h-full w-full flex flex-col lg:flex-row text-white">
        <div class="p-6 flex flex-col gap-5 max-w-md shrink-0 overflow-y-auto">
            <h2 class="text-xl uppercase">Créer une ressource</h2>

            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Nom</span>
                <span class="text-white/50 text-xs">Nom affiché de la ressource.</span>
                <input
                    type="text"
                    value={name()}
                    onInput={e => setName(e.currentTarget.value)}
                    placeholder="ex: Coca"
                    class="bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                />
            </label>

            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Identifiant</span>
                <span class="text-white/50 text-xs">Lettres majuscules et chiffres uniquement.</span>
                <input
                    type="text"
                    value={id()}
                    onInput={e => onIdInput(e.currentTarget.value)}
                    placeholder="ex: COCA01"
                    class="bg-transparent border border-ie px-3 py-2 uppercase focus:outline-none focus:bg-ie/20"
                />
            </label>

            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Prix initial (€)</span>
                <span class="text-white/50 text-xs">Prix de départ de la ressource avant application des coefficients.</span>
                <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={price.initial}
                    onInput={e => setPrice('initial', parseFloat(e.currentTarget.value))}
                    class="bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                />
                <div class="grid grid-cols-2 gap-1">
                    <div>
                        <label class="text-white/50 text-xs">Maximum</label>
                        <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={price.max}
                            onInput={e => setPrice('max', parseFloat(e.currentTarget.value))}
                            class="bg-transparent text-sm w-full border border-ie px-2 py-1 focus:outline-none focus:bg-ie/20"
                        />
                    </div>
                    <div>
                        <label class="text-white/50 text-xs">Minimum</label>
                        <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={price.min}
                            onInput={e => setPrice('min', parseFloat(e.currentTarget.value))}
                            class="bg-transparent text-sm w-full border border-ie px-2 py-1 focus:outline-none focus:bg-ie/20"
                        />
                    </div>
                </div>
            </label>

            <div class="flex flex-col gap-1">
                <span class="uppercase text-sm">Coefficients</span>
                <span class="text-white/50 text-xs">
                    Déterminent l'évolution du prix en fonction du temps et de la demande.
                </span>

                <div class="flex flex-col gap-2 mt-2">
                    <div class="flex gap-2">
                        <input
                            disabled={true}
                            type="text"
                            value={"force"}
                            class="flex-1 bg-transparent border border-ie/50 px-3 py-2 focus:outline-none focus:bg-ie/20"
                        />
                        <input
                            type="number"
                            step={0.01}
                            value={force()}
                            onInput={e => setForce(parseFloat(e.currentTarget.value))}
                            class="w-28 bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                        />
                    </div>
                    <div class="flex gap-2">
                        <input
                            disabled={true}
                            type="text"
                            value={"volatilité"}
                            class="flex-1 bg-transparent border border-ie/50 px-3 py-2 focus:outline-none focus:bg-ie/20"
                        />
                        <input
                            type="number"
                            step={0.01}
                            value={volatilite()}
                            onInput={e => setVolatilite(parseFloat(e.currentTarget.value))}
                            class="w-28 bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                        />
                    </div>
                </div>
            </div>

            <button class="mt-2 px-4 py-2 uppercase border border-ie hover:bg-ie/50 transition-colors">
                Créer
            </button>
        </div>

        {/* Simulation : prend tout l'espace restant à droite sur grand écran */}
        <div class="flex-1 border-t lg:border-t-0 lg:border-l border-ie flex flex-col min-h-64 lg:min-h-0">
            <div class="p-4 border-b border-ie">
                <span class="uppercase text-sm">Simulation</span>
                <p class="text-white/50 text-xs">
                    Aperçu des évolutions possibles du prix (pire et meilleur cas) selon les coefficients définis.
                </p>
            </div>
            <div class="flex-1 flex items-center justify-center text-white/40" id='simulation-graph'>
                <Chart
                    prix={price}
                    force={force}
                    interval={() => 15}
                    duree={() => 4 * 60}
                    volatilite={volatilite}
                    />
            </div>
        </div>
    </section>;
};