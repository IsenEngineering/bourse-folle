import { createMemo, useContext } from 'solid-js';
import Chart from './chart';
import { createStore } from 'solid-js/store';
import { useNavigate } from '@solidjs/router';
import { RefreshLayoutCtx } from './layout';

export default () => {
	const nav = useNavigate()
	const refresh_layout = useContext(RefreshLayoutCtx)
	const [resource, setResource] = createStore<Partial<BourseFolle.Resource>>({})
	const ready = createMemo(() => {
		const name = resource.name !== undefined && resource.name.length >= 4
		const id = resource.id !== undefined && resource.id.length >= 4 && !resource.id.includes(' ')
		const price_initial = resource.price_initial !== undefined && resource.price_initial > 0
		const price_max = resource.price_max !== undefined
			&& resource.price_max > (resource.price_initial || 0)
		const price_min = resource.price_min !== undefined
			&& resource.price_min < (resource.price_initial || Infinity) && resource.price_min > 0
		const strength = resource.coef_strength !== undefined && resource.coef_strength < Infinity
		const volatility = resource.coef_volatility !== undefined && resource.coef_volatility < Infinity
		const ready = name && id && price_initial && price_max && price_min && strength && volatility

		return { name, id, price_initial, price_max, price_min, strength, volatility, ready }
	})

	const create = async () => {
		if (!ready().ready) return console.error("Not ready yet")

		const body = {
			name: resource.name!,
		    id: resource.id!,
		    price: resource.price_initial!,
		    price_initial: resource.price_initial!,
		    price_min: resource.price_min!,
		    price_max: resource.price_max!,
		    var: 0,
		    historic: [],
		    coef_volatility: resource.coef_volatility!,
			coef_strength: resource.coef_strength!,
			demande: 0
		} satisfies BourseFolle.Resource

		const response = await fetch("/api/resources", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		})

		if (response.ok) {
			if(refresh_layout) await refresh_layout.refetch()
			nav(`/dash/config/${resource.id}`)
		}
		else console.error("POST /api/resources", response.status, response.statusText, JSON.stringify(body, undefined, 4))
	}

    return <section class="scrollable h-full w-full flex flex-col lg:flex-row text-white">
        <div class="p-6 flex flex-col gap-5 max-w-md shrink-0 overflow-y-auto">
            <h2 class="text-xl uppercase">Créer une ressource</h2>

            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Nom</span>
                <span class="text-white/50 text-xs">Nom affiché de la ressource.</span>
                <input
					type="text"
					onInput={e => setResource("name", e.currentTarget.value)}
					placeholder="ex: Coca" data-ready={ready().name}
					class="bg-transparent border px-3 py-2 focus:outline-none
						focus:bg-ie/20 border-ie data-[ready=false]:border-fuchsia-500"
                />
            </label>

            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Identifiant</span>
                <span class="text-white/50 text-xs">Lettres majuscules et chiffres uniquement.</span>
                <input
                    type="text" data-ready={ready().id}
					onInput={e => setResource("id", e.currentTarget.value
						.trim().toUpperCase().slice(0, 16))}
                    placeholder="ex: COCA01"
					class="bg-transparent border px-3 py-2 uppercase focus:outline-none
                    	focus:bg-ie/20 border-ie  data-[ready=false]:border-fuchsia-500"
                />
            </label>

            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Prix initial (€)</span>
                <span class="text-white/50 text-xs">Prix de départ de la ressource avant application des coefficients.</span>
                <input
                    type="number" data-ready={ready().price_initial}
                    min={0}
                    step={0.1}
                    value={3}
                    onInput={e => setResource("price_initial", parseFloat(e.currentTarget.value))}
					class="bg-transparent border px-3 py-2 focus:outline-none
                    	focus:bg-ie/20 border-ie  data-[ready=false]:border-fuchsia-500"
                />
                <div class="grid grid-cols-2 gap-1">
                    <div>
                        <label class="text-white/50 text-xs">Maximum</label>
                        <input
                            type="number" data-ready={ready().price_max}
                            min={0}
                            step={0.1}
                            value={5}
                            onInput={e => setResource("price_max", parseFloat(e.currentTarget.value))}
							class="bg-transparent text-sm w-full border px-2 py-1 focus:outline-none
                            	focus:bg-ie/20 border-ie  data-[ready=false]:border-fuchsia-500"
                        />
                    </div>
                    <div>
                        <label class="text-white/50 text-xs">Minimum</label>
                        <input
                            type="number" data-ready={ready().price_min}
                            min={0}
                            step={0.1}
                            value={2}
                            onInput={e => setResource("price_min", parseFloat(e.currentTarget.value))}
							class="bg-transparent text-sm w-full border px-2 py-1 focus:outline-none
                            	focus:bg-ie/20 border-ie  data-[ready=false]:border-fuchsia-500"
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
                            type="number" data-ready={ready().strength}
                            step={0.01}
                            value={1}
                            onInput={e => setResource("coef_strength", parseFloat(e.currentTarget.value))}
							class="w-28 bg-transparent border px-3 py-2 focus:outline-none
                            	focus:bg-ie/20 border-ie  data-[ready=false]:border-fuchsia-500"
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
                            type="number" data-ready={ready().volatility}
                            step={0.01}
                            value={0.1}
                            onInput={e => setResource("coef_volatility", parseFloat(e.currentTarget.value))}
							class="w-28 bg-transparent border px-3 py-2 focus:outline-none
                            	focus:bg-ie/20 border-ie  data-[ready=false]:border-fuchsia-500"
                        />
                    </div>
                </div>
            </div>

			<button class="mt-2 px-4 py-2 uppercase border border-ie hover:bg-ie/50 transition-colors
            	disabled:bg-fuchsia-500/20  disabled:border-fuchsia-500 not-disabled:cursor-pointer" disabled={!ready().ready}
             	onClick={create}>
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
					prix={{
						initial: resource.price_initial || 3,
						max: resource.price_max || 5,
						min: resource.price_min || 2
                    }}
                    force={() => resource.coef_strength || 1}
                    interval={() => 15}
                    duree={() => 4 * 60}
                    volatilite={() => resource.coef_volatility || 0.1}
                    />
            </div>
        </div>
    </section>;
};
