class Box extends GameObject {
    constructor(config) {
      super(config);
      this.sprite = new Sprite({
        gameObject: this,
        src: "/images/characters/box.png",
        // animations: {
        //   "used-down"   : [ [0,0] ],
        //   "unused-down" : [ [1,0] ],
        // },
        // currentAnimation: "used-down"
      });
      this.storyFlag = config.storyFlag;
      this.items = config.items
  


      
      this.talking = [
        {
          required: [this.storyFlag],
          events: [
            { type: "textMessage", text: "Уже использовано." },
          ]
        },
        {
          events: [
            { type: "textMessage", text: "Вы видите коробку." },
            { type: "textMessage", text: "В ней есть штуки!" },
            { type: "lootMenu", items:this.items },
            { type: "addStoryFlag", flag: this.storyFlag },
          ]
        }
      ]
  
    }
  
    // update() {
    //  this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
    //   ? "used-down"
    //   : "unused-down";
    // }
  
  }