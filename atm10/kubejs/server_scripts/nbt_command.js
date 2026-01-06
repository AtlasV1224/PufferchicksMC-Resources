// Register a /nbt command for viewing NBT data.
ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;

    event.register(Commands.literal('nbt')
        .then(Commands.literal('held')
            .executes(c => processHeld(c)))
        .then(Commands.literal('offhand')
            .executes(c => processOffhand(c)))
        .then(Commands.literal('entity')
            .then(Commands.argument('target', Arguments.ENTITY.create(event))
                .executes(c => {
                    let target = Arguments.ENTITY.getResult(c, 'target')
                    return processEntity(target, c);
                })
            )
            .executes(c => processEntity(null, c))
        )
        .then(Commands.literal('block')
            .then(Commands.argument('pos', Arguments.BLOCK_POS.create(event))
                .executes(c => {
                    let pos = Arguments.BLOCK_POS.getResult(c, 'pos')
                    return processBlock(pos, c);
                })
            )
            .executes(c => processBlock(null, c))
        )
    .executes(c => process(c)));

    function process(ctx) {
        let source = ctx.getSource();
        let player = source.player;
        if (player == null) {
            source.sendFailure("This command can only be run without arguments by a player.");
            return 0;
        }

        let result = player.rayTrace(player.reachDistance, false);
        if (result == null || result.type === 'MISS') {
            // Held Item
            let item = player.mainHandItem;
            if (item == null || item.isEmpty()) {
                item = player.offHandItem;
                if (item != null && !item.isEmpty())
                    return processOffhand(ctx);

                source.sendFailure("You are not looking at anything and not holding an item.");
                return 0;
            } else
                return processHeld(ctx);
        }

        if (result.type === 'ENTITY') {
            // Entity
            return processEntity(result.entity, ctx);
        }

        if (result.type === 'BLOCK') {
            // Block
            return processBlock(result.block.pos, ctx);
        }

        source.sendFailure("Unknown hit result type.");
        return 0;
    }

    function processHeld(ctx) {
        let source = ctx.getSource();
        let player = source.player;
        if (player == null) {
            source.sendFailure("This command requires a player.");
            return 0;
        }

        let item = player.mainHandItem;
        if (item == null || item.isEmpty()) {
            source.sendFailure("You are not holding an item.");
            return 0;
        }

        let data = item.save(player.level.registryAccess());
        let printed = Component.prettyPrintNbt(data);

        source.sendSuccess(
            Component.literal("Held item: ").append(printed),
            false
        );
        return 1;
    }

    function processOffhand(ctx) {
        let source = ctx.getSource();
        let player = source.player;
        if (player == null) {
            source.sendFailure("This command requires a player.");
            return 0;
        }

        let item = player.offHandItem;
        if (item == null || item.isEmpty()) {
            source.sendFailure("You are not holding an item in your off-hand.");
            return 0;
        }

        let data = item.save(player.level.registryAccess());
        let printed = Component.prettyPrintNbt(data);

        source.sendSuccess(
            Component.literal("Off-hand held item: ").append(printed),
            false
        );
        return 1;
    }

    function processBlock(pos, ctx) {
        let source = ctx.getSource();
        if (pos == null) {
            let player = source.player;
            if (player == null) {
                source.sendFailure("A position is required if not run by a player.");
                return 0;
            }

            let result = player.rayTrace(player.reachDistance, false);
            if (result == null || result.type !== 'BLOCK') {
                source.sendFailure("You must be looking at a block.");
                return 0;
            }

            pos = result.block.pos;
        }

        let entity = source.getLevel().getBlockEntity(pos);
        if (entity == null) {
            source.sendFailure(`No block entity found at ${pos.x}, ${pos.y}, ${pos.z}`);
            return 0;
        }

        let data = entity.saveWithFullMetadata(entity.level.registryAccess());
        let printed = Component.prettyPrintNbt(data);

        source.sendSuccess(
            Component.literal(`Block entity at ${pos.x}, ${pos.y}, ${pos.z}: `).append(printed),
            false
        );
        return 1;
    }

    function processEntity(entity, ctx) {
        let source = ctx.getSource();
        if (entity == null) {
            let player = source.player;
            if (player == null) {
                source.sendFailure("A target is required if not run by a player.");
                return 0;
            }

            let result = player.rayTrace(player.reachDistance, false);
            if (result == null || result.type !== 'ENTITY' || result.entity == null) {
                source.sendFailure("You must be looking at an entity.");
                return 0;
            }

            entity = result.entity;
        }

        // Security: Players can't snoop other players.
        if (entity.player) {
            if (source.hasPermission(2)) {
                // Allow ops to view other players' NBT.
            } else if (source.player.uuid !== entity.uuid) {
                source.sendFailure("You cannot view the NBT of other players.");
                return 0;
            }
        }

        let data = NbtPredicate.getEntityTagToCompare(entity);
        let printed = Component.prettyPrintNbt(data);

        source.sendSuccess(
            entity.displayName.append(": ").append(printed),
            false
        );
        return 1;
    }

});