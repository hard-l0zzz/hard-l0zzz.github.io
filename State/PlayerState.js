class PlayerState {
    constructor() {
        this.pizzas = {
            "p1":{
                pizzaId:"s001",
                hp: 1,
                maxHp: 50,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null
            },
            "p2":{
                pizzaId:"s002",
                hp: 1,
                maxHp: 50,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null
            }
        }
        this.lineup = ["p1", "p2"];
        this.items = [
            { actionId: "item_recoverHp", instanceId: "item1" },
            { actionId: "item_recoverHp", instanceId: "item2" },
            { actionId: "item_recoverHp", instanceId: "item3" },
        ]
    }
    swapLineup(oldId, incomingId) {
        const oldIndex = this.lineup.indexOf(oldId);
        this.lineup[oldIndex] = incomingId;
        utils.emitEvent("LineupChanged");
      }
    
      moveToFront(futureFrontId) {
        this.lineup = this.lineup.filter(id => id !== futureFrontId);
        this.lineup.unshift(futureFrontId);
        utils.emitEvent("LineupChanged");
      }
}
window.playerState = new PlayerState();