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


    bindActionInput() {
      new KeyPressListener ("KeyE", () => {
        //проверка рядом ли нпс
        this.map.checkForActionCutscene();
      });
    }

    bindHeroPositioncheck(){
      document.addEventListener("PersonWalkingComplete",e => {
        if(e.detail.whoId === "hero"){
          //позиция игрока поменялась
          console.log("woo");
          this.map.checkForFootstepCutscene();
        }
      })

    }

    startMap(mapConfig){
      this.map = new OverworldMap(mapConfig);
      this.map.overworld = this;
      this.map.mountObjects();
    }


    init() {
      this.startMap(window.OverworldMaps.DemoRoom);
      this.directionInput = new DirectionInput();
      this.directionInput.init();
      this.directionInput.direction;
      this.bindActionInput();
      this.bindHeroPositioncheck();
      this.startGameLoop();

      // this.map.startCutscene([
      //   {type:"battle", enemyId:"beth"}
      // ])
  }
}