// Display the value of a stack in the tooltip
const VALUES = {
	'puffercoin:coin_0': 1/9,
	'puffercoin:coin_1': 1,
	'puffercoin:coin_2': 9,
	'puffercoin:coin_3': 81,
	'puffercoin:coin_4': 729,
	'puffercoin:coin_5': 6561
};

ItemEvents.dynamicTooltips('puffercoin:value', event => {
	let value = VALUES[event.item.id];
	if (!value)
		return;

	let stack_value = Math.round(100 * event.item.count * value) / 100;
	event.add([Text.of('Value: ').append(Text.gold(`$${stack_value}`))]);
});

ItemEvents.modifyTooltips(event => {
	for(let i = 0; i <= 5; i++)
		event.modify(`puffercoin:coin_${i}`, tooltip => tooltip.dynamic('puffercoin:value'))
});
