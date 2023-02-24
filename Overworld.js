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

        if(!this.map.isPaused){
        requestAnimationFrame(() => {
          step();
        })
      }
      }
      step();
    }


    bindActionInput() {
      new KeyPressListener ("KeyE", () => {
        //проверка рядом ли нпс
        this.map.checkForActionCutscene();
      });
      new KeyPressListener("Escape", () => {
        if(!this.map.isCutscenePlaying){
          this.map.startCutscene([
            {type: "pause"}
          ])
        }
      })
    }

    bindHeroPositioncheck(){
      document.addEventListener("PersonWalkingComplete",e => {
        if(e.detail.whoId === "hero"){
          //позиция игрока поменялась
          // console.log("woo");
          this.map.checkForFootstepCutscene();
        }
      })

    }

    startMap(mapConfig,heroInitialState = null){
      this.map = new OverworldMap(mapConfig);
      this.map.overworld = this;
      this.map.mountObjects();

      if (heroInitialState) {
        const {hero} = this.map.gameObjects;
        hero.x = heroInitialState.x;
        hero.y = heroInitialState.y;
        hero.direction = heroInitialState.direction;
      }

      this.progress.mapId = mapConfig.id;
      this.progress.startingHeroX = this.map.gameObjects.hero.x;
      this.progress.startingHeroY = this.map.gameObjects.hero.y;
      this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
    }


    async init() {

      const container = document.querySelector(".game-container");
      this.progress = new Progress();

      this.titleScreen = new TitleScreen({
        progress: this.progress
      })
      const useSaveFile = await this.titleScreen.init(container)

      let initialHeroState = null;
      if(useSaveFile) {
        this.progress.load();
        initialHeroState = {

          x:this.progress.startingHeroX,
          y:this.progress.startingHeroY,
          direction:this.progress.startingHeroDirection,
        }
      }

      this.startMap(window.OverworldMaps[this.progress.mapId],initialHeroState);
      this.directionInput = new DirectionInput();
      this.directionInput.init();
      this.directionInput.direction;
      this.bindActionInput();
      this.bindHeroPositioncheck();
      this.startGameLoop();
      // let audio = document.getElementById("myaudio")
      // audio.volume = 0;
      // audio.play();
      // let interval = setInterval(function() {
      //   if(audio.volume < 0.12) {
      //     audio.volume += 0.01;
      //   } else {
      //     clearInterval(interval);
      //   }
      // },3500)
  }
}