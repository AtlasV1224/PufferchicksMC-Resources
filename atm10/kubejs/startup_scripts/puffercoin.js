// Puffercoins
StartupEvents.registry('item', event => {
	const tier_names = [
		'Flint',
		'Copper',
		'Iron',
		'Gold',
		'Iridium',
		'The'
	];

	const rarities = [
		'COMMON',
		'UNCOMMON',
		'UNCOMMON',
		'RARE',
		'EPIC',
		'EPIC'
	];

	for(let i = 0; i <= 5; i++) {
		event
			.create(`puffercoin:coin_${i}`)
			.texture(`puffercoin:item/coin_${i}`)
			.maxStackSize(64)
			.fireResistant(true)
			.rarity(rarities[i])
			.tag('puffercoin:coins')
			.displayName(`${tier_names[i]} Puffercoin`);
	}
});

StartupEvents.modifyCreativeTab('minecraft:ingredients', event => {
	for(let i = 0; i <= 5; i++) {
		event.add(`puffercoin:coin_${i}`);
	}
});