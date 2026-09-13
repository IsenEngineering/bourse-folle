export default () => {
    return <section class="p-3 md:p-8 text-white font-jetbrains">
        <h2 class="font-black text-2xl mb-2">Ressources</h2>
        <div class="flex flex-row gap-2">
            <a class="hover:bg-white/25 transition-colors uppercase font-bold select-none cursor-pointer
                bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2"
				onClick={async () => {
					const response = await fetch("/api/resources/reset", {
						method: "PATCH",
						credentials: "include"
					})

					if (response.status !== 200) {
						console.error("PATCH /api/resources/reset", response.status, response.statusText)
					}
             }}>
				Réinitialiser (prix et historique)
            </a>
        </div>
        <h2 class="font-black text-2xl mb-2 mt-8">Session</h2>
        <div class="flex flex-row gap-2">
            <a href="/auth/logout" rel="external" class="hover:bg-white/25 transition-colors uppercase font-bold select-none cursor-pointer
                bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2">
                Se déconnecter
            </a>
            <div class="hover:bg-white/25 transition-colors uppercase font-bold select-none cursor-pointer
                bg-white/10 text-white px-2 py-1 text-xs md:text-base md:px-4 md:py-2"
                draggable={false}
                onClick={() => localStorage.clear()}>
                Vider le cache
            </div>
        </div>
    </section>
}
