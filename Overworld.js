class Overworld {
    constructor(config) {
      this.element = config.element;
      this.canvas = this.element.querySelector(".game-canvas");
      this.ctx = this.canvas.getContext("2d");
      this.map = null;
    }
   
    gameLoopStepWork(delta) {
      //Clear off the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
   
      //Establish the camera person
      const cameraPerson = this.map.gameObjects.hero;
   
      //Update all objects
      Object.values(this.map.gameObjects).forEach(object => {
        object.update({
          delta,
          arrow: this.directionInput.direction,
          map: this.map,
        })
      })
   
      //Draw Lower layer
      this.map.drawLowerImage(this.ctx, cameraPerson);
   
      //Draw Game Objects
      Object.values(this.map.gameObjects).sort((a,b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.sprite.draw(this.ctx, cameraPerson);
      })
   
      //Draw Upper layer
      this.map.drawUpperImage(this.ctx, cameraPerson);
    }
   
     startGameLoop() {
       let previousMs;
       const step = 1 / 120;
   
       const stepFn = (timestampMs) => {
         // Stop here if paused
         if (this.map.isPaused) {
           return;
         }
         if (previousMs === undefined) {
           previousMs = timestampMs;
         }
   
         let delta = (timestampMs - previousMs) / 1000;
         while (delta >= step) {
           this.gameLoopStepWork(delta);
           delta -= step;
         }
         previousMs = timestampMs - delta * 1000; // Make sure we don't lose unprocessed (delta) time
   
         // Business as usual tick
         requestAnimationFrame(stepFn)
       }
   
       // First tick
       requestAnimationFrame(stepFn)
    }

    bindActionInput() {
      new KeyPressListener ("KeyE", () => {
        if(!this.map.isCutscenePlaying){
        this.map.checkForActionCutscene();
        }
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
  }
}