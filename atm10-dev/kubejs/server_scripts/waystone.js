// Settings
const ARENA_KEY = 'waystone_arena';
const COUNTDOWN_KEY = 'arena_countdown';

let DEST_TYPES = {
  'default': {
    init: (server, data, players) => {},
  },
  'chaos_guardian': {
    init: (server, data, players) => {
      const dest_x = data.getInt('dest_x');
      const dest_y = data.getInt('dest_y');
      const dest_z = data.getInt('dest_z');
      const dimension = data.getString('dimension');
      server.runCommandSilent(`execute positioned ${dest_x} ${dest_y} ${dest_z} in ${dimension} respawn_draconic_guardian`);
      players.forEach(player => {
        player.tell(Text.gold('The Chaos Guardian stirs...'));
      });
    }
  }
}

const waystoneMonitor = { current: null };
BlockEvents.rightClicked('chaos_arena:waystone', event => rightClickWaystone(event));

// Monitor player(s) in arena
function monitorPlayers(server) {
  server.players.forEach(player => {
    const data = player.persistentData.get(ARENA_KEY);
    if (!data) return;
    let countdown = player.persistentData.getInt(COUNTDOWN_KEY);
    
    // Check if player is in arena
    let dx = player.x - data.getInt('x');
    let dz = player.z - data.getInt('z');
    let isInArena = player.level.dimension == data.getString('dimension') &&
      Math.sqrt(dx * dx + dz * dz) <= data.getInt('radius');

    // Wait for player to enter arena
    if (countdown < 0 && !isInArena) return;

    // Player has entered the arena
    if (isInArena) {
      player.persistentData.putInt(COUNTDOWN_KEY, 5);
      if (countdown < 0) console.log(`Player has entered the arena: ${player.username}`);
      return;
    }
  
    // Player has left the arena
    if (countdown == 5) {
      player.tell(Text.gold(`You have left the arena!`));
    }
    
    if (countdown == 0) {
      console.log(`Player has exited the arena: ${player.username}`);
      player.persistentData.remove(ARENA_KEY);
      player.persistentData.remove(COUNTDOWN_KEY);
      server.runCommandSilent(`lp user ${player.username} permission unsettemp chunkyborder.bypass.move`);
      server.runCommandSilent(`lp user ${player.username} permission unsettemp chunkyborder.bypass.place`);
      return;
    }
    
    player.tell(Text.yellow(`Exiting arena in ${countdown} second(s)...`));
    countdown--;
    player.persistentData.putInt(COUNTDOWN_KEY, countdown);
  });
}

// Send player(s) to arena
function rightClickWaystone(event) {
  const { block: { pos }, hand, level, player, server } = event;
  if (hand == 'OFF_HAND') return;
  const entity = level.getBlockEntity(pos);
  if (!entity) return;
  let data = entity.saveWithFullMetadata(level.registryAccess()).get('data');
  if (!data) return;

  // Check cooldown
  let cooldown = data.getInt('cooldown') ?? 0;
  let days = Math.floor(Date.now() / 86400000);
  if (cooldown >= days) {
    player.tell(Text.red('This arena is on cooldown. Try again tomorrow!'));
    return;
  }

  // Find nearby players
  const range = data.getInt('range') ?? 8;
  let players = server.players.filter(player =>
    player.level.dimension == level.dimension &&
    Math.abs(pos.x - player.x) <= range &&
    Math.abs(pos.y - player.y) <= range &&
    Math.abs(pos.z - player.z) <= range);
  if (players.length == 0) return;

  console.log('Teleporting players to arena');

  // Update cooldown
  server.runCommandSilent(`execute in ${level.dimension} run data merge block ${pos.x} ${pos.y} ${pos.z} {data:{cooldown:${days}}}`);

  // Get the waystone destination
  const dest_x = data.getInt('dest_x');
  const dest_y = data.getInt('dest_y');
  const dest_z = data.getInt('dest_z');
  const radius = data.getInt('radius');
  const dimension = data.getString('dimension');
  const dest_type = data.getString('dest_type');
  
  // Preload the destination chunk
  let chunkX = Math.floor(dest_x / 16);
  let chunkZ = Math.floor(dest_z / 16);
  server.runCommandSilent(`execute in ${dimension} run forceload add ${chunkX} ${chunkZ}`);

  // Initialize destination by type
  DEST_TYPES[dest_type]?.init(server, data, players);
  
  // Setup monitoring
  if (waystoneMonitor.current) waystoneMonitor.current.clear();
  waystoneMonitor.current = server.scheduleRepeatingInTicks(20, _ => monitorPlayers(server));

  players.forEach(player => {
    player.persistentData.put(ARENA_KEY, {
      x: dest_x,
      z: dest_z,
      radius: radius,
      dimension: dimension
    });
    player.persistentData.putInt(COUNTDOWN_KEY, -1);
    server.runCommandSilent(`lp user ${player.username} permission settemp chunkyborder.bypass.move true 1h replace`);
    server.runCommandSilent(`lp user ${player.username} permission settemp chunkyborder.bypass.place true 1h replace`);
  });
  
  // Countdown
  let seconds = 3;
  for (let i = 0; i < seconds; i++) {
    let remaining = seconds - i;
    server.scheduleInTicks(i * 20, () => {
      players.forEach(player => {
        player.tell(Text.yellow(`Teleporting to the arena in ${remaining} second(s)!`));
      });
    });
  }

  // Teleport players
  server.scheduleInTicks(seconds * 20, () => {
    players.forEach(player => {
      console.log(`Teleporting player ${player.username} to arena at ${dest_x}, ${dest_y}, ${dest_z} in ${dimension}`);
      server.runCommandSilent(`execute in ${dimension} run tp ${player.username} ${dest_x} ${dest_y} ${dest_z}`);
    });
  });
  
  // Unforceload the chunks after some time
  server.scheduleInTicks((seconds + 30) * 20, () => {
    server.runCommandSilent(`execute in ${dimension} run forceload remove ${chunkX} ${chunkZ}`);
  });
}
