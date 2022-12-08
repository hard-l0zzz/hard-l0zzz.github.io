class OverworldEvent{
    constructor({map, event}){
        this.map = map;
        this.event = event;
    }
    stand(resolve){
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map:this.map
        },{
            type:"stand",
            direction: this.event.direction,
            time: this.event.time
        })
        const completeHandler = e => {
            if(e.detail.whoId === this.event.who){
                document.removeEventListener("PersonStandingComplete",completeHandler);
                resolve()
            }
        }
        document.addEventListener("PersonStandingComplete", completeHandler)
    }
    walk(resolve){
        const who = this.map.gameObjects[this.event.who];
        who.startBehavior({
            map:this.map
        },{
            type:"walk",
            direction: this.event.direction,
            retry:true
        })
        const completeHandler = e => {
            if(e.detail.whoId === this.event.who){
                document.removeEventListener("PersonWalkingComplete",completeHandler);
                resolve()
            }
        }
        document.addEventListener("PersonWalkingComplete", completeHandler)
    }

    textMessage(resolve){
        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve()
          })
        message.init(document.querySelector(".game-container"))
    }


    init(){
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }
}