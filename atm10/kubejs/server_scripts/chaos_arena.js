const CONFIG = {
  arenaRadius: 500,
  arenaCooldown: 7,
  waystoneRange: 8,
  islandRadius: 6
};

const DEFAULT_COOLDOWN = 1768683600;

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

const COOLDOWN_KEY = 'chaos_arena_cooldown';
const RETURN_KEY = 'chaos_arena_return';

// Utility functions
const getNearbyWaystone = pos => WAYSTONES.find(waystone => isInRange(waystone.pos, pos));
const getWaystoneByDest = dest => WAYSTONES.find(waystone => waystone.dest === dest);

const isInRange = (pos1, pos2) =>
  Math.abs(pos1.x - pos2.x) <= CONFIG.waystoneRange &&
  Math.abs(pos1.y - pos2.y) <= CONFIG.waystoneRange &&
  Math.abs(pos1.z - pos2.z) <= CONFIG.waystoneRange;

const isInArena = (pos, id) => {
  const arena = ARENAS[id];
  if (!arena) return false;
  let dx = pos.x - arena.pos.x;
  let dz = pos.z - arena.pos.z;
  return Math.sqrt(dx * dx + dz * dz) <= CONFIG.arenaRadius;
}

const setBlock = (server, x, y, z, block) => {
  server.runCommandSilent(`execute in minecraft:the_end run setblock ${x} ${y} ${z} ${block}`);
}

// Arena entry/exit functions
function onEnterArena(server, player, id) {
  console.log(`Entering arena: ${id} for player: ${player.username}`);
  player.persistentData.put(RETURN_KEY, {
    arena: id,
    x: player.x,
    y: player.y,
    z: player.z
  });
  server.runCommandSilent(`chunky border bypass`);
}

function enterArena(server, player, id) {
  const arena = ARENAS[id];
  onEnterArena(server, player, id);
  server.runCommandSilent(`execute in minecraft:the_end run tp ${player.username} ${arena.pos.x} ${arena.pos.y} ${arena.pos.z}`);
};

function onExitArena(server, player) {
  console.log(`Exiting arena for player: ${player.username}`);
  player.persistentData.remove(RETURN_KEY);
  server.runCommandSilent(`chunky border bypass`);
}

function exitArena(server, player) {
  const returnData = player.persistentData.get(RETURN_KEY);
  if (!returnData?.arena) return;
  onExitArena(server, player);
  server.runCommandSilent(`execute in minecraft:the_end run tp ${player.username} ${returnData.x} ${returnData.y} ${returnData.z}`);
};

// Waystone interaction handler
const waystoneDebouncer = {};
function rightClickWaystone(event) {
  const { player: Player, block: Block, server: Server } = event;
  let now = Math.floor(Date.now() / 1000); // Seconds since epoch
  let last = waystoneDebouncer[Player.uuid] ?? 0;
  waystoneDebouncer[Player.uuid] = now;
  if (now - last < 2) return;
  
  // Verify dimension
  if (event.level.dimension != 'minecraft:the_end') {
    Player.tell(Text.red('This waystone only works in The End dimension!'));
    return;
  }

  // Verify nearby waystone
  const waystone = getNearbyWaystone(Block.pos);
  if (!waystone) {
    Player.tell(Text.red('No waystone found nearby!'));
    return;
  }
  
  // Entry waystone
  const arena = waystone.dest ? ARENAS[waystone.dest] : null;
  if (arena) {
    console.log(`Found entry waystone for arena: ${waystone.dest}`);
    let daysNow = Math.floor(now / 86400); // Days since epoch
    let cooldown = Server.persistentData.getInt(`${COOLDOWN_KEY}_${waystone.dest}`);
    let daysLeft = CONFIG.arenaCooldown - (daysNow - cooldown);

    // Verify arena cooldown
    if (daysLeft > 0) {
      Player.tell(Text.red(`This arena is on cooldown for ${daysLeft} more days!`));
      return;
    }
    
    // Handle uninitialized cooldown
    let timeLeft = DEFAULT_COOLDOWN - now;
    if (cooldown === 0 && timeLeft > 0) {
      if (timeLeft < 60) {
        Player.tell(Text.red(`This arena is on cooldown for ${timeLeft} more seconds!`));
        return;
      }

      if (timeLeft < 3600) {
        let minutes = Math.ceil(timeLeft / 60);
        Player.tell(Text.red(`This arena is on cooldown for ${minutes} more minutes!`));
        return;
      }

      let hours = Math.ceil(timeLeft / 3600);
      Player.tell(Text.red(`This arena is on cooldown for ${hours} more hours!`));
      return;
    }
    
    console.log(`Teleporting players to arena: ${waystone.dest}`);

    // Update cooldown
    Server.persistentData.putInt(`${COOLDOWN_KEY}_${waystone.dest}`, daysNow);
    
    // Teleport nearby players
    Server.players
      .filter(player => player.level.dimension == 'minecraft:the_end' && isInRange(waystone.pos, { x: player.x, y: player.y, z: player.z }))
      .forEach(player => enterArena(Server, player, waystone.dest));

    return;
  }
  
  // Exit waystone
  exitArena(Server, Player);
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

// Handle waystone interaction
BlockEvents.rightClicked('chaos_arena:waystone', rightClickWaystone);

// Player monitoring
let tickCounter = 0;
ServerEvents.tick(event => {
  const { server: Server } = event;
  if (Server.tickCounter - tickCounter < 20) return;
  tickCounter = Server.tickCounter;
  Server.players
    .forEach(player => {
      const returnData = player.persistentData.get(RETURN_KEY);
      if (!returnData?.arena) return;
      if (player.level.dimension !== 'minecraft:the_end' || !isInArena(player.pos, returnData.arena)) {
        onExitArena(Server, player);
        return;
      }
    });
});

// Admin commands
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event;
  event.register(Commands.literal('chaos_arena')
    .requires(source => source.hasPermission(2))
    .then(Commands.literal('reset_all')
      .executes(context => {
        const server = context.source.server;
        for (const id in ARENAS) {
          server.persistentData.remove(`${COOLDOWN_KEY}_${id}`);
        }
        context.source.sendSuccess(Text.green('Reset cooldowns for all arenas'), true);
        return 1;
      }))
    .then(Commands.literal('reset')
      .then(Commands.argument('arena', Arguments.STRING.create(event))
        .executes(context => {
          const id = Arguments.STRING.getResult(context, 'arena');
          const arena = ARENAS[id];
          if (!arena) {
            context.source.sendFailure(Text.red(`Arena not found: ${id}`));
            return 0;
          }
          const server = context.source.server;
          server.persistentData.remove(`${COOLDOWN_KEY}_${id}`);
          context.source.sendSuccess(Text.green(`Reset cooldown for arena: ${id}`), true);
          return 1;
        })))
    .then(Commands.literal('create')
      .then(Commands.argument('arena', Arguments.STRING.create(event))
        .executes(context => {
          const id = Arguments.STRING.getResult(context, 'arena');
          const waystone = getWaystoneByDest(id);
          if (!waystone) {
            context.source.sendFailure(Text.red(`Waystone not found for arena: ${id}`));
            return 0;
          }
          console.log(`Creating island for waystone: ${id}`);
          generateIsland(context.source.server, waystone.pos);
          context.source.sendSuccess(Text.green(`Generated island for waystone: ${id}`), true);
          return 1;
        })))
    .then(Commands.literal('tp')
      .then(Commands.argument('arena', Arguments.STRING.create(event))
        .executes(context => {
          const id = Arguments.STRING.getResult(context, 'arena');
          const waystone = getWaystoneByDest(id);
          if (!waystone) {
            context.source.sendFailure(Text.red(`Waystone not found for arena: ${id}`));
            return 0;
          }
          const server = context.source.server;
          server.runCommandSilent(`execute in minecraft:the_end run tp ${context.source.entity.username} ${waystone.pos.x} ${waystone.pos.y} ${waystone.pos.z}`);
          context.source.sendSuccess(Text.green(`Teleported to waystone for arena: ${id}`), true);
          return 1;
        }))))
});