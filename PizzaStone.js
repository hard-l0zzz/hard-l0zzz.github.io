class PizzaStone extends GameObject {
    constructor(config) {
      super(config);
      this.sprite = new Sprite({
        gameObject: this,
        // useShadow: false,
        src: "/images/characters/pizza-stone.png",
        useShadow:false,
        animations: {
          "used-down"   : [ [0,0] ],
          "unused-down" : [ [1,0] ],
        },
        currentAnimation: "used-down"
      });
      this.storyFlag = config.storyFlag;
      this.pizzas = config.pizzas;
  


      
      this.talking = [
        {
          required: ["USED_PIZZA_STONE_WOW"],
          events: [
            {type:"textMessage",text:"Вы уже сделали пиццу!"}
          ]
        },
        {
          required: [this.storyFlag],
          events: [
            { type: "textMessage", text: "Вы сделали пиццу." },
            {type:"addStoryFlag", flag:"USED_PIZZA_STONE_WOW"}
          ]
        },
        {
          events: [
            { type: "textMessage", text: "Вы делаете пиццу изо всех сил..." },
            { type: "craftingMenu", pizzas: this.pizzas },
            { type: "addStoryFlag", flag: this.storyFlag },
          ]
        }
      ]
  
    }
  
    update() {
     this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? "used-down"
      : "unused-down";
    }
  
  }