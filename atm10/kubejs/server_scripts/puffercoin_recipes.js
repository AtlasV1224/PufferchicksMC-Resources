// Puffercoins
ServerEvents.recipes(event => {

	// Combining
	for(let i = 0; i < 5; i++) {
		event.shapeless(
			Item.of(`puffercoin:coin_${i+1}`, 1),
			[`9x puffercoin:coin_${i}`]
		);
	}

	// Splitting
	for(let i = 1; i <= 5; i++) {
		event.shapeless(
			Item.of(`puffercoin:coin_${i-1}`, 9),
			[`puffercoin:coin_${i}`]
		);
	}

});
