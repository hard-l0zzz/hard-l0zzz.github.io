window.PizzaTypes = {
  normal: "normal",
  spicy: "spicy",
  veggie: "veggie",
  fungi: "fungi",
  chill: "chill",
}

window.Pizzas = {
  "s001": {
    name: "Пицца пеперони",
    type: PizzaTypes.spicy,
    description:"Классика",
    src: "/images/characters/pizzas/s001.png",
    icon: "/images/icons/spicy.png",
    actions:["nothing","damage1","clumsyStatus","saucyStatus"]
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
    src: "/images/characters/pizzas/stepalox2.png",
    icon: "/images/icons/veggie.png",
    actions:["suicide","damage1","damage1","damage1"]
  }
}