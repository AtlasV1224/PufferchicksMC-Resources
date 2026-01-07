/* A few recipes are missing for various blocks and items,
*  this adds a few recipes to fix this
*/
ServerEvents.recipes(event => {
    // Twilight Forest
    // Wrought Iron
    event.smelting('2x twilightforest:wrought_iron_bar', 'minecraft:iron_ingot')
    event.blasting('2x twilightforest:wrought_iron_bar', 'minecraft:iron_ingot')
    // Coronation Carpet
    event.shapeless(Item.of('twilightforest:coronation_carpet', 8),
        ['8x minecraft:red_carpet', 'minecraft:gold_nugget'])
})