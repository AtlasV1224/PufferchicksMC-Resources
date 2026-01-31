function createWaystoneBlock(event) {
  const $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag');
  const initialData = new $CompoundTag();
  initialData.putInt('cooldown', 0);
  initialData.putInt('dest_x', 0);
  initialData.putInt('dest_y', 0);
  initialData.putInt('dest_z', 0);
  initialData.putInt('radius', 0);
  initialData.putInt('range', 8);
  initialData.putString('dimension', 'minecraft:overworld');
  initialData.putString('dest_type', 'default');

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
    .blockEntity(entityInfo => {
      entityInfo.initialData(initialData);
    })
    .item(item => {
      item.displayName('Chaos Arena Waystone');
      item.rarity('epic');
    });

  console.log('Registered Chaos Arena blocks');
}

StartupEvents.registry('block', event => createWaystoneBlock(event));