class GameObject{
    constructor(config){
        this.id = null
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.direction = config.direction || "up";
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "/images/characters/people/hero.png",
            
        });

        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;

        this.talking = config.talking || [];


    }

    mount(map){
        this.isMounted = true;


        setTimeout(() => {
            this.doBehaviorEvent(map);
        },10)
    }



    update() {

    }

    async doBehaviorEvent(map){
        if(map.isCutscenePlaying || this.behaviorLoop.length === 0){
            return;
        }

        if(map.isCutscenePlaying){

            if(this.retryTimeout){
                clearTimeout(this.retryTimeout);
            }
            this.retryTimeout = setTimeout(() => {
                this.doBehaviorEvent(map);
            },100)
            return;
        }



        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;
        const eventHandler = new OverworldEvent({map, event: eventConfig});
        await eventHandler.init();
        //чтоб следующий ивент запускался
        this.behaviorLoopIndex += 1;
        if (this.behaviorLoopIndex === this.behaviorLoop.length){
            this.behaviorLoopIndex = 0;
        }
        this.doBehaviorEvent(map);

    }



}