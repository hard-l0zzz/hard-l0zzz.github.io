class PlayerState {
    constructor() {
        this.pizzas = {
            "p1":{
                pizzaId:"s001",
                hp: 50,
                maxHp: 50,
                xp: 0,
                maxXp: 100,
                level: 1,
                status: null
            },
        }
        this.lineup = ["p1"];
        this.items = [
            { actionId: "item_recoverHp", instanceId: "item1" },
            { actionId: "item_recoverHp", instanceId: "item2" },
            { actionId: "item_recoverHp", instanceId: "item3" },
        ]
        this.storyFlags = {
            // HAS_TO_SEE_INTRO:true
        }
        const shopInventory = [
          { actionId: "item_recoverHp", instanceId: "item6" },
          { actionId: "item_recoverHp", instanceId: "item7" },
          { actionId: "item_recoverStatus", instanceId: "item8" },
        ]
    }
    addItem(actionId, instanceId,) {
      this.item = {actionId,instanceId}
      this.items.push(this.item)
    }
    addPizza(pizzaId) {
        const newId = `p${Date.now()}`+Math.floor(Math.random() * 99999);
        this.pizzas[newId] = {
          pizzaId,
          hp: 50,
          maxHp: 50,
          xp: 0,
          maxXp: 100,
          level: 1,
          status: null,
        }
        if (this.lineup.length < 3) {
          this.lineup.push(newId)
        }
        utils.emitEvent("LineupChanged");
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