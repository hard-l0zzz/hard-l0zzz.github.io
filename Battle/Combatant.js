class Combatant {
  constructor(config, battle) {
    Object.keys(config).forEach(key => {
      this[key] = config[key];
    })
    this.hp = typeof(this.hp) === "undefined" ? this.maxHp : this.hp
    this.battle = battle;
  }

  get hpPercent() {
    const percent = this.hp / this.maxHp * 100;
    return percent > 0 ? percent : 0;
  }

  get xpPercent() {
    return this.xp / this.maxXp * 100;
  }

  get isActive() {
    return this.battle.activeCombatants[this.team] === this.id;
  }

  get givesXp(){
    return this.level * 20;
  }

  createElement() {
    this.hudElement = document.createElement("div");
    this.hudElement.classList.add("Combatant");
    this.hudElement.setAttribute("data-combatant", this.id);
    this.hudElement.setAttribute("data-team", this.team);
    this.hudElement.innerHTML = (`
      <p class="Combatant_name">${this.name}</p>
      <p class="Combatant_level"></p>
      <div class="Combatant_character_crop">
        <img class="Combatant_character" alt="${this.name}" src="${this.src}" />
      </div>
      <img class="Combatant_type" src="${this.icon}" alt="${this.type}" />
      <svg viewBox="0 0 26 3" class="Combatant_life-container">
        <rect x=0 y=0 width="0%" height=1 fill="#82ff71" />
        <rect x=0 y=1 width="0%" height=2 fill="#3ef126" />
      </svg>
      <svg viewBox="0 0 26 2" class="Combatant_xp-container">
        <rect x=0 y=0 width="0%" height=1 fill="#ffd76a" />
        <rect x=0 y=1 width="0%" height=1 fill="#ffc934" />
      </svg>
      <p class="Combatant_status"></p>
    `);

    this.pizzaElement = document.createElement("img");
    this.pizzaElement.classList.add("Pizza");
    this.pizzaElement.setAttribute("src", this.src );
    this.pizzaElement.setAttribute("alt", this.name );
    this.pizzaElement.setAttribute("data-team", this.team );

    this.hpFills = this.hudElement.querySelectorAll(".Combatant_life-container > rect");
    this.xpFills = this.hudElement.querySelectorAll(".Combatant_xp-container > rect");
  }

  update(changes={}) {
    //обновлять всё что будет
    Object.keys(changes).forEach(key => {
      this[key] = changes[key]
    });

    this.hudElement.setAttribute("data-active", this.isActive);
    this.pizzaElement.setAttribute("data-active", this.isActive);

    //обновлять проценты хп и опыта для отображения на полосках
    this.hpFills.forEach(rect => rect.style.width = `${this.hpPercent}%`)
    this.xpFills.forEach(rect => rect.style.width = `${this.xpPercent}%`)

    //обновлять лвл на экране
    this.hudElement.querySelector(".Combatant_level").innerText = this.level;

    //обновление статуса
    const statusElement = this.hudElement.querySelector(".Combatant_status");
    if (this.status){
      statusElement.innerText = this.status.type;
      statusElement.style.display = "block";
    } else {
      statusElement.innerText = "";
      statusElement.style.display = "none";
    }

  }

  getReplacedEvents(originalEvents){
    if(this.status?.type === "Масло" && utils.getRandomInt(100) > 77){
      return [
        {type:"textMessage", text:`${this.name} падает!`},
      ]
    }


    return(originalEvents)
  }

  getPostEvents() {
    if (this.status?.type === "Соус") {
      this.status.name = "Соус"
      return [
        {type:"textMessage",text:"Чувствуется соус!"},
        {type:"stateChange",recover:7,onCaster:true}
      ]
    }
    if (this.status?.type === "Тыква") {
      this.status.name = "Тыква"
      return [
        {type:"textMessage",text:"Тыковка!"},
        {type:"stateChange",recover:22, onCaster:true},
      ]
    }
    if (this.status?.type === "Огонь") {
      return [
        {type:"textMessage",text:"Что-то жарится!"},
        {type:"stateChange",recover:-10, onCaster:true}
      ]
    }
    if (this.status?.type === "Соусотечение") {
      return [
        {type:"textMessage",text:"Чувствуются грибы!"},
        {type:"stateChange",recover:-15, onCaster:true}
      ]
    }
    return[];
  }

  decrementStatus(){
    let statusName = null;
    if (this.status?.expiresIn > 0) {
      this.status.expiresIn -= 1;
      if(this.status.expiresIn === 0) 
      {
        this.update({
          status:null
        });
        return{
            type:"textMessage",
            text:`Эффект у ${this.name} кончился!`
        }
      }
    }
  }
  
  
  

  init(container) {
    this.createElement();
    container.appendChild(this.hudElement);
    container.appendChild(this.pizzaElement);
    this.update();
  }

}