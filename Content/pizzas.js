window.PizzaTypes = {
  normal: "normal",
  spicy: "spicy",
  veggie: "veggie",
  fungi: "fungi",
  chill: "chill",
  fire:"fire",
}

window.Pizzas = {
  "s001": {
    name: "Пицца пеперони",
    type: PizzaTypes.spicy,
    description:"Классика",
    src: "/images/characters/pizzas/s001.png",
    icon: "/images/icons/spicy.png",
    actions:["damage1","saucyStatus","clumsyStatus"]
  },
  "jackp":{
    name:"ДаблДжек",
    type:PizzaTypes.chill,
    description:"Пицца Джека, которую вы получили в качестве благодарности.",
    src:"/images/characters/pizzas/jackp.png",
    icon:"/images/icons/chill.png",
    actions:["jackAttack","pumpkinSauce"]
  },
  "dadp1":{
    name:`Легендарная "Пицца Купперов"`,
    type:PizzaTypes.fire,
    description:"Та самая пицца, выполненная во всех традициях Купперов!",
    src:"/images/characters/pizzas/coop.png",
    icon:"images/icons/fire.png",
    actions:["fireAttack","dragonRest","fireBlast"]
  },
  "dadp2":{
    name:`Запасная "Пицца Купперов"`,
    type:PizzaTypes.spicy,
    description:"На всякий случай.",
    src:"/images/characters/pizzas/s003.png",
    icon:"/images/icons/spicy.png",
    actions:["damage1","saucyStatus","clumsyStatus"]
  },
  "nedotepa":{
    name: `Неудачная "Пицца Купперов"`,
    type:PizzaTypes.spicy,
    description:"Полный крах...Но это всё, на что вы способны.",
    src:"/images/characters/pizzas/v001.png",
    icon:"/images/icons/chill.png",
    actions:["damage2","clumsyStatus2"]
  },
  "s002": {
    name: "Пицца с беконом",
    description:"Эпичный бекон, солёное буйство!",
    type: PizzaTypes.spicy,
    src: "/images/characters/pizzas/s002.png",
    icon: "/images/icons/spicy.png",
    actions:["damage1","clumsyStatus","saucyStatus",]
  },
  "v001": {
    name: "Пицца с огурчиками",
    description:"Морской бриз и свежесть зелёности!",
    type: PizzaTypes.veggie,
    src: "/images/characters/pizzas/v001.png",
    icon: "/images/icons/veggie.png",
    actions:["damage1","clumsyStatus","item_recoverHp1"]
  },
  "f001": {
    name: "Портобелло Экспресс",
    description:"Быстрота и невероятность изменений!",
    type: PizzaTypes.veggie,
    src: "/images/characters/pizzas/v003.png",
    icon: "/images/icons/veggie.png",
    actions:["damage1","clumsyStatus","item_recoverHp1"]
  },
  "stepalox": {
    name: "Степа Лошара",
    type: PizzaTypes.fungi,
    src: "/images/characters/pizzas/v001.png",
    icon: "/images/icons/veggie.png",
    actions:["suicide","damage1","damage1","damage1"]
  }
}