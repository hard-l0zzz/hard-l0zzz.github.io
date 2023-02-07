class SubmissionMenu { 
  constructor({ caster, enemy, onComplete, items, replacements }) {
    this.caster = caster;
    this.enemy = enemy;
    this.replacements = replacements;
    this.onComplete = onComplete;

    let quantityMap = {};
    items.forEach(item => {
      if (item.team === caster.team) {
        let existing = quantityMap[item.actionId];
        if (existing) {
          existing.quantity += 1;
        } else {
          quantityMap[item.actionId] = {
            actionId: item.actionId,
            quantity: 1,
            instanceId: item.instanceId,
          }
       }
      }
    })
    this.items = Object.values(quantityMap);
  }

  getPages() {

    const backOption = {
      label: "Назад",
      description: "Вернуться на прошлую страницу",
      handler: () => {
        this.keyboardMenu.setOptions(this.getPages().root)
      }
    };

    return {
      root: [
        {
          label: "Атаковать",
          description: "Выбрать вид атаки",
          handler: () => {
            //делать что-то после выбора
            this.keyboardMenu.setOptions( this.getPages().attacks )
          }
        },
        {
          label: "Предметы",
          description: "Выбрать предмет",
          handler: () => {
            //перейти на страницу с предметами
            this.keyboardMenu.setOptions( this.getPages().items )
          }
        },
        {
          label: "Поменять пиццу",
          description: "Поменять пиццу",
          handler: () => { 
            this.keyboardMenu.setOptions(this.getPages().replacements)
            //посмотреть варианты для смены пиццы
          }
        },
      ],
      attacks: [
        ...this.caster.actions.map(key => {
          const action = Actions[key];
          return {
            label: action.name,
            description: action.description,
            handler: () => {
              this.menuSubmit(action)
            }
          }
        }),
        backOption
      ],
      items: [
        ...this.items.map(item => {
          const action = Actions[item.actionId];
          return {
            label: action.name,
            description: action.description,
            right: () => {
              return "x"+item.quantity;
            },
            handler: () => {
              this.menuSubmit(action, item.instanceId)
            }
          }
        }),
        backOption
      ],
      replacements: [
        ...this.replacements.map(replacement => {
          return {
            label: replacement.name,
            description: replacement.description,
            handler: () => {
              //поменять пиццу
              this.menuSubmitReplacement(replacement)
            }
          }
        }),
        backOption
      ]
    }
  }
  
  menuSubmitReplacement(replacement) {
    this.keyboardMenu?.end();
    this.onComplete({
      replacement
    })
  }

  menuSubmit(action, instanceId=null) {

    this.keyboardMenu?.end();

    this.onComplete({
      action,
      target: action.targetType === "friendly" ? this.caster : this.enemy,
      instanceId
    })
  }

  decide() {
    let who = this.caster;
    if(this.enemy.status?.type == "Масло")
    {
      this.menuSubmit(Actions[this.caster.actions[0]]);
      // if(utils.getRandomInt(100) >= 50){

      // }
      // else if(who.hp <= who.maxHp && who.status?.type != "Соус"){
      //   this.menuSubmit(Actions[this.caster.actions[2]]);
      // }
    }
    if(who.hp <= who.maxHp * 0.33 && who.status?.type != "Соус")
    {
      this.menuSubmit(Actions[ this.caster.actions[2]]);
    }
    if(who.hp <= who.maxHp && who.status?.type != "Соус")
    {
      this.menuSubmit(Actions[ this.caster.actions[utils.getRandomInt(2)]]);
    }
    else
    {
      this.menuSubmit(Actions[ this.caster.actions[utils.getRandomInt(2)]]);
    }
  }

  showMenu(container) {
    this.keyboardMenu = new KeyboardMenu();
    this.keyboardMenu.init(container);
    this.keyboardMenu.setOptions( this.getPages().root )
  }

  init(container) {

    if (this.caster.isPlayerControlled) {
      //показать интерфейс
      this.showMenu(container)
    } else {
      this.decide()
    }
  }
}