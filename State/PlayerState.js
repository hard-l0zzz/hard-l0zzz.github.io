class PlayerState {
    constructor() {
        this.pizzas = {
          "dadp1":{
            pizzaId:"dadp1",
            hp: 100,
            maxHp: 100,
            xp: 0,
            maxXp: 100,
            level: 1,
            status: null
        },
        }
        this.lineup = ["dadp1"];
        this.items = [
            { actionId: "item_recoverHp", instanceId: "item1" },
            { actionId: "item_recoverHp", instanceId: "item2" },
            { actionId: "item_recoverHp", instanceId: "item3" },
        ]
        this.storyFlags = {

        }
    }
    addItem(actionId, instanceId,) {
      this.item = {actionId,instanceId}
      this.items.push(this.item)
    }
    addPizza(pizzaId) {
        const newId = `p${Date.now()}`+Math.floor(Math.random() * 99999);
        this.pizzas[newId] = {
          pizzaId,
          hp: 75,
          maxHp: 75,
          xp: 0,
          maxXp: 100,
          level: 1,
          status: null,
        }
        if (this.lineup.length < 5) {
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