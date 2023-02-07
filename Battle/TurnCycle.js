class TurnCycle {
  constructor({ battle, onNewEvent, onWinner }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.onWinner = onWinner;
    this.currentTeam = "player"; //или "enemy"
  }

  async turn() {
    //получить того кто действует
    const casterId = this.battle.activeCombatants[this.currentTeam];
    const caster = this.battle.combatants[casterId];
    const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"]
    const enemy = this.battle.combatants[enemyId];

    const submission = await this.onNewEvent({
      type: "submissionMenu",
      caster,
      enemy
    })

    //остановиться если меняем пиццу
    if (submission.replacement) {
      await this.onNewEvent({
        type: "replace",
        replacement: submission.replacement
      })
      await this.onNewEvent({
        type: "textMessage",
        text: `Порви их всех, ${submission.replacement.name}!`
      })
      this.nextTurn();
      return;
    }

    if (submission.instanceId) {

      this.battle.usedInstanceIds[submission.instanceId] = true;

      //убрать предметы с боя
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

    //цель умерла?
    const targetDead = submission.target.hp <= 0;
    if (targetDead) {
      await this.onNewEvent({ 
        type: "textMessage", text: `${submission.target.name} закончилась!`
      })

      if (submission.target.team === "enemy") {

        const playerActivePizzaId = this.battle.activeCombatants.player;
        const xp = submission.target.givesXp;

        await this.onNewEvent({
          type: "textMessage",
          text: `Получено ${xp} опыта!`
        })
        await this.onNewEvent({
          type: "giveXp",
          xp,
          combatant: this.battle.combatants[playerActivePizzaId]
        })
      }
    }

    //у нас есть победитель?
      let winner = this.getWinningTeam();
      if(winner) {
        if(winner == "player"){
          await this.onNewEvent({
            type:"textMessage",
            text:`Игрок побеждает!`
          })
        }
        else if(winner == "enemy"){
          await this.onNewEvent({
            type:"textMessage",
            text:`${this.battle.enemy.name} побеждает!`
          })
        }
        this.onWinner(winner);
        return;
      }
      
    //цель мертва, но нет победителя, поэтому меняем пиццу на оставшиеся
    if (targetDead) {
      const replacement = await this.onNewEvent({
        type: "replacementMenu",
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


    //проверить на последующие события
    //делают эффекты после хода
    const postEvents = caster.getPostEvents();
    for (let i=0; i < postEvents.length; i++ ) {
      const event = {
        ...postEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target, 
      }
      await this.onNewEvent(event);
    }

    //проверить на конец действия эффекта
    const expiredEvent = caster.decrementStatus();
    if (expiredEvent) {
      await this.onNewEvent(expiredEvent)
    }

    this.nextTurn();
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

    //начать первый ход
    this.turn();

  }

}