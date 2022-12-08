class Overworld {
    constructor(config) {
      this.element = config.element;
      this.canvas = this.element.querySelector(".game-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.map = null;
    }
   

    startGameLoop(){
      const step = () => {

        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        
        const cameraPerson = this.map.gameObjects.hero;



        //нижнее изображение
        this.map.drawLowerImage(this.ctx,cameraPerson);

        //объекты
        Object.values(this.map.gameObjects).sort((a,b) => {
          return a.y - b.y;
        }).
          forEach(object => {
          object.update({
          arrow: this.directionInput.direction,
          map: this.map
          })
          object.sprite.draw(this.ctx,cameraPerson);
        })


        //верхнее изображение
        this.map.drawUpperImage(this.ctx, cameraPerson);
        requestAnimationFrame(() => {
          step();
        })
      }
      step();
    }


    init() {
      this.directionInput = new DirectionInput();
      this.directionInput.init();
      this.directionInput.direction;
      this.map = new OverworldMap(window.OverworldMaps.DemoRoom);
      this.map.mountObjects();
      this.startGameLoop();
      this.map.startCutScene([
        {who:"hero", type: "walk", direction:"down"},
        {who:"npc1", type: "walk", direction:"down"},
        {who:"hero", type: "walk", direction:"left"},
        {who:"cat", type: "walk", direction:"left"},
        {who:"npc1", type: "walk", direction:"right"}
      ])
  }
}