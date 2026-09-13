import { createMemo, createResource, useContext} from 'solid-js';
import Chart from './chart';
import { useNavigate, useParams } from '@solidjs/router';
import { createStore } from 'solid-js/store';
import { RefreshLayoutCtx } from "./layout";

export default () => {
	const refresh_layout = useContext(RefreshLayoutCtx)
	const params = useParams()
	const nav = useNavigate()
	const [buffer, setBuffer] = createStore<Exclude<Partial<BourseFolle.Resource>, "id" | "var" | "historic">>()
	const [resource, { refetch }] = createResource(() => params.resource, async () => {
		const resource_id = params.resource

		const response = await fetch(`/api/resources/${resource_id}`, {
			credentials: "include"
		})

		if (response.status !== 200) {
			console.error(`GET /api/resources/${resource_id}`, response.status, response.statusText)
			throw nav("/dash/service")
		}
		const resource = await response.json()

		return resource as BourseFolle.Resource
	})

	const ready = createMemo(() => {
		const name = buffer.name !== undefined && buffer.name.length >= 4
		const price_initial = buffer.price_initial !== undefined && buffer.price_initial > 0
		const price_max = buffer.price_max !== undefined
			&& buffer.price_max > (buffer.price_initial || resource()?.price_initial || 0)
		const price_min = buffer.price_min !== undefined
			&& buffer.price_min < (buffer.price_initial || resource()?.price_initial || Infinity)
			&& buffer.price_min > 0
		const strength = buffer.coef_strength !== undefined && buffer.coef_strength < Infinity
		const volatility = buffer.coef_volatility !== undefined && buffer.coef_volatility < Infinity
		const any = name || price_initial || price_max || price_min || strength || volatility

		return { name, price_initial, price_max, price_min, strength, volatility, any }
	})

	const update = async () => {
		if(!ready().any) return
		const resource_id = params.resource

		const body = {
			name: ready().name ? buffer.name : undefined,
		    price_initial: ready().price_initial ? buffer.price_initial : undefined,
		    price_min: ready().price_min ? buffer.price_min : undefined,
		    price_max: ready().price_max ? buffer.price_max : undefined,
		    coef_volatility: ready().volatility ? buffer.coef_volatility : undefined,
		    coef_strength: ready().strength ? buffer.coef_strength : undefined,
		}

		const response = await fetch(`/api/resources/${resource_id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(body)
		})

		if (response.status !== 200) {
			const error = await response.text()
			console.error(`PATCH /api/resources/${resource_id}`,
				response.status, response.statusText, JSON.stringify(body, undefined, 4), error)
		} else {
			if(refresh_layout) await refresh_layout.refetch()
			refetch()
			setBuffer('name', undefined)
			setBuffer('price_initial', undefined)
			setBuffer('price_max', undefined)
			setBuffer('price_min', undefined)
			setBuffer('coef_volatility', undefined)
			setBuffer('coef_strength', undefined)
		}
	}
	const remove = async () => {
		const resource_id = params.resource
		const response = await fetch(`/api/resources/${resource_id}`, {
			method: "DELETE",
			credentials: "include"
		})

		if (response.status !== 200) {
			console.error(`DELETE /api/resources/${resource_id}`, response.status, response.statusText)
		} else {
			if(refresh_layout) await refresh_layout.refetch()
			nav("/dash/config/new-resource")
		}
	}

    return <section class="scrollable h-full w-full flex flex-col lg:flex-row text-white">
		<div class="p-6 flex flex-col gap-5 max-w-md shrink-0 overflow-y-auto">
			<h2 class="text-xl uppercase">Modifier {resource()?.name}</h2>

            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Nom</span>
                <span class="text-white/50 text-xs">Nom affiché de la ressource.</span>
                <input
                    type="text"
					value={resource()?.name}
                    onInput={e => setBuffer("name", e.target.value)}
                    placeholder="ex: Coca"
                    class="bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                />
            </label>

            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Prix initial (€)</span>
                <span class="text-white/50 text-xs">Prix de départ de la ressource avant application des coefficients.</span>
                <input
                    type="number"
                    min={0}
                    step={0.01}
					value={resource()?.price_initial}
                    onInput={e => setBuffer("price_initial", parseFloat(e.target.value))}
                    class="bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                />
                <div class="grid grid-cols-2 gap-1">
                    <div>
                        <label class="text-white/50 text-xs">Maximum</label>
                        <input
                            type="number"
                            min={0}
                            step={0.01}
							value={resource()?.price_max}
                            onInput={e => setBuffer("price_max", parseFloat(e.target.value))}
                            class="bg-transparent text-sm w-full border border-ie px-2 py-1 focus:outline-none focus:bg-ie/20"
                        />
                    </div>
                    <div>
                        <label class="text-white/50 text-xs">Minimum</label>
                        <input
                            type="number"
                            min={0}
                            step={0.01}
							value={resource()?.price_min}
                            onInput={e => setBuffer("price_min", parseFloat(e.target.value))}
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
							value={resource()?.coef_strength}
                            onInput={e => setBuffer("coef_strength", parseFloat(e.target.value))}
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
							value={resource()?.coef_volatility}
                            onInput={e => setBuffer("coef_volatility", parseFloat(e.target.value))}
                            class="w-28 bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                        />
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <span class="uppercase text-sm">Changements</span>
				<p class="text-white/50 text-xs">
					{ready().name
						&& <>- nom de la ressource -&gt {buffer.name}<br /></>}
					{ready().price_initial
						&& <>- prix initiale -&gt {buffer.price_initial}<br /></>}
					{ready().price_max
						&& <>- prix maximum -&gt {buffer.price_max}<br /></>}
					{ready().strength
						&& <>- force -&gt {buffer.coef_strength}<br /></>}
					{ready().volatility
						&& <>- volatilité -&gt {buffer.coef_volatility}<br /></>}
                </p>
				<div class="mt-2 px-3 py-2 uppercase bg-ie/25 w-fit hover:bg-ie/75
                	transition-colors select-none"
					style={(ready().any) ? 'cursor: pointer' : 'cursor: not-allowed'}
					onClick={update}>
					Enregistrer
                </div>
				<div class="mt-2 px-3 py-2 uppercase bg-ie/25 w-fit hover:bg-fuchsia-500/50
                	cursor-pointer transition-colors select-none"
                 	onclick={remove}>
					Supprimer
                </div>
			</div>
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
						initial: buffer.price_initial || resource()?.price_initial || 3,
						min: buffer.price_min || resource()?.price_min || 2,
						max: buffer.price_max || resource()?.price_max || 5
                    }}
                    force={() => buffer.coef_strength || resource()?.coef_strength || 1}
                    interval={() => 15}
                    duree={() => 4 * 60}
                    volatilite={() => buffer.coef_volatility || resource()?.coef_volatility || 0.1}
                    />
            </div>
        </div>
    </section>;
};
