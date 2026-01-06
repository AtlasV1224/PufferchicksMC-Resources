// Give Puffercoins a chance to drop in chests.
let chance_tables = {
	'allthemodium:chest/hallway_loot': ['hard', 0.12],
	'minecraft:chests/ancient_city': ['hard', 0.2],
	'repurposed_structures:chests/dungeons/nether': ['normal', 0.09],
	'minecraft:chests/simple_dungeon': ['normal', 0.045],
	'artifacts:chests/campsite_barrel': ['peaceful', 0.045],
	'the_bumblezone:structures/tree_dungeon': ['normal', 0.09],
	'formationsnether:sphere_cage/wither': ['normal', 0.09],
	'betterfortresses:chests/keep': ['normal', 0.09],
	'minecraft:chests/bastion_other': ['hard', 0.09],
	'artifacts:chests/campsite_chest': ['peaceful', 0.045],
	'dungeoncrawl:chests/stage_3': ['normal', 0.09],
	'allthemodium:chest/generic_loot': ['normal', 0.09],
	'minecraft:dispensers/trial_chambers/chamber': ['peaceful', 0.09],
	'formationsnether:sphere_cage/piglin': ['peaceful', 0.09],
	'minecraft:chests/shipwreck_treasure': ['hard', 0.25],
	'irons_spellbooks:chests/battleground/piglin_camp': ['normal', 0.09],
	'aether:chests/dungeon/bronze/bronze_dungeon': ['normal', 0.09],
	'dungeoncrawl:chests/stage_1': ['peaceful', 0.045],
	'eternal_starlight:chests/golem_forge': ['normal', 0.09],
	'undergarden:chests/depleted_mine/mound': ['peaceful', 0.045],
	'minecraft:chests/ancient_city_ice_box': ['hard', 0.09],
	'undergarden:chests/denizen_camp': ['peaceful', 0.045],
	'irons_spellbooks:chests/generic_magic_treasure': ['peaceful', 0.09],
	'pneumaticcraft:chests/mechanic_house': ['peaceful', 0.09],
	'twilightforest:tree_cache': ['peaceful', 0.045],
	'apotheosis:chests/tome_tower': ['peaceful', 0.045],
	'ctov:pillager_outpost/halloween/tower': ['hard', 0.5],
	'twilightforest:hedge_maze': ['peaceful', 0.045],
	'betterjungletemples:chests/campsite': ['peaceful', 0.5],
	'structory_towers:toadstool': ['peaceful', 0.5]
};

let peaceful_tables = [
	'the_bumblezone:structures/honey_cave_room',
	'dungeoncrawl:chests/stage_2',
	'minecraft:chests/bastion_bridge',
	'minecraft:chests/nether_bridge',
	'betterfortresses:chests/storage',
	'twilightforest:labyrinth_dead_end',
	'ctov:chests/village/village_mountain_house',
	'minecraft:chests/village/village_plains_house',
	'immersiveengineering:chests/engineers_house',
	'minecraft:chests/village/village_cartographer',
	'minecraft:chests/underwater_ruin_small',
	'minecraft:chests/village/village_butcher',
	'minecraft:chests/village/village_temple',
	'minecraft:chests/village/village_taiga_house',
	'apotheosis:chests/chest_valuable',
	'ctov:chests/village/village_dark_forest_house',
	'minecraft:chests/village/village_shepherd',
	'mns:chests/uncommon',
	'minecraft:chests/village/village_fisher',
	'ctov:chests/village/village_beach_house',
	'mns:chests/houses',
	'minecraft:chests/village/village_tannery',
	'ctov:chests/village/village_library',
	'minecraft:chests/village/village_mason',
	'ctov:chests/village/village_smith',
	'structory_towers:top/fortress_top',
	'twilightforest:chests/tower_library',
	'ars_additions:chests/arcane_library',
	'minecraft:chests/village/village_savanna_house',
	'structory:mood/fisherman',
	'ctov:chests/village/village_farm',
	'structory_towers:basic/farm_basic',
	'structory:mood/farmer',
	'ars_additions:chests/ruined_portal',
	'minecraft:chests/village/village_snowy_house',
	'structory_towers:basic/paranoid_basic',
	'structory_towers:basic/strange_basic',
	'ctov:chests/village/village_jungle_house',
	'ctov:chests/village/village_badlands_house',
	'structory_towers:basic/dark_basic',
	'structory_towers:basic/ocean_pillar_basic',
	'ctov:chests/village/village_forager',
	'structory:outcast/boat/loot',
	'minecraft:chests/village/village_toolsmith',
	'minecraft:chests/village/village_fletcher',
	'structory:mood/grassy',
	'betterstrongholds:chests/prison_lg',
	'structory_towers:basic/small_firetower_basic',
	'structory:harvest/graveyard',
	'structory:library/high',
	'betterstrongholds:chests/mess',
	'structory:harvest/graveyard2',
	'structory_towers:basic/warped_basic',
	'structory_towers:basic/trader_basic',
	'mss:general',
	'structory_towers:top/dark_top',
	'structory:library/low',
	'structory:outcast/farm_ruin',
	'structory_towers:top/ocean_pillar_top',
	'structory_towers:top/farm_top',
	'structory_towers:top/paranoid_top',
	'minecraft:chests/igloo_chest',
	'structory:outcast/settlement',
	'mss:arena',
	'structory:ruin/ruin',
	'mss:houses_uncommon',
	'structory_towers:top/small_firetower_top',
	'structory_towers:basic/forager_basic',
	'structory:outcast/ruin/ruin',
	'biomeswevegone:chests/village/pumpkin_patch/house',
	'ctov:chests/village/village_bakery',
	'structory_towers:top/warped_top',
	'structory:ruin/taiga/loot',
	'yungsextras:desert/extra_archeology',
	'mss:houses_common',
	'minecraft:chests/village/village_desert_house',
	'biomeswevegone:chests/village/skyris/house',
	'structory_towers:top/forager_top'
];

let normal_tables = [
	'iceandfire:chest/fire_dragon_male_cave',
	'iceandfire:chest/fire_dragon_female_cave',
	'dungeoncrawl:chests/stage_4',
	'betterdungeons:small_dungeon/chests/loot_piles',
	'betterdungeons:zombie_dungeon/chests/common',
	'betterdungeons:skeleton_dungeon/chests/common',
	'minecraft:chests/stronghold_crossing',
	'betterfortresses:chests/quarters',
	'irons_spellbooks:chests/citadel/citadel_bookshelf',
	'undergarden:chests/catacombs',
	'betterfortresses:chests/hall',
	'minecraft:chests/abandoned_mineshaft',
	'betterdungeons:spider_dungeon/chests/egg_room',
	'eternal_starlight:chests/cursed_garden',
	'minecraft:chests/ruined_portal',
	'aether:chests/dungeon/silver/silver_dungeon',
	'twilightforest:stronghold_cache',
	'dungeoncrawl:chests/treasure',
	'minecraft:chests/bastion_hoglin_stable',
	'twilightforest:chests/tower_room',
	'twilightforest:labyrinth_room',
	'minecraft:chests/shipwreck_supply',
	'twilightforest:darktower_cache',
	'aether:chests/dungeon/bronze/bronze_dungeon_reward',
	'minecraft:chests/shipwreck_map',
	'minecraft:chests/underwater_ruin_big',
	'betterstrongholds:chests/armoury',
	'betterfortresses:chests/worship',
	'minecraft:chests/village/village_weaponsmith',
	'betterdungeons:skeleton_dungeon/chests/middle',
	'minecraft:chests/stronghold_library',
	'minecraft:chests/stronghold_corridor',
	'betterstrongholds:chests/crypt',
	'structory:harvest/manor2/loot',
	'structory_towers:basic/lighthouse_basic',
	'betterstrongholds:chests/grand_library',
	'betterstrongholds:chests/trap',
	'structory:outcast/generic/bandit',
	'structory_towers:basic/pillager_basic',
	'structory_towers:top/strange_top',
	'betterjungletemples:archaeology/emerald',
	'mns:chests/treasure',
	'structory_towers:top/trader_top',
	'structory:harvest/manor2/treasure',
	'structory_towers:top/pillager_top',
	'mss:rare'
];

let hard_tables = [
	'dungeoncrawl:chests/stage_5',
	'betterfortresses:chests/extra',
	'allthemodium:chest/library_loot',
	'minecraft:chests/end_city_treasure',
	'minecraft:chests/trial_chambers/corridor',
	'minecraft:chests/bastion_treasure',
	'betterfortresses:chests/beacon',
	'minecraft:chests/jungle_temple',
	'betterstrongholds:chests/common',
	'minecraft:chests/trial_chambers/entrance',
	'betterdungeons:zombie_dungeon/chests/tombstone',
	'minecraft:chests/pillager_outpost',
	'allthemodium:chest/treasure_room',
	'allthemodium:chest/treasure_room_loot',
	'betterdungeons:zombie_dungeon/chests/special',
	'structory:ruin/taiga/illager_low',
	'betterfortresses:chests/puzzle',
	'irons_spellbooks:chests/catacombs/coffin_loot',
	'minecraft:chests/buried_treasure',
	'betterstrongholds:chests/treasure',
	'structory:ruin/taiga/illager_high',
	'minecraft:chests/woodland_mansion',
	'betteroceanmonuments:chests/upper_side_chamber',
	'structory_towers:end_tower',
	'structory:ruin/taiga/illager_treasure',
	'structory_towers:top/lighthouse_top',
	'betterjungletemples:chests/treasure'
];

function coinEntry(tier, weight, min, max) {
	min = min || 1;
	max = max || 1;

	let out = LootEntry.of(`puffercoin:coin_${tier}`).withWeight(weight);
	if (min != 1 || max != min)
		out = out.setCount([min,max]);
	return out;
}

LootJS.lootTables(event => {
	// Peaceful
	event.create('puffercoin:peaceful').createPool(pool => {
		pool.rolls([1,2]);

		pool.addEntry(coinEntry(1, 75));
		pool.addEntry(coinEntry(1, 10, 2, 4));
		pool.addEntry(coinEntry(2, 8));
		pool.addEntry(coinEntry(2, 3, 2, 3));
		pool.addEntry(coinEntry(3, 1));

	}).createPool(pool => {
		// Bonus: 0.05% chance of 729
		let conditions = pool.getConditions();
		conditions.add(LootCondition.randomChance(0.0005));
		pool.addEntry(coinEntry(4, 100));
	});

	// Normal
	event.create('puffercoin:normal').createPool(pool => {
		pool.rolls([1,3]);

		pool.addEntry(coinEntry(1, 50));
		pool.addEntry(coinEntry(1, 10, 3, 5));
		pool.addEntry(coinEntry(2, 30));
		pool.addEntry(coinEntry(2, 5, 2, 3));
		pool.addEntry(coinEntry(3, 1));

	}).createPool(pool => {
		// Bonus: 0.075% chance of 729
		let conditions = pool.getConditions();
		conditions.add(LootCondition.randomChance(0.00075));

		pool.addEntry(coinEntry(4, 100));
	});

	// Hard
	event.create('puffercoin:hard').createPool(pool => {
		pool.rolls([2,4]);

		pool.addEntry(coinEntry(1, 20));
		pool.addEntry(coinEntry(1, 55, 3, 5));
		pool.addEntry(coinEntry(2, 36));
		pool.addEntry(coinEntry(2, 13, 2, 3));
		pool.addEntry(coinEntry(3, 1));

	}).createPool(pool => {
		// Bonus: 0.01% chance of 729
		let conditions = pool.getConditions();
		conditions.add(LootCondition.randomChance(0.0001));

		pool.addEntry(coinEntry(4, 100));
	});

});

LootJS.modifiers(event => {
	for(const [k,v] of Object.entries(chance_tables))
		event
			.addTableModifier(k)
			.addLoot(LootEntry.reference(`puffercoin:${v[0]}`).when(c => c.randomChance(v[1])));

	if (hard_tables.length)
		event
			.addTableModifier(hard_tables)
			.addLoot(LootEntry.reference('puffercoin:hard').when(c => c.randomChance(0.18)));

	if (normal_tables.length)
		event
			.addTableModifier(normal_tables)
			.addLoot(LootEntry.reference('puffercoin:normal').when(c => c.randomChance(0.18)));

	if (peaceful_tables.length)
		event
			.addTableModifier(peaceful_tables)
			.addLoot(LootEntry.reference('puffercoin:peaceful').when(c => c.randomChance(0.18)));
});
