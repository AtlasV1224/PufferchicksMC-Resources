const $LuckPerms = Java.loadClass('net.luckperms.api.LuckPermsProvider');

// Utility functions
function hasPermission(user, permission) {
  return user.getCachedData()
    .getPermissionData()
    .checkPermission(permission)
    .asBoolean();
}

function isAdmin(uuid) {
  return $LuckPerms.get()
    .getUserManager()
    .loadUser(uuid)
    .thenApplyAsync(user => {
      let inheritedGroups = user.getInheritedGroups(user.getQueryOptions());
      return inheritedGroups.stream().anyMatch(group => group.getName().equals("admin"));
    });
}

// Command handlers
function commandStart(context) {
  const { server: server, playerOrException: player } = context.source;
  isAdmin(player.uuid).thenAcceptAsync(result => {
    if (!result) {
      context.source.sendError(Text.red('You shall not pass!'))
      return;
    }
    server.runCommandSilent(`lp user ${player.username} permission settemp luckperms.autoop true 1h replace`);
    server.runCommandSilent(`gamemode spectator ${player.username}`);
    context.source.sendSuccess(Text.green('With great power comes great responsibility!'), true);
  }).exceptionally(error => {
    context.source.sendError(Text.red('An error occurred while checking permissions.'));
    console.error(error);
  });
  return 1;
}

function commandStop(context) {
  const { server: server, playerOrException: player } = context.source;
  isAdmin(player.uuid).thenAcceptAsync(result => {
    if (!result) {
      context.source.sendError(Text.red('You shall not pass!'))
      return;
    }
    server.runCommandSilent(`lp user ${player.username} permission unsettemp luckperms.autoop`);
    server.runCommandSilent(`gamemode survival ${player.username}`);
    context.source.sendSuccess(Text.green('Welcome back to the normie world!'), true);
  }).exceptionally(error => {
    context.source.sendError(Text.red('An error occurred while checking permissions.'));
    console.error(error);
  });
  return 1;
}

function commandSpark(context, ticks) {
  const { server: server, playerOrException: player } = context.source;
  isAdmin(player.uuid).thenAcceptAsync(result => {
    if (!result) {
      context.source.sendError(Text.red('You shall not pass!'))
      return;
    }
    if (ticks <= 0) {
      server.runCommandSilent('spark profiler start --threads * --timeout 30');
      return;
    }
    server.runCommandSilent(`spark profiler start --threads * --timeout 30 --only-ticks-over ${ticks}`);
  });
  return 1;
}

// Main
ServerEvents.commandRegistry(event => {
  const { commands: commands, arguments: args } = event;
  event.register(commands.literal('sudo')
    .then(commands.literal('start')
      .executes(commandStart))
    .then(commands.literal('stop')
      .executes(commandStop))
    .then(commands.literal('spark')
      .executes(context => commandSpark(context, 50))
      .then(commands.argument('ticks', args.INTEGER.create(event))
        .executes(context => commandSpark(context, args.INTEGER.getResult(context, 'ticks'))))));
});