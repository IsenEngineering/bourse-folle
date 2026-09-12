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
	}
}
