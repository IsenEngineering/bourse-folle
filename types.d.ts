declare namespace BourseFolle {
	interface Resource {
		name: string,
	    id: String,
	    price: number,
	    price_initial: number,
	    price_min: number,
	    price_max: number,
	    var: number,
	    historic: number[],
	    coef_volatility: number,
		coef_strength: number,
		demande: number
	}

	interface Config {
		// serde serialization of std::time::Duration
		interval: {
			secs: number,
	        nanos: number
		},
	    event_id: string,
	    event_state: "Stopped" | "Running",
	    expected_drinks: number,
	}

	 interface SessionData {
		sub: string,
	    email: string,
	    name?: string,
	    picture?: string,

	    expires_at?: number,
	}
}
