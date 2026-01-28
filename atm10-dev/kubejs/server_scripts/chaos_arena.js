// Settings
const CONFIG = {
  arenaRadius: 500,
  arenaCooldown: 7,
  waystoneRange: 8,
  islandRadius: 6,
  defaultCooldown: 1768683600,
  cooldownKey: 'chaos_arena_cooldown',
  returnKey: 'chaos_arena_return'
};

// Arenas are the center of where the Chaos Guardian will spawn
const ARENAS = {
  'n': {
    pos: { x: 0, y: 110, z: -10000 }
  },
  'ne': {
    pos: { x: 10000, y: 96, z: -10000 }
  },
  'e': {
    pos: { x: 10000, y: 95, z: 0 }
  },
  'se': {
    pos: { x: 10000, y: 95, z: 10000 }
  },
  's': {
    pos: { x: 0, y: 96, z: 10000 }
  },
  'sw': {
    pos: { x: -10000, y: 96, z: 10000 }
  },
  'w': {
    pos: { x: -10000, y: 96, z: 0 }
  },
  'nw': {
    pos: { x: -10000, y: 96, z: -10000 }
  }
};

// Waystones teleport players to their target arenas
const WAYSTONES = [
  {
    pos: { x: -25, y: 110, z: -4969 },
    dest: 'n'
  },
  {
    pos: { x: 4983, y: 110, z: -4984 },
    dest: 'ne'
  },
  {
    pos: { x: 4983, y: 110, z: 7 },
    dest: 'e'
  },
  {
    pos: { x: 4983, y: 110, z: 4984 },
    dest: 'se'
  },
  {
    pos: { x: 7, y: 110, z: 4984 },
    dest: 's'
  },
  {
    pos: { x: -4983, y: 64, z: 4983 },
    dest: 'sw'
  },
  {
    pos: { x: -4968, y: 110, z: 7 },
    dest: 'w'
  },
  {
    pos: { x: -4984, y: 110, z: -4985 },
    dest: 'nw'
  }
];

// Utility functions
function getNearbyWaystone(pos) {
  return WAYSTONES.find(waystone => isInRange(waystone.pos, pos));
}

function getWaystoneByDest(dest) {
  return WAYSTONES.find(waystone => waystone.dest === dest);
}

function isInRange(pos1, pos2) {
  return Math.abs(pos1.x - pos2.x) <= CONFIG.waystoneRange &&
    Math.abs(pos1.y - pos2.y) <= CONFIG.waystoneRange &&
    Math.abs(pos1.z - pos2.z) <= CONFIG.waystoneRange;
}

function isInArena(pos, id) {
  const arena = ARENAS[id];
  if (!arena) return false;
  let dx = pos.x - arena.pos.x;
  let dz = pos.z - arena.pos.z;
  return Math.sqrt(dx * dx + dz * dz) <= CONFIG.arenaRadius;
}

function setBlock(server, x, y, z, block) {
  server.runCommandSilent(`execute in minecraft:the_end run setblock ${x} ${y} ${z} ${block}`);
}

// Command handlers
function commandResetAll(context) {
  for (const id in ARENAS) {
    context.source.server.persistentData.remove(`${CONFIG.cooldownKey}_${id}`);
  }
  context.source.sendSuccess(Text.green('Reset cooldowns for all arenas'), true);
  return 1;
}

function commandResetArena(context, id) {
  context.source.server.persistentData.remove(`${CONFIG.cooldownKey}_${id}`);
  context.source.sendSuccess(Text.green(`Reset cooldown for arena: ${id}`), true);
  return 1;
}

function commandCreateArena(context, id) {
  const waystone = getWaystoneByDest(id);
  if (!waystone) {
    context.source.sendFailure(Text.red(`Waystone not found for arena: ${id}`));
    return 0;
  }
  console.log(`Creating island for waystone: ${id}`);
  generateIsland(context.source.server, waystone.pos);
  context.source.sendSuccess(Text.green(`Generated island for waystone: ${id}`), true);
  return 1;
}

function commandTpArena(context, id) {
  const waystone = getWaystoneByDest(id);
  if (!waystone) {
    context.source.sendFailure(Text.red(`Waystone not found for arena: ${id}`));
    return 0;
  }
  context.source.server.runCommandSilent(`execute in minecraft:the_end run tp ${context.source.entity.username} ${waystone.pos.x} ${waystone.pos.y} ${waystone.pos.z}`);
  context.source.sendSuccess(Text.green(`Teleported to waystone for arena: ${id}`), true);
  return 1;
}

// Event handlers
let tickCounter = 0;
function serverTick(event) {
  const { server: server } = event;
  if (server.tickCounter >= tickCounter) return;
  tickCounter = server.tickCounter + 20;
  server.players.forEach(player => {
    const returnData = player.persistentData.get(CONFIG.returnKey);
    if (!returnData?.arena) return;
    if (player.level.dimension !== 'minecraft:the_end' || !isInArena(player.pos, returnData.arena)) {
      console.log(`Exiting arena for player: ${player.username}`);
      player.persistentData.remove(CONFIG.returnKey);
      server.runCommandSilent(`lp user ${player.username} permission unsettemp chunkyborder.bypass.move`);
      server.runCommandSilent(`lp user ${player.username} permission unsettemp chunkyborder.bypass.place`);
      return;
    }
  });
}

// Waystone interaction handler
const waystoneDebouncer = {};
function rightClickWaystone(event) {
  const { player: player, block: block, server: server } = event;
  let now = Math.floor(Date.now() / 1000); // Seconds since epoch
  let last = waystoneDebouncer[player.uuid] ?? 0;
  waystoneDebouncer[player.uuid] = now + 2;
  if (now < last + 2) return;
  
  // Verify dimension
  if (event.level.dimension != 'minecraft:the_end') {
    player.tell(Text.red('This waystone only works in The End dimension!'));
    return;
  }

  // Verify nearby waystone
  const waystone = getNearbyWaystone(block.pos);
  if (!waystone) {
    player.tell(Text.red('No waystone found nearby!'));
    return;
  }
  
  const arena = waystone.dest ? ARENAS[waystone.dest] : null;
  if (!arena) {
    return;
  }

  console.log(`Found waystone for arena: ${waystone.dest}`);
  let daysNow = Math.floor(now / 86400); // Days since epoch
  let cooldown = server.persistentData.getInt(`${CONFIG.cooldownKey}_${waystone.dest}`);
  let daysLeft = CONFIG.arenaCooldown - (daysNow - cooldown);

  // Verify arena cooldown
  if (daysLeft > 0) {
    player.tell(Text.red(`This arena is on cooldown for ${daysLeft} more days!`));
    return;
  }
  
  console.log(`Teleporting players to arena: ${waystone.dest}`);

  // Update cooldown
  server.persistentData.putInt(`${CONFIG.cooldownKey}_${waystone.dest}`, daysNow);
  
  // Preload the destination chunk
  let chunkX = Math.floor(arena.pos.x / 16);
  let chunkZ = Math.floor(arena.pos.z / 16);
  server.runCommandSilent(`execute in minecraft:the_end run forceload add ${chunkX} ${chunkZ}`);

  // Respawn the dragon
  server.runCommandSilent(`execute positioned ${arena.pos.x} ${arena.pos.y} ${arena.pos.z} in minecraft:the_end run respawn_draconic_guardian`);
  
  // Find nearby players
  let players = server.players.filter(player => player.level.dimension == 'minecraft:the_end' && isInRange(waystone.pos, { x: player.x, y: player.y, z: player.z }));
  
  // Countdown
  let seconds = 3;
  players.forEach(player => {
    player.tell(Text.gold('The Chaos Guardian stirs...'));
    player.tell(Text.yellow(`Teleporting to the arena in ${seconds} second(s)!`));
  });
  
  for (let i = 1; i < seconds; i++) {
    let remaining = seconds - i;
    server.scheduleInTicks(i * 20, () => {
      players.forEach(player => {
        player.tell(Text.yellow(`Teleporting to the arena in ${remaining} second(s)!`));
      });
    });
  }

  // Teleport nearby players
  server.scheduleInTicks(seconds * 20, () => {
    players.forEach(player => {
      const { x: x, y: y, z: z } = player;
      console.log(`Entering arena: ${waystone.dest} for player: ${player.username}`);
      server.scheduleInTicks(100, () => {
        player.persistentData.put(CONFIG.returnKey, {
          arena: waystone.dest,
          x: x,
          y: y,
          z: z
        });
      });
      server.runCommandSilent(`lp user ${player.username} permission settemp chunkyborder.bypass.move true 1h replace`);
      server.runCommandSilent(`lp user ${player.username} permission settemp chunkyborder.bypass.place true 1h replace`);
      server.runCommandSilent(`execute in minecraft:the_end run tp ${player.username} ${arena.pos.x} ${arena.pos.y} ${arena.pos.z}`);
    });
  });
  
  // Unforceload the chunks after some time
  server.scheduleInTicks((seconds + 30) * 20, () => {
    server.runCommandSilent(`execute in minecraft:the_end run forceload remove ${chunkX} ${chunkZ}`);
  });
}

// Island generation
function generateIsland(server, pos) {
  const materials = ['minecraft:obsidian', 'minecraft:crying_obsidian'];

  // Generate the island
  console.log(`Generating island at ${pos.x}, ${pos.y}, ${pos.z}`);
  let x, y, z, radius, radiusSq, distSq, material;
  for (let dy = 0; dy < 4; dy++) {
    y = pos.y - dy;
    radius = Math.max(1, CONFIG.islandRadius - dy);
    radiusSq = radius * radius;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        distSq = dx * dx + dz * dz;
        x = pos.x + dx;
        z = pos.z + dz;
        material = distSq >= radiusSq ? 'minecraft:air' : materials[Math.floor(Math.random() * materials.length)];
        setBlock(server, x, y, z, material);
      }
    }
  }

  // Beacon base
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      setBlock(server, pos.x + dx, pos.y - 1, pos.z + dz, 'minecraft:netherite_block');
    }
  }

  // Beacon
  setBlock(server, pos.x, pos.y, pos.z, 'minecraft:beacon{primary_effect:"minecraft:regeneration",secondary_effect:"minecraft:regeneration"}');
  
  // Waystone
  setBlock(server, pos.x, pos.y + 1, pos.z, 'chaos_arena:waystone');
  
  // Light sources
  setBlock(server, pos.x + CONFIG.islandRadius, pos.y + 1, 0, 'minecraft:light[level=15]');
  setBlock(server, pos.x - CONFIG.islandRadius, pos.y + 1, 0, 'minecraft:light[level=15]');
  setBlock(server, 0, pos.y + 1, pos.z + CONFIG.islandRadius, 'minecraft:light[level=15]');
  setBlock(server, 0, pos.y + 1, pos.z - CONFIG.islandRadius, 'minecraft:light[level=15]');
}

// Main
BlockEvents.rightClicked('chaos_arena:waystone', rightClickWaystone);
ServerEvents.tick(serverTick);
ServerEvents.commandRegistry(event => {
  const { commands: commands, arguments: args } = event;
  event.register(commands.literal('chaos_arena')
    .requires(source => source.hasPermission(2))
    .then(
      commands.literal('reset_all').executes(commandResetAll)
    )
    .then(
      commands.literal('reset').then(
        commands.argument('arena', args.STRING.create(event))
          .executes(context => commandResetArena(context, args.STRING.getResult(context, 'arena')))
      )
    )
    .then(
      commands.literal('create').then(
        commands.argument('arena', args.STRING.create(event))
          .executes(context => commandCreateArena(context, args.STRING.getResult(context, 'arena')))
      )
    )
    .then(
      commands.literal('tp').then(
        commands.argument('arena', args.STRING.create(event))
          .executes(context => commandTpArena(context, args.STRING.getResult(context, 'arena')))
      )
    )
  );
});