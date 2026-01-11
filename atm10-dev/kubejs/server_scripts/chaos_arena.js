const CONFIG = {
  arenaRadius: 500,
  arenaCooldown: 7,
  waystoneRange: 8
};

const ARENAS = {
  'nw': {
    pos: { x: -10000, y: 96, z: -10000 }
  }
};

const WAYSTONES = [
  {
    pos: { x: -4998, y: 66, z: -4946 },
    dest: 'nw'
  }
];

const COOLDOWN_KEY = 'chaos_arena_cooldown';
const RETURN_KEY = 'chaos_arena_return';

const getNearbyWaystone = pos => WAYSTONES.find(waystone => isInRange(waystone.pos, pos));

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

const onEnterArena = (server, player, id) => {
  console.log(`Entering arena: ${id} for player: ${player.username}`);
  player.persistentData.put(RETURN_KEY, {
    arena: id,
    x: player.x,
    y: player.y,
    z: player.z
  });
  server.runCommandSilent(`chunky border bypass`);
}

const enterArena = (server, player, id) => {
  const arena = ARENAS[id];
  onEnterArena(server, player, id);
  server.runCommandSilent(`execute in minecraft:the_end run tp ${player.username} ${arena.pos.x} ${arena.pos.y} ${arena.pos.z}`);
};

const onExitArena = (server, player) => {
  console.log(`Exiting arena for player: ${player.username}`);
  player.persistentData.remove(RETURN_KEY);
  server.runCommandSilent(`chunky border bypass`);
}

const exitArena = (server, player) => {
  const returnData = player.persistentData.get(RETURN_KEY);
  if (!returnData?.arena) return;
  onExitArena(server, player);
  server.runCommandSilent(`execute in minecraft:the_end run tp ${player.username} ${returnData.x} ${returnData.y} ${returnData.z}`);
};

const rightClickWaystone = event => {
  const { player: Player, block: Block, server: Server } = event;
  
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

    let now = Math.floor(Date.now() / 86400000); // Days since epoch
    let cooldown = Server.persistentData.getInt(`${COOLDOWN_KEY}_${waystone.dest}`);
    let daysLeft = CONFIG.arenaCooldown - (now - cooldown);

    // Verify arena cooldown
    if (daysLeft > 0) {
      Player.tell(Text.red(`This arena is on cooldown for ${daysLeft} more day(s)!`));
      return;
    }
    
    console.log(`Teleporting players to arena: ${waystone.dest}`);

    // Update cooldown
    Server.persistentData.putInt(`${COOLDOWN_KEY}_${waystone.dest}`, now);
    
    // Teleport nearby players
    Server.players
      .filter(player => player.level.dimension == 'minecraft:the_end' && isInRange(waystone.pos, { x: player.x, y: player.y, z: player.z }))
      .forEach(player => enterArena(Server, player, waystone.dest));

    return;
  }
  
  // Exit waystone
  exitArena(Server, Player);
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
        }))));
});