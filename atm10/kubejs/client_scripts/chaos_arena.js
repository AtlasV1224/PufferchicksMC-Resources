ItemEvents.modifyTooltips(event => {
  event.add('chaos_arena:waystone', [
    Text.empty(),
    Text.gold('Chaos Arena Waystone'),
    Text.gray('Right-click to teleport to the destination'),
    Text.darkGray('Gathers all nearby players'),
    Text.empty(),
    Text.darkPurple('Arena locks until the next reset!')
  ]);
});
