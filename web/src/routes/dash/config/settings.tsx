import { useNavigate } from "@solidjs/router";
import { createMemo, createResource } from "solid-js";
import { createStore } from "solid-js/store";

export default () => {
	const nav = useNavigate()
	const [buffer, setBuffer] = createStore<Partial<BourseFolle.Config>>({})
	const changes = createMemo(() => {
		// computes what fields are ready to update
		const event_id = buffer.event_id !== undefined
			&& buffer.event_id !== config()?.event_id
		const expected_drinks = buffer.expected_drinks !== undefined
			&& buffer.expected_drinks !== config()?.expected_drinks && buffer.expected_drinks > 0
		const interval = buffer.interval !== undefined
			&& buffer.interval.secs !== config()?.interval.secs && buffer.interval.secs > 0
		const event_state = buffer.event_state !== undefined
			&& buffer.event_state !== config()?.event_state

		return {
			event_id,
			expected_drinks,
			interval,
			event_state,
			// if any field changed
			any: event_id || interval || expected_drinks || event_state
		}
	})

	const [config, { refetch }] = createResource(async () => {
		const response = await fetch("/api/config", {
			credentials: "include"
		})

		if (response.status !== 200) {
			console.error("GET /api/config", response.status, response.statusText)
			throw nav("/dash/service")
		}
		const config = await response.json()

		return config as BourseFolle.Config
	})

	const update = async () => {
		if (!changes().any) return console.error("No changes detected")

		const body = {
			interval: changes().interval ? buffer.interval : undefined,
			event_id: changes().event_id ? buffer.event_id : undefined,
			event_state: changes().event_state ? buffer.event_state : undefined,
			expected_drinks: changes().expected_drinks ? buffer.expected_drinks : undefined,
		}

		const response = await fetch("/api/config", {
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		})

		if (response.ok) {
			refetch()
			setBuffer('event_id', undefined)
			setBuffer('event_state', undefined)
			setBuffer('expected_drinks', undefined)
			setBuffer('interval', undefined)
		}
		else console.error("PATCH /api/config", response.status, response.statusText, body)
	}


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
                    value={(config()?.interval.secs || 5 * 60) / 60}
					onInput={e => setBuffer('interval', {
						secs: parseInt(e.target.value) * 60,
						nanos: 0
                    })}
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
                    value={(config()?.expected_drinks || 50)}
                    onInput={e => setBuffer('expected_drinks', parseInt(e.target.value))}
                    class="bg-transparent border border-ie accent-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                />
            </label>

            <label class="flex flex-col gap-1">
                <span class="uppercase text-sm">Identifiant de l'évènement</span>
                <span class="text-white/50 text-xs">
                    ⚠️ Changer cet identifiant revient à changer de sauvegarde : les boissons seront réinitialisées en cas de nouvel identifiant.
                </span>
                <input
                    type="text"
                    value={config()?.event_id || ''}
                    maxLength={16}
                    onInput={e => setBuffer('event_id', e.target.value.trim().toLowerCase().replaceAll(' ', '-').slice(0, 16))}
                    placeholder="ex: saison-2026-hiver"
                    class="bg-transparent border border-ie px-3 py-2 focus:outline-none focus:bg-ie/20"
                />
            </label>
            <label class="flex flex-col gap-1">
				<span class="uppercase text-sm">Etat de l'évènement</span>
				<div class="flex flex-row gap-1">
					<div onClick={() => setBuffer('event_state', 'Running')}
						style={(buffer.event_state === undefined
							? config()?.event_state === "Running"
							: buffer.event_state === "Running")
							? `background: var(--color-teal-500)`
							: ``}
						class="px-3 py-2 uppercase bg-teal-500/25 w-fit hover:bg-teal-500/75
						transition-colors select-none cursor-pointer">
						Running
					</div>
					<div onClick={() => setBuffer('event_state', 'Stopped')}
						style={(buffer.event_state === undefined
							? config()?.event_state === "Stopped"
							: buffer.event_state === "Stopped")
							? `background: var(--color-fuchsia-500)`
							: ``}
						class="px-3 py-2 uppercase bg-fuchsia-500/25 w-fit hover:bg-fuchsia-500/75
						transition-colors select-none cursor-pointer">
						Stopped
					</div>
				</div>
            </label>

            <div class="flex flex-col gap-1">
                <span class="uppercase text-sm">Changements</span>
				<p class="text-white/50 text-xs">
					{changes().event_id
						&& <>- ⚠️ changement de sauvegarde -&gt {buffer.event_id}<br /></>}
					{changes().interval
						&& <>- interval -&gt {Math.round(buffer.interval!.secs / 60)}<br /></>}
					{changes().expected_drinks
						&& <>- consommations -&gt {buffer.expected_drinks}<br /></>}
					{changes().event_state
						&& <>- état -&gt {buffer.event_state}<br /></>}
                </p>
                <div class="mt-2 px-3 py-2 uppercase bg-ie/25 w-fit hover:bg-ie/75 transition-colors select-none"
					style={(changes().any) ? 'cursor: pointer' : 'cursor: not-allowed'}
                    onClick={update}>
					Enregistrer
                </div>
			</div>
        </div>
    </section>;
};
