StartupEvents.registry('block', event => {
  event.create('chaos_arena:waystone')
    .displayName('Chaos Arena Waystone')
    .hardness(-1) // Unbreakable
    .resistance(3600000) // Blast resistant
    .lightLevel(15) // Emits light
    .mapColor('purple')
    .soundType('amethyst')
    .renderType('cutout')
    .box(2, 0, 2, 14, 16, 14)
    .tagBlock('minecraft:dragon_immune')
    .tagBlock('minecraft:wither_immune')
    .item(item => {
      item.displayName('Chaos Arena Waystone');
      item.rarity('epic');
    });
});

StartupEvents.postInit(event => {
  if (!Platform.isClientEnvironment()) return;
  const $WailaClientRegistration = Java.loadClass('snownee.jade.impl.WailaClientRegistration');
  $WailaClientRegistration.instance().addTooltipCollectedCallback(0, (tooltip, accessor) => global.jadeCallback(tooltip, accessor));
  $WailaClientRegistration.instance().tooltipCollectedCallback.sort();
});

global.jadeCallback = (boxElement, accessor) => {
  const $ElementHelper = Java.loadClass("snownee.jade.impl.ui.ElementHelper");
  const $NumberFormat = Java.loadClass("java.text.NumberFormat");
  if (!accessor.hitResult || accessor.block.id !== 'chaos_arena:waystone') return;
  // const tooltip = boxElement.getTooltip();
  // let component = Text.gray('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
  // let element = $ElementHelper.INSTANCE.text(component);
  // console.log(`Before: ${tooltip.size()}`);
  // tooltip.add(element);
  // console.log(`After: ${tooltip.size()}`);
};

console.log('Registered Chaos Arena blocks');