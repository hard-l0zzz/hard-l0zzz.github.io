class TurnCycle {
    constructor({ battle, onNewEvent, onWinner }) {
      this.battle = battle;
      this.onNewEvent = onNewEvent;
      this.onWinner = onWinner;
      this.currentTeam = "player"; //or "enemy"
    }
  
    async turn() {
      //Get the caster
      const casterId = this.battle.activeCombatants[this.currentTeam];
      const caster = this.battle.combatants[casterId];
      const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"]
      const enemy = this.battle.combatants[enemyId];
  
      const submission = await this.onNewEvent({
        type: "submissionMenu",
        caster,
        enemy
      })

      if (submission.replacement) {
        await this.onNewEvent({
          type:"replace",
          replacement: submission.replacement
        })
        await this.onNewEvent({
          type:"textMessage",text:`Порви их всех, ${submission.replacement.name}!`
        })
        this.nextTurn();
        return;
      }

      if (submission.instanceId) {

        //Add to list to persist to player state later
        this.battle.usedInstanceIds[submission.instanceId] = true;
  
        //Removing item from battle state
        this.battle.items = this.battle.items.filter(i => i.instanceId !== submission.instanceId)
      }

      const resultingEvents = caster.getReplacedEvents(submission.action.success);
      
      for (let i=0; i<resultingEvents.length; i++) {
        const event = {
          ...resultingEvents[i],
          submission,
          action: submission.action,
          caster,
          target: submission.target,
        }
        await this.onNewEvent(event);
      }
      
      const targetDead = submission.target.hp <= 0;
      if(targetDead) {
        await this.onNewEvent({
          type:"textMessage", text: `${submission.target.name} закончилась!`
        })

        if(submission.target.team === "enemy"){

          const playerActivePizzaId = this.battle.activeCombatants.player;
          const xp = submission.target.givesXp;
          await this.onNewEvent({
            type:"textMessage",
            text:`Получено ${xp} опыта!`
          })
          await this.onNewEvent({
            type:"giveXp",
            xp,
            //combatant:this.caster
            combatant:this.battle.combatants[playerActivePizzaId]
        })
      }
    }

      let winner = this.getWinningTeam();
      if(winner) {
        if(winner == "player"){
          winner = "Игрок"
        }
        else if(winner == "enemy"){
          winner = this.battle.enemy.name
        }
        await this.onNewEvent({
          type:"textMessage",
          text:`${winner} побеждает!`
        })
        this.onWinner(winner);
        return;
      }


      if(targetDead) {
        const replacement = await this.onNewEvent({
          type:"replacementMenu",
          team: submission.target.team
        })
        await this.onNewEvent({
          type:"replace",
          replacement: replacement
        })
        if (utils.getRandomInt(3) >= 1){
          await this.onNewEvent({
            type:"textMessage",
            text:`${replacement.name} появляется!`
          })
        }
        else{
          await this.onNewEvent({
            type:"textMessage",
            text:`${replacement.name} врывается!`
          })
        }
      }


      //проверка ивентов
      //делать штуки после хода
      const postEvents = caster.getPostEvents();
      for (let i = 0; i< postEvents.length; i++) {
        const event  = {
          ...postEvents[i],
          submission,
          action: submission.action,
          caster,
          target:submission.target
        }
        await this.onNewEvent(event);
      }

      //проверка на окончание эффекта
      const expiredEvent = caster.decrementStatus();
      if (expiredEvent) {
        await this.onNewEvent(expiredEvent)
      }


      this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
      this.turn();
  
    }
  
    nextTurn() {
      this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
      this.turn();
    }

    getWinningTeam() {
      let aliveTeams = {};
      Object.values(this.battle.combatants).forEach(c => {
        if (c.hp > 0) {
          aliveTeams[c.team] = true;
        }
      })
      if (!aliveTeams["player"]) { return "enemy"}
      if (!aliveTeams["enemy"]) { return "player"}
      return null;
    }

    async init() {
      await this.onNewEvent({
        type: "textMessage",
        text: `Битва с ${this.battle.enemy.name} начинается!`
      })
      
  
      //Start the first turn!
      this.turn();
  
    }
  
  }