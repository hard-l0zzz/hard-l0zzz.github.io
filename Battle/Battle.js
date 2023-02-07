class Battle {
  constructor({enemy, onComplete}) {
    this.enemy = enemy;
    this.onComplete = onComplete;
    this.combatants = {
    }

    this.activeCombatants = {
      player: null,
      enemy: null,
    }

    //Добавить команду игрока
    window.playerState.lineup.forEach(id => {
      this.addCombatant(id, "player", window.playerState.pizzas[id])
    }); 

    Object.keys(this.enemy.pizzas).forEach(key => {
      this.addCombatant("e_"+key, "enemy", this.enemy.pizzas[key])
    })

    
    //Начинать с 0 предметами
    this.items = []

    //Добавить предметы
    window.playerState.items.forEach(item => {
      this.items.push({
        ...item,
        team: "player"
      })
    })

    this.usedInstanceIds = {};
  }
  addCombatant(id,team, config){
    this.combatants[id] = new Combatant({
      ...Pizzas[config.pizzaId],
      ...Actions[config.actionId],
      ...config,
      team,
      isPlayerControlled: team === "player"
    },this)
    this.activeCombatants[team] = this.activeCombatants[team] || id
  }
  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("Battle");
    this.element.innerHTML = (`
    <div class="Battle_hero">
      <img src="${'/images/characters/people/hero.png'}" alt="Hero" />
    </div>
    <div class="Battle_enemy">
      <img src=${this.enemy.src} alt=${this.enemy.name} />
    </div>
    `)
  }

  init(container) {
    if(myaudio.paused == false){
      document.getElementById("myaudio").pause();
    }
    document.getElementById("battleaudio").play();
    document.getElementById("battleaudio").volume = 0.12;
    this.createElement();
    container.appendChild(this.element);

    Object.keys(this.combatants).forEach(key => {
      let combatant = this.combatants[key];
      combatant.id = key;
      combatant.init(this.element)
    })
    this.turnCycle = new TurnCycle({
      battle:this,
      onNewEvent: event => {
        return new Promise(resolve => {
          const battleEvent = new BattleEvent(event,this)
          battleEvent.init(resolve);
        })
      },
      onWinner: winner => {
        if(winner === "player"){
          const playerState = window.playerState;
          Object.keys(playerState.pizzas).forEach(id => {
            const playerStatePizza = playerState.pizzas[id];
            const combatant = this.combatants[id];
            if(combatant) {
              playerStatePizza.hp = combatant.hp;
              playerStatePizza.xp = combatant.xp;
              playerStatePizza.maxXp = combatant.maxXp;
              playerStatePizza.level = combatant.level;
            }
          })
          //Удалить использованные игроком предметы
          playerState.items = playerState.items.filter(item => {
            return !this.usedInstanceIds[item.instanceId]
          })
        }
        this.element.remove();
        this.onComplete(winner === "player");
        if(myaudio.paused == true){
          document.getElementById("myaudio").play();
        }
        document.getElementById("battleaudio").pause();
      }
    })
    this.turnCycle.init();
  }

}