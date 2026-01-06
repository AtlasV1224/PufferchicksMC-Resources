// Needed classes
const SeatEntity = Java.loadClass("com.simibubi.create.content.contraptions.actors.seat.SeatEntity");
const _AABB = Java.loadClass("net.minecraft.world.phys.AABB");
const StockTickerInteractionHandler = Java.loadClass("com.simibubi.create.content.logistics.stockTicker.StockTickerInteractionHandler");

let COLORS = [
    'black', 'blue', 'brown', 'cyan', 'gray', 'green',
    'light_blue', 'light_gray', 'lime', 'magenta', 'orange',
    'pink', 'purple', 'red', 'white', 'yellow'
];

// Make Create stock keeper seats less annoying.

function handleRightClick(event) {
    let pos = event.block.pos;
    let level = event.block.level;

    let seats = level.getEntitiesOfClass(SeatEntity, new _AABB(pos));
    if ( ! seats.isEmpty() ) {
        let seat = seats.get(0);
        let passengers = seat.getPassengers();
        if (!passengers.isEmpty()) {
            let passenger = passengers.get(0);
            let ticker = StockTickerInteractionHandler.getStockTickerPosition(passenger);
            if (ticker != null)
                event.cancel();
        }
    }
}

for(const color of COLORS) {
    BlockEvents.rightClicked(`create:${color}_seat`, handleRightClick);
}
