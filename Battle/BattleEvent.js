class BattleEvent{
  constructor(event, battle) {
    this.event = event;
    this.battle = battle;
  }
  
  textMessage(resolve) {

    const text = this.event.text
    .replace("{CASTER}", this.event.caster?.name)
    .replace("{TARGET}", this.event.target?.name)
    .replace("{ACTION}", this.event.action?.name)

    const message = new TextMessage({
      text,
      onComplete: () => {
        resolve();
      }
    })
    message.init( this.battle.element )
  }

  async stateChange(resolve) {
    const {caster, target, damage,recover,status, selfDamage} = this.event;
    let who = this.event.onCaster ? caster : target;
    if (damage) {
      const multiplier = caster.damageMultiplier || 1;
      const calculatedDamage = damage + caster.level * 1.05;
      target.update({
        hp: target.hp - (calculatedDamage * multiplier)
      })
    
      document.getElementById("hitsound1").play();
      //начать моргать пицце после получения урона
      target.pizzaElement.classList.add("battle-damage-blink");
    }
    if(selfDamage){
      let newHp = caster.hp - selfDamage;
      caster.update({
        hp:newHp
      })
    }
    if(recover){
      let newHp = who.hp + recover;
      if(newHp> who.maxHp) {
        newHp = who.maxHp
      }
      who.update({
        hp:newHp
      })
    }

    if (status){
      who.update({
        status: {...status}
      })
    }
    if(status === null){
      who.update({
        status:null
      })
    }

    //немного подождать
    await utils.wait(600)

    //перестать моргать пицце после получения урона
    target.pizzaElement.classList.remove("battle-damage-blink");
    resolve();
  }

  submissionMenu(resolve) {
    const {caster} = this.event;
    const menu = new SubmissionMenu({
      caster: caster,
      enemy: this.event.enemy,
      items: this.battle.items,
      replacements:Object.values(this.battle.combatants).filter(c => {
        return c.id !== caster.id && c.team === caster.team && c.hp > 0
      }),
      onComplete: submission => {
        //что использовать и на кого, само действие
        resolve(submission)
      }
    })
    menu.init( this.battle.element )
  }

  replacementMenu(resolve){
    const menu = new ReplacementMenu({
      replacements: Object.values(this.battle.combatants).filter(c => {
        return c.team === this.event.team && c.hp >0
      }),
      onComplete: replacement => {
        resolve(replacement)
      }
    })
    menu.init(this.battle.element)
  }

  async replace(resolve){
    const {replacement} = this.event;
    const prevCombat = this.battle.combatants[this.battle.activeCombatants[replacement.team]];
    this.battle.activeCombatants[replacement.team] = null;
    prevCombat.update();
    await utils.wait(400);
    this.battle.activeCombatants[replacement.team] = replacement.id;
    replacement.update();
    await utils.wait(400);
    
    resolve();
  }

  giveXp(resolve){
    let amount = this.event.xp;
    const {combatant} = this.event;
    const step = () => {
      if (amount > 0){
        amount -= 1;
        combatant.xp += 1;

        if(combatant.xp === combatant.maxXp) {
          combatant.xp = 0;
          combatant.maxXp = combatant.maxXp + 10;
          combatant.level += 1;
          combatant.maxHp = combatant.maxHp + combatant.level * 20
          combatant.hp = combatant.hp + combatant.level * 10
        }

        combatant.update();
        requestAnimationFrame(step);
        return;
      }
      resolve();
    }
    requestAnimationFrame(step);
  }

  animation(resolve) {
    const fn = BattleAnimations[this.event.animation];
    fn(this.event, resolve);
  }

  init(resolve) {
    this[this.event.type](resolve);
  }
}