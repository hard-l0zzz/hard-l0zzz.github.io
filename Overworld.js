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
        
        //нижнее изображение
        this.map.drawLowerImage(this.ctx);

        //объекты
        Object.values(this.map.gameObjects).forEach(object => {
          object.update({
          arrow: this.directionInput.direction,
          map: this.map
          })
          object.sprite.draw(this.ctx);
        })


        //верхнее изображение
        this.map.drawUpperImage(this.ctx);
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
  }
}