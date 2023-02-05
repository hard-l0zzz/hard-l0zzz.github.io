class GameObject {
    constructor(config) {
      this.id = null;
      this.isMounted = false;
      this.x = config.x || 0;
      this.y = config.y || 0;
      this.direction = config.direction || "down";
      this.sprite = new Sprite({
        gameObject: this,
        src: config.src || "/images/characters/people/hero.png",
      });
  
      //начало запуска карты
      this.behaviorLoop = config.behaviorLoop || [];
      this.behaviorLoopIndex = 0;
      this.talking = config.talking || [];
      this.retryTimeout = null;
    }
  
    mount(map) {
      this.isMounted = true;
  
      //если есть поведение, начать его после задержки
      setTimeout(() => {
        this.doBehaviorEvent(map);
      }, 10)
    }
  
    update() {
    }
  
    async doBehaviorEvent(map) { 
  
      //ничего не делать если нет поведения
      if (this.behaviorLoop.length === 0) {
        return;  
      }
  
      if (map.isCutscenePlaying) {
  
        //console.log("заново", this.id)
        if (this.retryTimeout) {
          clearTimeout(this.retryTimeout);
        }
        this.retryTimeout = setTimeout(() => {
          this.doBehaviorEvent(map);
        }, 500)
        return;
      }
  
  
      //подготовка для ивента
      let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
      eventConfig.who = this.id;
  
      const eventHandler = new OverworldEvent({ map, event: eventConfig });
      await eventHandler.init(); 
  
      //подготовка следующего ивента к запуску
      this.behaviorLoopIndex += 1;
      if (this.behaviorLoopIndex === this.behaviorLoop.length) {
        this.behaviorLoopIndex = 0;
      } 
  
      //сделать еще раз
      this.doBehaviorEvent(map);
      
  
    }
  
  
  }