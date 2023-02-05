class OverworldMap{
    constructor(config) {
        this.overworld = null;
        this.gameObjects = {};
        this.configObjects = config.configObjects;
        this.walls = config.walls || {};
        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;
        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;
        this.isCutscenePlaying = false;
        this.cutsceneSpaces = config.cutsceneSpaces || {};
        this.isPaused = false;
        this.retryTimeout = null;
    }

    drawLowerImage(ctx,cameraPerson){
        ctx.drawImage(this.lowerImage,
        utils.withGrid(10) - cameraPerson.x,
        utils.withGrid(6) - cameraPerson.y)
    }

    drawUpperImage(ctx,cameraPerson) {
        ctx.drawImage(this.upperImage,
        utils.withGrid(10) - cameraPerson.x,
        utils.withGrid(6) - cameraPerson.y)
    }

    isSpaceTaken(currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX,currentY,direction)
        if(this.walls[`${x},${y}`]) {
            return true;
        }
        return Object.values(this.gameObjects).find(obj => {
            if(obj.x === x && obj.y === y) {return true;}
            if(obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y)
            return true;
        })
    }

    mountObjects(){
        Object.keys(this.configObjects).forEach(key => {
            let object = this.configObjects[key];
            object.id = key;

            let instance;
            if(object.type === "Person"){
                instance = new Person(object);
            }
            if(object.type === "PizzaStone"){
                instance = new PizzaStone(object);
            }
            if(object.type === "Box"){
                instance = new Box(object);
            }
            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;
            instance.mount(this);
        })
    }

    async startCutscene(events){
        this.isCutscenePlaying = true;

        for(let i = 0; i < events.length; i++ ){
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this
            })
            const result = await eventHandler.init();
            if(result === "LOST_BATTLE"){
                break;
            }
        }

        this.isCutscenePlaying = false;
                //ресет поведения нпс
                //Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
    }

    checkForActionCutscene(){
        const hero = this.gameObjects["hero"];
        const nextCoords = utils.nextPosition(hero.x,hero.y,hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        });
        if(!this.isCutscenePlaying && match && match.talking.length) {

            const relevantScenario = match.talking.find(scenario => {
                return(scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })

            relevantScenario && this.startCutscene(relevantScenario.events)
        }
    }



    checkForFootstepCutscene(){
        const hero = this.gameObjects["hero"];
        const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
        if(!this.isCutscenePlaying && match){
            this.startCutscene(match[0].events);
        }
    }
}


window.OverworldMaps = {
    DemoRoom: {
        id:"DemoRoom",
        lowerSrc: "/images/maps/DemoLower.png",
        upperSrc: "/images/maps/DemoUpper.png",
        configObjects: {
            hero: {
            // type:"stand",
            // direction:"up",
            // time:1,
            type: "Person",
            isPlayerControlled: true,
            x:utils.withGrid(5),
            y:utils.withGrid(9)
            },
            /*box: new Person({
                x:utils.withGrid(10),
                y:utils.withGrid(6),
                src:"/images/characters/box.png",
                talking: [{
                    events:[
                        {type:"textMessage",text:"Это коробка"},
                        {type:"textMessage",text:"Взять её?"}
                    ]
                }]
            }),*/
            cat:{
                type: "Person",
                x:utils.withGrid(6),
                y: utils.withGrid(9),
                src:"/images/characters/hero.png",
                behaviorLoop: [
                    {type:"walk", direction: "up"},
                    {type:"walk", direction: "up"},
                    {type:"walk", direction: "left"},
                    {type:"walk", direction: "left"},
                    {type:"walk", direction: "down"},
                    {type:"walk", direction: "down"},
                    {type:"walk", direction: "right"},
                    {type:"walk", direction: "right"},
                ],
                talking: [
                    {
                    required: ["USED_PIZZA_STONE"],
                    events:[
                        {type:"textMessage",text:"Кот:Ого, ты умеешь использовать алтари пицц!"}
                    ]

                    },
                    {
                        events: [
                            {type:"textMessage",text:"Кот:мяу"},
                        ]
                    }
                ]
            },
            npc1:
                {
                type: "Person",
                x:utils.withGrid(3),
                y:utils.withGrid(5),
                src:"/images/characters/people/npc1.png",
                behaviorLoop: [
                    {type:"stand", direction: "left",time: 1200},
                    {type:"stand",direction:"up",time:500},
                    {type:"stand",direction:"down",time:800}
                ],
                talking: [
                    {
                      required: ["TALKED_TO_NPC2"],
                      events:[
                        { type: "textMessage", text: "Бетт:Охранник подозрительный..."},
                        { type: "textMessage", text: "Бетт:Да что я вообще тут делаю??"},
                        ],
                    },
                    {
                        required: ["WAS_IN_KITCHEN"],
                        events:[
                            { type: "textMessage", text:"Бетт:Ну как там на кухне?"}
                        ],
                    },
                    {
                        required: ["DEFEATED_BETH"],
                        events:[
                            { type:"textMessage",text:"Бетт:Ты меня одолел!"}
                        ],
                    },
                    {
                        required:["DEFEATED_BETH2"],
                        events:[
                            { type:"textMessage",text:"Бетт:Всё-таки ты смог меня одолеть в реванше..."}
                        ]
                    },
                    {
                        required: ["LOST_BETH"],
                        events:[
                            { type:"textMessage",text:"Бетт:Хаха!"},
                            { type:"textMessage",text:"Бетт:Одолеть тебя ещё раз?"},
                            { type: "battle", enemyId:"beth"},
                            { type: "addStoryFlag", flag:"DEFEATED_BETH2"},
                        ]
                    },
                    {
                        required: ["USED_PIZZA_STONE"],
                        events:[
                            {type:"textMessage", text:"Бетт:Ого, ты умеешь использовать алтари пицц!"},
                            {type:"removeStoryFlag",flag:"USED_PIZZA_STONE"}
                        ]
                    },
                    {
                      events: [
                        { type: "textMessage", text: "Бетт:Этот кот...",faceHero:"npc1"},
                        { type: "textMessage", text: "Бетт:Он мне не нравится!"},
                        { type: "addStoryFlag", flag:"LOST_BETH"},
                        { type: "battle", enemyId:"beth"},
                        { type: "addStoryFlag", flag:"DEFEATED_BETH"},
                      ]
                    }
                  ]
            },
            npc2:{
                type: "Person",
                x:utils.withGrid(8),
                y:utils.withGrid(5),
                src:"images/characters/people/npc2.png",
                behaviorLoop:[
                    {type:"stand",direction:"down",time:800}
                ],
                talking: [
                    {
                        events:[
                            {type:"textMessage",text:"Охранник:...",faceHero:"npc2"},
                            {type:"addStoryFlag",flag:"TALKED_TO_NPC2"},
                            //{type:"disappear",who:"hero"}
                        ]
                    },
                    {
                        required:["SEEN_INTRO"],
                        events:[
                            {type:"textMessage",text:"Wow"}
                        ]
                    }
                ]
            },
            pizzaStone: {
                type: "PizzaStone",
                x: utils.withGrid(2),
                y: utils.withGrid(7),
                storyFlag: "USED_PIZZA_STONE",
                pizzas: ["v001", "f001"],
              },
            // box: {
            //     type:"Box",
            //     x:utils.withGrid(3),
            //     y:utils.withGrid(8),
            //     items:["item_recoverHp","item_recoverHp"],
            //     storyFlag: "USED_BOX"
            // }
        },
        walls:{
           [utils.asGridCoord(7,7)]:true,
           [utils.asGridCoord(8,7)]:true,
           [utils.asGridCoord(7,8)]:true,
           [utils.asGridCoord(8,8)]:true,
           [utils.asGridCoord(1,3)]:true,
           [utils.asGridCoord(2,3)]:true,
           [utils.asGridCoord(3,4)]:true,
           [utils.asGridCoord(4,4)]:true,
           [utils.asGridCoord(5,3)]:true,
           [utils.asGridCoord(6,4)]:true,
           [utils.asGridCoord(10,3)]:true,
           [utils.asGridCoord(9,3)]:true,
           [utils.asGridCoord(8,4)]:true,
           [utils.asGridCoord(6,3)]:true,
           [utils.asGridCoord(6,2)]:true,
           [utils.asGridCoord(6,1)]:true,
           [utils.asGridCoord(8,1)]:true,
           [utils.asGridCoord(8,2)]:true,
           [utils.asGridCoord(8,3)]:true,
           [utils.asGridCoord(11,4)]:true,
           [utils.asGridCoord(11,5)]:true,
           [utils.asGridCoord(11,6)]:true,
           [utils.asGridCoord(11,7)]:true,
           [utils.asGridCoord(11,8)]:true,
           [utils.asGridCoord(11,9)]:true,
           [utils.asGridCoord(10,10)]:true,
           [utils.asGridCoord(9,10)]:true,
           [utils.asGridCoord(8,10)]:true,
           [utils.asGridCoord(7,10)]:true,
           [utils.asGridCoord(6,10)]:true,
           [utils.asGridCoord(4,10)]:true,
           [utils.asGridCoord(3,10)]:true,
           [utils.asGridCoord(2,10)]:true,
           [utils.asGridCoord(1,10)]:true,
           [utils.asGridCoord(0,9)]:true,
           [utils.asGridCoord(0,8)]:true,
           [utils.asGridCoord(0,7)]:true,
           [utils.asGridCoord(0,6)]:true,
           [utils.asGridCoord(0,5)]:true,
           [utils.asGridCoord(0,4)]:true,
           [utils.asGridCoord(5,11)]:true,
           [utils.asGridCoord(8,7)]:true
        },
        cutsceneSpaces: {
            [utils.asGridCoord(7,4)]:[
                {
                    events:[
                        {who:"npc2",type:"walk",direction:"left"},
                        {who:"npc2",type:"stand",direction:"up",time:500},
                        {type:"textMessage",text:"Охранник:Тебе сюда нельзя."},
                        {who:"npc2",type:"walk",direction:"right"},
                        {who:"hero",type:"walk",direction:"down"},
                        {type:"addStoryFlag",flag:"TALKED_TO_NPC2"}
                    ]
                }
            ],
            // [utils.asGridCoord(5,8)]:[
            //     {
            //         events:[
            //             {type:"addStoryFlag",flag:"HAS_TO_SEE_INTRO"}
            //         ],
            //         required:["HAS_TO_SEE_INTRO"],
            //         events:[
            //             {type:"textMessage", text:"wow"},
            //             {type:"addStoryFlag",flag:"SEEN_INTRO"},
            //             {type:"removeStoryFlag",flag:"HAS_TO_SEE_INTRO"}
            //         ],
            //         required:["SEEN_INTRO"],
            //         events:[
            //             {type:"addStoryFlag",flag:"NOTHING"}
            //         ]
            //     },
            // ],
            // [utils.asGridCoord(5,9)]:[
            //     {
            //     events:[
            //         {type:"textMessage", text:"Однажды вы жили в богатой семье знаменитых на весь мир поваров..."}
            //     ]
            // }
            // ],
            [utils.asGridCoord(5,10)]:[
                {
                    events:[
                        {type:"changeMap",map:"Kitchen",x:utils.withGrid(5),y:utils.withGrid(9),direction:"up"},
                        {type:"addStoryFlag",flag:"WAS_IN_KITCHEN"}
                    ]
                }
            ]
        }
    },
    Kitchen: {
        id:"Kitchen",
        lowerSrc: "/images/maps/KitchenLower.png",
        upperSrc: "/images/maps/KitchenUpper.png",
        configObjects: {
            hero: {
                // type:"stand",
                // direction:"up",
                // time:1,
                type: "Person",
            isPlayerControlled:true,
            // x:utils.withGrid(5),
            // y:utils.withGrid(9)
            },
            npc3: {
                type: "Person",
                x:utils.withGrid(7),
                y:utils.withGrid(5),
                src:"/images/characters/people/npc3.png",
                talking:[
                    {
                        events:[
                            {type:"textMessage",text:"???:Странная эта ящерка...",faceHero:["npc3"]},
                            {who:"npc3",type:"stand",direction:"left"},
                            {type:"textMessage",text:"???:Мне от неё жутко"}
                        ]
                    }
                ],
                behaviorLoop:[
                    {type:"stand", direction:"left",time:200},
                    {type:"stand", direction:"right",time:300}
                ]
            },
                lizard_girl:{
                    type: "Person",
                x:utils.withGrid(4),
                y:utils.withGrid(4),
                src:"images/characters/people/lizard_girl.png",
                behaviorLoop:[
                    {type:"stand",direction:"down",time:800}
                ],
                talking: [
                    {
                        events:[
                            {type:"textMessage",text:"Ящерка: külön"},
                            {type:"textMessage",text:"Ящерка: köszönet"},
                            {type:"battle", enemyId:"lizard"},
                            {type:"changeMap",map:"secret",x:utils.withGrid(0),y:utils.withGrid(15),direction:"up"}
                        ]
                    }
                ]
            },
        },
        cutsceneSpaces: {
            [utils.asGridCoord(5,10)]:[
                {
                    events:[
                        {type:"changeMap",map:"DemoRoom",x:utils.withGrid(5),y:utils.withGrid(9),direction:"up"}
                    ]
                }
            ]
        },
        walls:{
            [utils.asGridCoord(2,4)]:true,
            [utils.asGridCoord(1,4)]:true,
            [utils.asGridCoord(1,3)]:true,
            [utils.asGridCoord(3,4)]:true,
            [utils.asGridCoord(4,3)]:true,
            [utils.asGridCoord(5,4)]:true,
            [utils.asGridCoord(6,4)]:true,
            [utils.asGridCoord(7,4)]:true,
            [utils.asGridCoord(8,4)]:true,
            [utils.asGridCoord(9,3)]:true,
            [utils.asGridCoord(10,3)]:true,
            [utils.asGridCoord(11,5)]:true,
            [utils.asGridCoord(12,5)]:true,
            [utils.asGridCoord(13,5)]:true,
            [utils.asGridCoord(13,6)]:true,
            [utils.asGridCoord(13,7)]:true,
            [utils.asGridCoord(13,8)]:true,
            [utils.asGridCoord(13,9)]:true,
            [utils.asGridCoord(12,10)]:true,
            [utils.asGridCoord(11,10)]:true,
            [utils.asGridCoord(10,10)]:true,
            [utils.asGridCoord(9,10)]:true,
            [utils.asGridCoord(8,10)]:true,
            [utils.asGridCoord(8,10)]:true,
            [utils.asGridCoord(8,10)]:true,
            [utils.asGridCoord(7,10)]:true,
            [utils.asGridCoord(6,10)]:true,
            [utils.asGridCoord(3,10)]:true,
            [utils.asGridCoord(4,10)]:true,
            [utils.asGridCoord(5,11)]:true,
            [utils.asGridCoord(2,10)]:true,
            [utils.asGridCoord(1,10)]:true,
            [utils.asGridCoord(0,9)]:true,
            [utils.asGridCoord(0,8)]:true,
            [utils.asGridCoord(1,7)]:true,
            [utils.asGridCoord(1,6)]:true,
            [utils.asGridCoord(1,5)]:true,
            [utils.asGridCoord(0,8)]:true,
            [utils.asGridCoord(1,9)]:true,
            [utils.asGridCoord(2,9)]:true,
            [utils.asGridCoord(6,7)]:true,
            [utils.asGridCoord(7,7)]:true,
            [utils.asGridCoord(9,7)]:true,
            [utils.asGridCoord(9,9)]:true,
            [utils.asGridCoord(10,9)]:true,
            [utils.asGridCoord(11,4)]:true,
            [utils.asGridCoord(10,7)]:true,
        }  

        
    },
    secret: {
        id:"secret",
        lowerSrc: "/images/maps/EpicSecret.png",
        upperSrc: "/images/maps/KitchenUpper.png",
        configObjects: {
            hero: {
            type: "Person",
            isPlayerControlled:true,
            x:utils.withGrid(5),
            y:utils.withGrid(10)
            },
                lizard_girl:{
                type: "Person",
                x:utils.withGrid(4),
                y:utils.withGrid(4),
                src:"images/characters/people/lizard_girl.png",
                behaviorLoop:[
                    {type:"stand",direction:"down",time:800}
                ],
                talking: [
                    {
                        events:[
                            {type:"textMessage",text:"Ящерка: степа лошара"},
                            {type:"changeMap",map:"Kitchen",x:utils.withGrid(4),y:utils.withGrid(5),direction:"up"}
                        ]
                    }
                ]
            },
            pizzaStone:{
                type:"PizzaStone",
                x:utils.withGrid(42),
                y:utils.withGrid(42),
                storyFlag: "USED_PIZZA_STONE1",
                pizzas: ["stepalox", "stepalox","stepalox"],
              },
        }, 

        
    },
    startZone:{
        id:"startZone",
        lowerSrc: "images/maps/KitchenUpper.png",
        upperSrc: "images/maps/KitchenUpper.png",
        configObjects: {
            hero:{
                type:"Person",
                isPlayerControlled:true,
                x:utils.withGrid(15),
                y:utils.withGrid(15),
                direction:"up"
            },
            hero2:{
                type:"Person",
                x:utils.withGrid(15),
                y:utils.withGrid(10),
                src:"images/characters/people/lizard_girl.png",
                talking:[
                    {
                        events:[
                            {type:"textMessage",text:"???:Тебе, наверное, интересно, как ты сюда попал."},
                        ]
                    }
                ]
            },
        },
        walls:
        {
            // [utils.asGridCoord(15,16)]:true,
            // [utils.asGridCoord(14,15)]:true,
            // [utils.asGridCoord(15,14)]:true,
            // [utils.asGridCoord(16,15)]:true
        }
    },
    street:{
        id:"street",
        lowerSrc:"images/maps/StreetLower.png",
        upperSrc:"images/maps/StreetUpper.png",
        configObjects:{
            hero:{
                isPlayerControlled:true,
                type:"Person",
                direction:"right",
                x:utils.withGrid(6),
                y:utils.withGrid(12)
            },
            npc1:{
                type:"Person",
                src:"/images/characters/people/npc1.png",
                x:utils.withGrid(8),
                y:utils.withGrid(10),
                talking:[
                    {
                        events:[
                            {type:`textMessage`,text:`It's an animal. It is pink. It's doing "Oink" sound.`},
                            {type:`textMessage`,text:`It can eat carrots in minecraft.`},
                            {type:`textMessage`,text:`It has piglet.`},
                            {type:`textMessage`,text:`If you guessed it right, congratulations!`},
                        ]
                    }
                ]
            },
            npc2:{
                type:"Person",
                src:"/images/characters/people/npc2.png",
                x:utils.withGrid(12),
                y:utils.withGrid(10),
                talking:[
                    {
                        events:[
                            {type:`textMessage`,text:`It's an electronic computing device.`},
                            {type:`textMessage`,text:`It can run minecraft.`},
                            {type:`textMessage`,text:`You can bring it with you and it has touchpad.`},
                            {type:`textMessage`,text:`If you guessed it right, congratulations!`},
                        ]
                    }
                ]
            },
            npc3:{
                type:"Person",
                src:"/images/characters/people/npc3.png",
                x:utils.withGrid(14),
                y:utils.withGrid(9),
                talking:[
                    {
                        events:[
                            {type:`textMessage`,text:`Nobody loves to do this.`},
                            {type:`textMessage`,text:`Some teachers may ask students to do it in home.`},
                            {type:`textMessage`,text:`This sentence is a part of it.`},
                            {type:`textMessage`,text:`If you guessed it right, congratulations!`},
                        ]
                    }
                ]
            },
            npc4:{
                type:"Person",
                src:"/images/characters/people/npc4.png",
                x:utils.withGrid(10),
                y:utils.withGrid(10),
                talking:[
                    {
                        events:[
                            {type:`textMessage`,text:`It is a geometric figure.`},
                            {type:`textMessage`,text:`The ancient egyptians built it out of sand.`},
                            {type:`textMessage`,text:`If you guessed it right, congratulations!`},
                        ]
                    }
                ]
            },
            npc5:{
                type:"Person",
                src:"/images/characters/people/npc5.png",
                x:utils.withGrid(15),
                y:utils.withGrid(8),
                talking:[
                    {
                        events:[
                            {type:`textMessage`,text:`It's a part of the answer on 3nd question.`},
                            {type:`textMessage`,text:`You use it to move here.`},
                            {type:`textMessage`,text:`It has buttons and some of them can light.`},
                            {type:`textMessage`,text:`If you guessed it right, congratulations!`},
                        ]
                    }
                ]
            },
            cat:{
                type: "Person",
                x:utils.withGrid(12),
                y: utils.withGrid(18),
                src:"/images/characters/hero.png",
                behaviorLoop: [
                    {type:"walk", direction: "up"},
                    {type:"walk", direction: "up"},
                    {type:"walk", direction: "left"},
                    {type:"walk", direction: "left"},
                    {type:"walk", direction: "down"},
                    {type:"walk", direction: "down"},
                    {type:"walk", direction: "right"},
                    {type:"walk", direction: "right"},
                ],
                talking: [
                    {
                    required: ["USED_PIZZA_STONE"],
                    events:[
                        {type:"textMessage",text:"Кот:Ого, ты умеешь использовать алтари пицц!"}
                    ]

                    },
                    {
                        events: [
                            {type:"textMessage",text:"Кот:мяу"},
                            {type:"battle", enemyId:"cat"},
                        ]
                    }
                ]
            },
        },
        cutsceneSpaces:{
            [utils.asGridCoord(25,5)]:
        [
            {
                events:[
                    {type:"changeMap",map:"streetNorth",direction:"up",x:utils.withGrid(7),y:utils.withGrid(15)}
                ]
            }
        ]
        }
    },
    streetNorth:{
        id:"streetNorth",
        lowerSrc:"/images/maps/StreetNorthLower.png",
        upperSrc:"/images/maps/StreetNorthUpper.png",
        configObjects:{
            hero:{
                type:"Person",
                isPlayerControlled:true,
                direction:"up"
            }
        }
    }
}