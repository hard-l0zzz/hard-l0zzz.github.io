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
    actions:["damage1","clumsyStatus","saucyStatus","mushStatus"]
  },
  "s002": {
    name: "Пицца с беконом",
    description:"Эпичный бекон, солёное буйство!",
    type: PizzaTypes.spicy,
    src: "/images/characters/pizzas/s002.png",
    icon: "/images/icons/spicy.png",
    actions:["damage1","clumsyStatus","saucyStatus"]
  },
  "v001": {
    name: "Пицца с огурчиками",
    type: PizzaTypes.veggie,
    src: "/images/characters/pizzas/v001.png",
    icon: "/images/icons/veggie.png",
    actions:["damage1","clumsyStatus","saucyStatus"]
  },
  "f001": {
    name: "Portobello Express",
    type: PizzaTypes.fungi,
    src: "/images/characters/pizzas/f001.png",
    icon: "/images/icons/fungi.png",
    actions:["damage1"]
  }
}