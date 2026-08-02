import type { Component } from 'solid-js';
import Prix, { PRIX_PLACEHOLDER } from "../components/prix/mod"

export default () => <main class="h-full w-full bg-gray-900 p-3">
    <section class="border-2 border-gray-700 w-full h-full rounded-lg">
        <Prix ressources={PRIX_PLACEHOLDER}/>
    </section>
</main>