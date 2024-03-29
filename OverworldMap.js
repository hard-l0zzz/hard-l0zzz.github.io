class OverworldMap {
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

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(this.lowerImage,
            utils.withGrid(10) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y)
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(this.upperImage,
            utils.withGrid(10) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y)
    }

    isSpaceTaken(currentX, currentY, direction) {
        const { x, y } = utils.nextPosition(currentX, currentY, direction)
        if (this.walls[`${x},${y}`]) {
            return true;
        }
        return Object.values(this.gameObjects).find(obj => {
            if (obj.x === x && obj.y === y) { return true; }
            if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y)
                return true;
        })
    }

    mountObjects() {
        Object.keys(this.configObjects).forEach(key => {
            let object = this.configObjects[key];
            object.id = key;

            let instance;
            if (object.type === "Person") {
                instance = new Person(object);
            }
            if (object.type === "PizzaStone") {
                instance = new PizzaStone(object);
            }
            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;
            instance.mount(this);
        })
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true;

        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this
            })
            const result = await eventHandler.init();
            if (result === "LOST_BATTLE") {
                break;
            }
        }

        this.isCutscenePlaying = false;
    }

    checkForActionCutscene() {
        const hero = this.gameObjects["hero"];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        });
        if (!this.isCutscenePlaying && match && match.talking.length) {
            const relevantScenario = match.talking.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })

            relevantScenario && this.startCutscene(relevantScenario.events)
        }
    }



    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"];
        const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
        if (!this.isCutscenePlaying && match) {
            const relevantScenario = match.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })

            relevantScenario && this.startCutscene(relevantScenario.events)
        }
    }
}


window.OverworldMaps = {
    DemoRoom: {
        id: "DemoRoom",
        lowerSrc: "/images/maps/DemoLower.png",
        upperSrc: "/images/maps/DemoUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                useShadow: true,
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(9)
            },
            cat: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(6),
                y: utils.withGrid(9),
                src: "/images/characters/hero.png",
                behaviorLoop: [
                    { type: "walk", direction: "up" },
                    { type: "walk", direction: "up" },
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "down" },
                    { type: "walk", direction: "down" },
                    { type: "walk", direction: "right" },
                    { type: "walk", direction: "right" },
                ],
                talking: [
                    {
                        required: ["USED_PIZZA_STONE"],
                        events: [
                            { type: "textMessage", text: "Кот:Ого, ты умеешь использовать алтари пицц!" }
                        ]

                    },
                    {
                        events: [
                            { type: "textMessage", text: "Кот:мяу" },
                        ]
                    }
                ]
            },
            npc1:
            {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(3),
                y: utils.withGrid(5),
                src: "/images/characters/people/npc1.png",
                behaviorLoop: [
                    { type: "stand", direction: "left", time: 1200 },
                    { type: "stand", direction: "up", time: 500 },
                    { type: "stand", direction: "down", time: 800 }
                ],
                talking: [
                    {
                        required: ["TALKED_TO_NPC2"],
                        events: [
                            { type: "textMessage", text: "Бетт:Охранник подозрительный..." },
                            { type: "textMessage", text: "Бетт:Да что я вообще тут делаю??" },
                        ],
                    },
                    {
                        required: ["WAS_IN_KITCHEN"],
                        events: [
                            { type: "textMessage", text: "Бетт:Ну как там на кухне?" }
                        ],
                    },
                    {
                        required: ["DEFEATED_BETH"],
                        events: [
                            { type: "textMessage", text: "Бетт:Ты меня одолел!" }
                        ],
                    },
                    {
                        required: ["DEFEATED_BETH2"],
                        events: [
                            { type: "textMessage", text: "Бетт:Всё-таки ты смог меня одолеть в реванше..." }
                        ]
                    },
                    {
                        required: ["LOST_BETH"],
                        events: [
                            { type: "textMessage", text: "Бетт:Хаха!" },
                            { type: "textMessage", text: "Бетт:Одолеть тебя ещё раз?" },
                            { type: "battle", enemyId: "beth" },
                            { type: "addStoryFlag", flag: "DEFEATED_BETH2" },
                        ]
                    },
                    {
                        required: ["USED_PIZZA_STONE"],
                        events: [
                            { type: "textMessage", text: "Бетт:Ого, ты умеешь использовать алтари пицц!" },
                            { type: "removeStoryFlag", flag: "USED_PIZZA_STONE" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Бетт:Этот кот...", faceHero: "npc1" },
                            { type: "textMessage", text: "Бетт:Он мне не нравится!" },
                            { type: "addStoryFlag", flag: "LOST_BETH" },
                            { type: "battle", enemyId: "beth" },
                            { type: "addStoryFlag", flag: "DEFEATED_BETH" },
                        ]
                    }
                ]
            },
            npc2: {
                type: "Person",
                x: utils.withGrid(8),
                useShadow: true,
                y: utils.withGrid(5),
                src: "images/characters/people/npc2.png",
                behaviorLoop: [
                    { type: "stand", direction: "down", time: 800 }
                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "Охранник:...", faceHero: "npc2" },
                            { type: "addStoryFlag", flag: "TALKED_TO_NPC2" },
                        ]
                    },
                    {
                        required: ["SEEN_INTRO"],
                        events: [
                            { type: "textMessage", text: "Wow" }
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
        },
        walls: {
            [utils.asGridCoord(7, 7)]: true,
            [utils.asGridCoord(8, 7)]: true,
            [utils.asGridCoord(7, 8)]: true,
            [utils.asGridCoord(8, 8)]: true,
            [utils.asGridCoord(1, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(3, 4)]: true,
            [utils.asGridCoord(4, 4)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(6, 4)]: true,
            [utils.asGridCoord(10, 3)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(8, 4)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(6, 2)]: true,
            [utils.asGridCoord(6, 1)]: true,
            [utils.asGridCoord(8, 1)]: true,
            [utils.asGridCoord(8, 2)]: true,
            [utils.asGridCoord(8, 3)]: true,
            [utils.asGridCoord(11, 4)]: true,
            [utils.asGridCoord(11, 5)]: true,
            [utils.asGridCoord(11, 6)]: true,
            [utils.asGridCoord(11, 7)]: true,
            [utils.asGridCoord(11, 8)]: true,
            [utils.asGridCoord(11, 9)]: true,
            [utils.asGridCoord(10, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(2, 10)]: true,
            [utils.asGridCoord(1, 10)]: true,
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(5, 11)]: true,
            [utils.asGridCoord(8, 7)]: true
        },
        cutsceneSpaces: {
            [utils.asGridCoord(7, 4)]: [
                {
                    events: [
                        { who: "npc2", type: "walk", direction: "left" },
                        { who: "npc2", type: "stand", direction: "up", time: 500 },
                        { type: "textMessage", text: "Охранник:Тебе сюда нельзя." },
                        { who: "npc2", type: "walk", direction: "right" },
                        { who: "hero", type: "walk", direction: "down" },
                        { type: "addStoryFlag", flag: "TALKED_TO_NPC2" }
                    ]
                }
            ],
            [utils.asGridCoord(5, 10)]: [
                {
                    events: [
                        { type: "changeMap", map: "Kitchen", x: utils.withGrid(5), y: utils.withGrid(9), direction: "up" },
                        { type: "addStoryFlag", flag: "WAS_IN_KITCHEN" }
                    ]
                }
            ]
        }
    },
    Kitchen: {
        id: "Kitchen",
        lowerSrc: "/images/maps/KitchenLower.png",
        upperSrc: "/images/maps/KitchenUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                useShadow: true,
            },
            batya: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(7),
                y: utils.withGrid(5),
                src: "/images/characters/people/npc3.png",
                behaviorLoop: [
                    { type: "stand", direction: "down", time: 800 }
                ],
                talking: [
                    {
                        required: ["MADE_FIRST_PIZZA", "TALKED_TO_FATHER"],
                        events: [
                            { type: "textMessage", text: "Отец:Окей, на вид выглядит неплохо, надеюсь и на вкус тоже." },
                            { type: "textMessage", text: "Отец:Всё, времени уже нет, нужно быстрее её нести!" },
                            { type: "changeMap", map: "diningRoom2", direction: "down", x: utils.withGrid(3), y: utils.withGrid(6) },
                        ]
                    },
                    {
                        required: ["MADE_FIRST_PIZZA"],
                        events: [
                            { type: "textMessage", text: "Отец:Ого, ты уже сделал пиццу!Неплохая работа, недотёпа." },
                            { type: "textMessage", text: "Отец:Ну всё, нужно скорее её нести гостю!" },
                            { type: "changeMap", map: "diningRoom2", direction: "down", x: utils.withGrid(3), y: utils.withGrid(6) },
                        ]
                    },
                    {
                        required: ["TALKED_TO_FATHER"],
                        events: [
                            { type: "textMessage", text: "Отец:Поторопись!Время не ждёт." }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Отец:Наконец-то я тебя дождался, недотёпа!", faceHero: ["batya"] },
                            { type: "textMessage", text: "Отец:В общем, у нас сегодня утром поступил очень важный заказ." },
                            { type: "textMessage", text: "Отец:Сам граф Де Рубильдо хочет нашу фирменную пиццу!Тебе нельзя облажаться." },
                            { type: "textMessage", text: "Отец:Я поручаю это задание тебе, ведь тебе нужно доказать, что ты чего-то стоишь!" },
                            { type: "textMessage", text: "Отец:А теперь, покажи все свои навыки и приготовь пиццу, достойную графа!Он уже ждёт!" },
                            { type: "addStoryFlag", flag: "TALKED_TO_FATHER" }
                        ]
                    }
                ],
                behaviorLoop: [
                    { type: "stand", direction: "left", time: 200 },
                    { type: "stand", direction: "right", time: 300 }
                ]
            },
            table: {
                type: "PizzaStone",
                x: utils.withGrid(8),
                y: utils.withGrid(9),
                pizzas: ["nedotepa"],
                storyFlag: "MADE_FIRST_PIZZA"
            }
        },
        cutsceneSpaces: {
            [utils.asGridCoord(5, 10)]: [
                {
                    events: [
                        { type: "changeMap", map: "diningRoom", x: utils.withGrid(7), y: utils.withGrid(4), direction: "down" }
                    ]
                }
            ],
        },
        walls: {
            [utils.asGridCoord(2, 4)]: true,
            [utils.asGridCoord(1, 4)]: true,
            [utils.asGridCoord(1, 3)]: true,
            [utils.asGridCoord(3, 4)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(5, 4)]: true,
            [utils.asGridCoord(6, 4)]: true,
            [utils.asGridCoord(7, 4)]: true,
            [utils.asGridCoord(8, 4)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(10, 3)]: true,
            [utils.asGridCoord(12, 4)]: true,
            [utils.asGridCoord(13, 5)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(13, 7)]: true,
            [utils.asGridCoord(13, 8)]: true,
            [utils.asGridCoord(13, 9)]: true,
            [utils.asGridCoord(12, 10)]: true,
            [utils.asGridCoord(11, 10)]: true,
            [utils.asGridCoord(10, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(6, 10)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(5, 11)]: true,
            [utils.asGridCoord(2, 10)]: true,
            [utils.asGridCoord(1, 10)]: true,
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(1, 7)]: true,
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(1, 5)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(1, 9)]: true,
            [utils.asGridCoord(2, 9)]: true,
            [utils.asGridCoord(6, 7)]: true,
            [utils.asGridCoord(7, 7)]: true,
            [utils.asGridCoord(9, 7)]: true,
            [utils.asGridCoord(9, 9)]: true,
            [utils.asGridCoord(10, 9)]: true,
            [utils.asGridCoord(11, 4)]: true,
            [utils.asGridCoord(10, 7)]: true,
        }


    },
    secret: {
        id: "secret",
        lowerSrc: "/images/maps/EpicSecret.png",
        upperSrc: "/images/maps/KitchenUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                useShadow: true,
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(10)
            },
            lizard_girl: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(4),
                y: utils.withGrid(4),
                src: "images/characters/people/lizard_girl.png",
                behaviorLoop: [
                    { type: "stand", direction: "down", time: 800 }
                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "Ящерка: степа лошара" },
                            { type: "changeMap", map: "Kitchen", x: utils.withGrid(4), y: utils.withGrid(5), direction: "up" }
                        ]
                    }
                ]
            },
            pizzaStone: {
                type: "PizzaStone",
                x: utils.withGrid(42),
                y: utils.withGrid(42),
                storyFlag: "USED_PIZZA_STONE1",
                pizzas: ["stepalox", "stepalox", "stepalox"],
            },
        },


    },
    startZone: {
        id: "startZone",
        lowerSrc: "images/maps/KitchenUpper.png",
        upperSrc: "images/maps/KitchenUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                useShadow: true,
                x: utils.withGrid(15),
                y: utils.withGrid(15),
                direction: "up"
            },
            pizza_god: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(15),
                y: utils.withGrid(9),
                src: "images/characters/people/god_of_pizza.png",
                talking: [
                    {
                        required: ["secret"],
                        events: [
                            { type: "textMessage", text: "пасхалка" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "???:Тебе, наверное, интересно, как ты сюда попал." },
                            { type: "textMessage", text: "???:К сожалению,я не могу тебе сейчас этого сказать." },
                            { type: "textMessage", text: "???:Но твоя задача сейчас - изменить саму судьбу." },
                            { type: "textMessage", text: "???:Больше таких шансов не будет." },
                            { type: "textMessage", text: "???:Понимаю, изменять судьбу, не зная её - почти непосильная задача." },
                            { type: "textMessage", text: "???:Тем не менее, удачи." },
                            { type: "textMessage", text: "???:Мы скоро увидимся вновь.Не волнуйся." },
                            { type: "changeMap", map: "diningRoom", direction: "down", x: utils.withGrid(7), y: utils.withGrid(6) },
                            { type: "textMessage", text: "Вы:Какое-то у меня плохое предчувствие..." },
                            { type: "textMessage", text: "Вы:Ну, всё равно нужно пока что помочь отцу с пиццей." },
                            { type: "textMessage", text: "Вы:Так что пойду на кухню быстрее, чтобы его не разозлить опять." },
                        ],
                    },
                ]
            },
        },
        walls:
        {
            // [utils.asGridCoord(15,16)]:true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(10, 10)]: [
                {
                    events: [
                        { type: "addStoryFlag", flag: "secret" }
                    ]
                }
            ]
        }
    },
    street: {
        id: "street",
        lowerSrc: "images/maps/StreetLower.png",
        upperSrc: "images/maps/StreetUpper.png",
        configObjects: {
            hero: {
                useShadow: true,
                isPlayerControlled: true,
                type: "Person",
                direction: "right",
                x: utils.withGrid(6),
                y: utils.withGrid(12)
            },
            cat: {
                useShadow: true,
                type: "Person",
                x: utils.withGrid(21),
                y: utils.withGrid(25),
                src: "/images/characters/hero.png",
                behaviorLoop: [
                    { type: "walk", direction: "up" },
                    { type: "walk", direction: "up" },
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "down" },
                    { type: "walk", direction: "down" },
                    { type: "walk", direction: "right" },
                    { type: "walk", direction: "right" },
                ],
                talking: [
                    {
                        required: ["USED_PIZZA_STONE"],
                        events: [
                            { type: "textMessage", text: "Кот:Ого, ты умеешь использовать алтари пицц!" }
                        ]

                    },
                    {
                        events: [
                            { type: "textMessage", text: "Кот:мяу" },
                            { type: "battle", enemyId: "cat" },
                            { type: "battle", enemyId: "babka" }
                        ]
                    }
                ]
            },
            babka: {
                useShadow: true,
                type: "Person",
                x: utils.withGrid(26),
                y: utils.withGrid(16),
                src: "/images/characters/people/npc4.png",
                talking: [
                    {
                        required: ["KNOWN_ABOUT_PIZZA_OF_TRUTH"],
                        events: [
                            { type: "textMessage", text: "Бабуля:Интересно, что это за Пицца Правды?" }
                        ]
                    },
                    {
                        events:
                            [
                                { type: "textMessage", text: "Бабуля:Какой чудесный день!", faceHero: "babka" },
                            ]
                    }
                ],
                behaviorLoop: [
                    { type: "stand", direction: "down", time: 800 }
                ]
            },
            gazeta: {
                type: "Person",
                x: utils.withGrid(27),
                y: utils.withGrid(16),
                src: "images/characters/gazeta.png",
                talking: [
                    {
                        required: ["KNOWN_ABOUT_PIZZA_OF_TRUTH"],
                        events:
                            [

                            ]
                    },
                    {
                        events:
                            [
                                { type: "textMessage", text: "Бабуля:Эй, это моя газета!" },
                                { type: "battle", enemyId: "babka" },
                                { type: "textMessage", text: "Бабка:Ладно, забирай газету, только не трогай меня!" },
                                { type: "textMessage", text: "Вы берёте газету и читаете, что в ней написано." },
                                { type: "textMessage", text: "Там написано про потерянный артефакт..." },
                                { type: "textMessage", text: `Так называемая "Пицца Правды"...` },
                                { type: "textMessage", text: "И что её можно найти в окрестностях города..." },
                                { type: "textMessage", text: "Вам нужно узнать о ней больше." },
                                { type: "textMessage", text: "Вы понимаете, что это -" },
                                { type: "textMessage", text: "Ваш единственный шанс вернуть свою репутацию." },
                                { type: "addStoryFlag", flag: "KNOWN_ABOUT_PIZZA_OF_TRUTH" }
                            ]
                    }
                ]
            },
            counter1: {
                type: "Person",
                src: "aa",
                x: utils.withGrid(31),
                y: utils.withGrid(19),
                talking: [
                    {
                        events: [

                        ]
                    }
                ]
            },
            counter2: {
                type: "Person",
                src: "aa",
                x: utils.withGrid(32),
                y: utils.withGrid(19),
                talking: [
                    {
                        required: ["TALKED_TO_BETH"],
                        events: [
                            { type: "textMessage", text: "Бетт:Удачи!" }
                        ]
                    },
                    {
                        required: ["TALKED_TO_MAIN_CHINA_GUY"],
                        events: [
                            { type: "textMessage", text: "Бетт:Привет!" },
                            { type: "textMessage", text: "Вы:Привет!" },
                            { type: "textMessage", text: "Вы:Можно узнать поподробнее про предстоящий турнир?" },
                            { type: "textMessage", text: "Бетт:Конечно! Он состоится завтра у входа в китайский ресторан." },
                            { type: "textMessage", text: "Бетт:Там будет, думаю, 4 участника." },
                            { type: "textMessage", text: "Бетт:Победит тот, кто одолеет всех." },
                            { type: "textMessage", text: "Бетт:Приз скорее всего будет очень интересным!" },
                            { type: "textMessage", text: "Бетт:А ты будешь зрителем или участником?" },
                            { type: "textMessage", text: "Вы:Ну, похоже, что участником." },
                            { type: "textMessage", text: "Бетт:Ого! Ну тогда удачи. Возьми это с собой." },
                            { type: "craftingMenu", pizzas: ["v001"] },
                            { type: "textMessage", text: "Вы:Спасибо!" },
                            { type: "addStoryFlag", flag: "TALKED_TO_BETH" }
                        ]
                    },
                    {
                        events: [

                        ]
                    }
                ]
            }
        },
        cutsceneSpaces: {
            [utils.asGridCoord(36, 13)]:
                [
                    {
                        events: [
                            { type: "changeMap", map: "streetNorth", direction: "up", x: utils.withGrid(15), y: utils.withGrid(24) }
                        ]
                    }
                ],
            [utils.asGridCoord(16, 17)]:
                [
                    {
                        events: [
                            { type: "textMessage", text: "Мне пока лучше не возвращаться..." },
                            { type: "walk", who: "hero", direction: "down" }
                        ]
                    }
                ],
            [utils.asGridCoord(40, 17)]:
                [
                    {
                        events: [
                            { type: "changeMap", map: "shop", direction: "up", x: utils.withGrid(5), y: utils.withGrid(11) }
                        ]
                    }
                ],
            [utils.asGridCoord(27, 17)]:
                [
                    {
                        events: [
                            { type: "textMessage", text: "Бабуля:Внучок, ты что это творишь?" },
                            { type: "textMessage", text: "Бабуля:ПО ГАЗОНУ НЕ ХОДИТЬ!!!" },
                            { type: "battle", enemyId: "babka" }
                        ]
                    }
                ],
            [utils.asGridCoord(28, 17)]:
                [
                    {
                        events: [
                            { type: "textMessage", text: "Бабуля:Внучок, ты что это творишь?" },
                            { type: "textMessage", text: "Бабуля:ПО ГАЗОНУ НЕ ХОДИТЬ!!!" },
                            { type: "battle", enemyId: "babka" }
                        ]
                    }
                ],
            [utils.asGridCoord(27, 18)]:
                [
                    {
                        events: [
                            { type: "textMessage", text: "Бабуля:Внучок, ты что это творишь?" },
                            { type: "textMessage", text: "Бабуля:ПО ГАЗОНУ НЕ ХОДИТЬ!!!" },
                            { type: "battle", enemyId: "babka" }
                        ]
                    }
                ],
            [utils.asGridCoord(28, 18)]:
                [
                    {
                        events: [
                            { type: "textMessage", text: "Бабуля:Внучок, ты что это творишь?" },
                            { type: "textMessage", text: "Бабуля:ПО ГАЗОНУ НЕ ХОДИТЬ!!!" },
                            { type: "battle", enemyId: "babka" }
                        ]
                    }
                ],
            [utils.asGridCoord(27, 19)]:
                [
                    {
                        events: [
                            { type: "textMessage", text: "Бабуля:Внучок, ты что это творишь?" },
                            { type: "textMessage", text: "Бабуля:ПО ГАЗОНУ НЕ ХОДИТЬ!!!" },
                            { type: "battle", enemyId: "babka" }
                        ]
                    }
                ],
            [utils.asGridCoord(28, 19)]:
                [
                    {
                        events: [
                            { type: "textMessage", text: "Бабуля:Внучок, ты что это творишь?" },
                            { type: "textMessage", text: "Бабуля:ПО ГАЗОНУ НЕ ХОДИТЬ!!!" },
                            { type: "battle", enemyId: "babka" }
                        ]
                    }
                ],
        },
        walls: {
            [utils.asGridCoord(15, 17)]: true,
            [utils.asGridCoord(16, 16)]: true,
            [utils.asGridCoord(17, 17)]: true,
            [utils.asGridCoord(18, 17)]: true,
            [utils.asGridCoord(19, 17)]: true,
            [utils.asGridCoord(20, 17)]: true,
            [utils.asGridCoord(21, 17)]: true,
            [utils.asGridCoord(22, 17)]: true,
            [utils.asGridCoord(41, 17)]: true,
            [utils.asGridCoord(42, 17)]: true,
            [utils.asGridCoord(43, 17)]: true,
            [utils.asGridCoord(44, 17)]: true,
            [utils.asGridCoord(45, 18)]: true,
            [utils.asGridCoord(45, 19)]: true,
            [utils.asGridCoord(45, 20)]: true,
            [utils.asGridCoord(45, 21)]: true,
            [utils.asGridCoord(23, 17)]: true,
            [utils.asGridCoord(24, 16)]: true,
            [utils.asGridCoord(25, 16)]: true,
            [utils.asGridCoord(26, 15)]: true,
            [utils.asGridCoord(31, 18)]: true,
            [utils.asGridCoord(32, 18)]: true,
            [utils.asGridCoord(31, 19)]: true,
            [utils.asGridCoord(32, 19)]: true,
            [utils.asGridCoord(27, 15)]: true,
            [utils.asGridCoord(14, 18)]: true,
            [utils.asGridCoord(14, 19)]: true,
            [utils.asGridCoord(14, 20)]: true,
            [utils.asGridCoord(14, 21)]: true,
            [utils.asGridCoord(29, 19)]: true,
            [utils.asGridCoord(30, 19)]: true,
            [utils.asGridCoord(28, 15)]: true,
            [utils.asGridCoord(29, 15)]: true,
            [utils.asGridCoord(30, 15)]: true,
            [utils.asGridCoord(31, 15)]: true,
            [utils.asGridCoord(32, 15)]: true,
            [utils.asGridCoord(33, 15)]: true,
            [utils.asGridCoord(34, 15)]: true,
            [utils.asGridCoord(35, 15)]: true,
            [utils.asGridCoord(35, 14)]: true,
            [utils.asGridCoord(35, 13)]: true,
            [utils.asGridCoord(37, 13)]: true,
            [utils.asGridCoord(37, 14)]: true,
            [utils.asGridCoord(37, 15)]: true,
            [utils.asGridCoord(38, 15)]: true,
            [utils.asGridCoord(39, 16)]: true,
            [utils.asGridCoord(39, 17)]: true,
            [utils.asGridCoord(42, 17)]: true,
            [utils.asGridCoord(15, 22)]: true,
            [utils.asGridCoord(16, 22)]: true,
            [utils.asGridCoord(18, 22)]: true,
            [utils.asGridCoord(19, 22)]: true,
            [utils.asGridCoord(20, 22)]: true,
            [utils.asGridCoord(21, 22)]: true,
            [utils.asGridCoord(22, 22)]: true,
            [utils.asGridCoord(23, 22)]: true,
            [utils.asGridCoord(24, 22)]: true,
            [utils.asGridCoord(25, 22)]: true,
            [utils.asGridCoord(26, 22)]: true,
            [utils.asGridCoord(27, 22)]: true,
            [utils.asGridCoord(28, 22)]: true,
            [utils.asGridCoord(29, 22)]: true,
            [utils.asGridCoord(30, 22)]: true,
            [utils.asGridCoord(31, 22)]: true,
            [utils.asGridCoord(32, 22)]: true,
            [utils.asGridCoord(33, 22)]: true,
            [utils.asGridCoord(34, 22)]: true,
            [utils.asGridCoord(35, 22)]: true,
            [utils.asGridCoord(36, 22)]: true,
            [utils.asGridCoord(37, 22)]: true,
            [utils.asGridCoord(38, 22)]: true,
            [utils.asGridCoord(39, 22)]: true,
            [utils.asGridCoord(40, 22)]: true,
            [utils.asGridCoord(41, 22)]: true,
            [utils.asGridCoord(42, 22)]: true,
            [utils.asGridCoord(43, 22)]: true,
            [utils.asGridCoord(44, 22)]: true,
        }
    },
    streetNorth: {
        id: "streetNorth",
        lowerSrc: "/images/maps/StreetNorthLower.png",
        upperSrc: "/images/maps/StreetNorthUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                useShadow: true,
                isPlayerControlled: true,
                direction: "up"
            },
            npc1: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(21),
                y: utils.withGrid(22),
                direction: "left",
                src: "/images/characters/people/npc5.png",
                talking: [
                    {
                        required: ["LISTENED_TO_WORK"],
                        events: [

                        ]
                    },
                    {
                        required: ["LISTENED_DIALOGUE_1"],
                        events: [
                            { type: "textMessage", text: "???:Хей!" },
                            { type: "textMessage", text: "???:Видел новый ресторан сверху? Обязательно зайди!" },
                            { type: "addStoryFlag", flag: "LISTENED_TO_WORK" },
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Вы слышите чужой разговор." },
                            { type: "textMessage", text: "???:Странный какой-то этот новый ресторан, Джек..." },
                            { type: "textMessage", text: "Джек:Да, и этот менеджер слишком уж подозрительный." },
                            { type: "addStoryFlag", flag: "LISTENED_DIALOGUE_1" }
                        ]
                    },
                ],
                behaviorLoop: [
                    { type: "stand", direction: "left", time: 800 }
                ]
            },
            npc2: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(20),
                y: utils.withGrid(21),
                direction: "down",
                src: "/images/characters/people/npc2.png",
                talking: [
                    {
                        required: ["LISTENED_DIALOGUE_1"],
                        events: [
                            { type: "textMessage", text: "Джек:Дам тебе совет. Не заходи в тот ресторан сверху!" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Вы слышите чужой разговор." },
                            { type: "textMessage", text: "???:Странный какой-то этот новый ресторан, Джек..." },
                            { type: "textMessage", text: "Джек:Да, и этот менеджер слишком уж подозрительный." },
                            { type: "addStoryFlag", flag: "LISTENED_DIALOGUE_1" }
                        ],
                    },
                ],
                behaviorLoop: [
                    { type: "stand", direction: "down", time: 900 }
                ]
            },
            china_guy3: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(14),
                y: utils.withGrid(15),
                src: "/images/characters/people/china_guy1.png"
            },
            china_guy4: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(16),
                y: utils.withGrid(15),
                src: "/images/characters/people/china_guy3.png"
            },
        },
        walls: {
            [utils.asGridCoord(14, 25)]: true,
            [utils.asGridCoord(13, 25)]: true,
            [utils.asGridCoord(12, 25)]: true,
            [utils.asGridCoord(11, 25)]: true,
            [utils.asGridCoord(10, 25)]: true,
            [utils.asGridCoord(9, 25)]: true,
            [utils.asGridCoord(8, 25)]: true,
            [utils.asGridCoord(9, 23)]: true,
            [utils.asGridCoord(9, 22)]: true,
            [utils.asGridCoord(9, 21)]: true,
            [utils.asGridCoord(9, 20)]: true,
            [utils.asGridCoord(9, 19)]: true,
            [utils.asGridCoord(9, 18)]: true,
            [utils.asGridCoord(9, 17)]: true,
            [utils.asGridCoord(8, 16)]: true,
            [utils.asGridCoord(9, 16)]: true,
            [utils.asGridCoord(10, 16)]: true,
            [utils.asGridCoord(11, 16)]: true,
            [utils.asGridCoord(11, 15)]: true,
            [utils.asGridCoord(12, 14)]: true,
            [utils.asGridCoord(13, 14)]: true,
            [utils.asGridCoord(14, 14)]: true,
            [utils.asGridCoord(16, 14)]: true,
            [utils.asGridCoord(17, 14)]: true,
            [utils.asGridCoord(18, 14)]: true,
            [utils.asGridCoord(19, 15)]: true,
            [utils.asGridCoord(20, 15)]: true,
            [utils.asGridCoord(21, 15)]: true,
            [utils.asGridCoord(8, 23)]: true,
            [utils.asGridCoord(7, 24)]: true,
            [utils.asGridCoord(23, 23)]: true,
            [utils.asGridCoord(22, 15)]: true,
            [utils.asGridCoord(23, 15)]: true,
            [utils.asGridCoord(22, 16)]: true,
            [utils.asGridCoord(22, 17)]: true,
            [utils.asGridCoord(22, 18)]: true,
            [utils.asGridCoord(22, 19)]: true,
            [utils.asGridCoord(22, 20)]: true,
            [utils.asGridCoord(22, 21)]: true,
            [utils.asGridCoord(22, 22)]: true,
            [utils.asGridCoord(22, 23)]: true,
            [utils.asGridCoord(24, 24)]: true,
            [utils.asGridCoord(23, 25)]: true,
            [utils.asGridCoord(22, 25)]: true,
            [utils.asGridCoord(9, 24)]: true,
            [utils.asGridCoord(22, 24)]: true,
            [utils.asGridCoord(21, 25)]: true,
            [utils.asGridCoord(20, 25)]: true,
            [utils.asGridCoord(19, 25)]: true,
            [utils.asGridCoord(18, 25)]: true,
            [utils.asGridCoord(17, 25)]: true,
            [utils.asGridCoord(16, 25)]: true,
            [utils.asGridCoord(23, 25)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(15, 14)]:
                [
                    {
                        events: [
                            { type: "changeMap", map: "greenKitchen", direction: "up", x: utils.withGrid(5), y: utils.withGrid(11) }
                        ]
                    }
                ],
            [utils.asGridCoord(15, 25)]:
                [
                    {
                        events: [
                            { type: "changeMap", map: "street", direction: "down", x: utils.withGrid(36), y: utils.withGrid(14) }
                        ]
                    }
                ],
            [utils.asGridCoord(18, 22)]: [
                {
                    required: ["LISTENED_DIALOGUE_1"],
                    events: [

                    ]
                },
                {
                    events: [
                        { type: "stand", time: 1, who: "hero", direction: "right" },
                        { type: "textMessage", text: "Вы случайно слышите чужой разговор." },
                        { type: "textMessage", text: "???:Странный какой-то этот новый ресторан, Джек..." },
                        { type: "textMessage", text: "Джек:Да, и этот менеджер слишком уж подозрительный." },
                        { type: "addStoryFlag", flag: "LISTENED_DIALOGUE_1" },
                    ]
                },
            ],
        }
    },
    diningRoom: {
        id: "diningRoom",
        lowerSrc: "/images/maps/DiningRoomLower.png",
        upperSrc: "/images/maps/DiningRoomUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                useShadow: true,
                isPlayerControlled: true,
            },
            epicGuest: {
                type: "Person",
                src: "/images/characters/people/erio.png",
                x: utils.withGrid(2),
                y: utils.withGrid(7),
                direction: "right",
                talking: [
                    {
                        required: ["TALKED_TO_FATHER"],
                        events: [
                            { type: "textMessage", text: "Де Рубильдо:ГДЕ МОЯ ФИРМЕННАЯ ЗНАМЕНИТАЯ ХВАЛЁНАЯ ПИЦЦА КУППЕРОВ?!" },
                            { type: "textMessage", text: "Де Рубильдо:ПРИНЕСИТЕ ЖЕ ЕЁ БЫСТРЕЕ!!!" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Посетитель:ГДЕ МОЯ ФИРМЕННАЯ ЗНАМЕНИТАЯ ХВАЛЁНАЯ ПИЦЦА КУППЕРОВ?!" },
                            { type: "textMessage", text: "Посетитель:ПРИНЕСИТЕ ЖЕ ЕЁ БЫСТРЕЕ!!!" }
                        ]
                    }
                ]
            }
        },
        cutsceneSpaces: {
            [utils.asGridCoord(7, 3)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Kitchen",
                            x: utils.withGrid(5),
                            y: utils.withGrid(9),
                            direction: "up"
                        }
                    ]
                }
            ],
            [utils.asGridCoord(6, 12)]: [
                {
                    events: [

                        { type: "textMessage", text: "Вы:Сначала нужно помочь отцу." }

                    ]
                }
            ],
        },
        walls: {
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(6, 13)]: true,
            [utils.asGridCoord(1, 5)]: true,
            [utils.asGridCoord(2, 5)]: true,
            [utils.asGridCoord(3, 5)]: true,
            [utils.asGridCoord(4, 5)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(6, 4)]: true,
            [utils.asGridCoord(1, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(6, 5)]: true,
            [utils.asGridCoord(8, 3)]: true,
            [utils.asGridCoord(9, 4)]: true,
            [utils.asGridCoord(10, 4)]: true,
            [utils.asGridCoord(11, 5)]: true,
            [utils.asGridCoord(12, 4)]: true,
            [utils.asGridCoord(11, 7)]: true,
            [utils.asGridCoord(12, 7)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(3, 7)]: true,
            [utils.asGridCoord(8, 7)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(1, 12)]: true,
            [utils.asGridCoord(2, 12)]: true,
            [utils.asGridCoord(3, 12)]: true,
            [utils.asGridCoord(4, 12)]: true,
            [utils.asGridCoord(5, 12)]: true,
            [utils.asGridCoord(7, 12)]: true,
            [utils.asGridCoord(8, 12)]: true,
            [utils.asGridCoord(9, 12)]: true,
            [utils.asGridCoord(10, 12)]: true,
            [utils.asGridCoord(11, 12)]: true,
            [utils.asGridCoord(12, 12)]: true,
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(0, 10)]: true,
            [utils.asGridCoord(0, 11)]: true,
            [utils.asGridCoord(13, 4)]: true,
            [utils.asGridCoord(13, 5)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(13, 8)]: true,
            [utils.asGridCoord(13, 9)]: true,
            [utils.asGridCoord(13, 10)]: true,
            [utils.asGridCoord(13, 11)]: true,
        }
    },
    diningRoom2: {
        id: "diningRoom2",
        lowerSrc: "/images/maps/DiningRoom2Lower.png",
        upperSrc: "/images/maps/DiningRoomUpper.png",
        configObjects: {
            hero: {
                useShadow: true,
                type: "Person",
                isPlayerControlled: true,
            },
            epicGuest: {
                type: "Person",
                useShadow: true,
                src: "/images/characters/people/erio.png",
                x: utils.withGrid(2),
                y: utils.withGrid(7),
                direction: "right",
                talking: [
                    {
                        required: ["TALKED_TO_FATHER"],
                        events: [
                        ]
                    },
                    {
                        events: [
                        ]
                    }
                ]
            },
            batya: {
                type: "Person",
                src: "/images/characters/people/npc3.png",
                x: utils.withGrid(2),
                y: utils.withGrid(6),
                useShadow: true,
                direction: "down",
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "Отец:Что скажете, граф Де Рубильдо?Вам нравится?" },
                            { type: "textMessage", text: "Отец:Наши лучшие повара старались изо всех сил для такого гостя, как вы!" },
                            { type: "textMessage", text: "Отец:К тому же наше семейное фирменное блюдо требует большой подготовки для создания." },
                            { type: "textMessage", text: "Де Рубильдо:И ЭТО ВЫ НАЗЫВАЕТЕ УВАЖЕНИЕМ К СВОИМ КЛИЕНТАМ?!" },
                            { type: "textMessage", text: "Де Рубильдо:ЭТО НЕУВАЖЕНИЕ НЕ ТОЛЬКО КО МНЕ, НО И КО ВСЕМ ПОСЕТИТЕЛЯМ ДАННОГО ЗАВЕДЕНИЯ!" },
                            { type: "textMessage", text: "Де Рубильдо:ДА Я ДАЖЕ ВРАГУ НЕ ПОСМЕЮ РЕКОММЕНДОВАТЬ ЭТУ ПИЦЦЕРИЮ!ПОЛНЫЙ УЖАС!!!" },
                            { type: "textMessage", text: "Де Рубильдо:ПРОТИВНО ОТ ЭТОГО МЕСТА!" },
                            { type: "addStoryFlag", flag: "RUINED_GUEST" },
                            { who: "epicGuest", type: "walk", direction: "down" },
                            { who: "epicGuest", type: "walk", direction: "right" },
                            { who: "epicGuest", type: "walk", direction: "right" },
                            { who: "epicGuest", type: "walk", direction: "right" },
                            { who: "epicGuest", type: "walk", direction: "down" },
                            { who: "epicGuest", type: "walk", direction: "down" },
                            { who: "epicGuest", type: "walk", direction: "down" },
                            { who: "epicGuest", type: "walk", direction: "right" },
                            { who: "epicGuest", type: "walk", direction: "down" },
                            { who: "epicGuest", type: "walk", direction: "down" },
                            { type: "textMessage", text: "Отец:...", faceHero: "batya" },
                            { type: "textMessage", text: "Отец:Как такое возможно..." },
                            { type: "textMessage", text: "Отец:Ты хоть понимаешь..." },
                            { type: "textMessage", text: "Отец:ЧТО ТЫ НАДЕЛАЛ?!!" },
                            { type: "textMessage", text: "Отец:Какая же ты всё таки бездарность!" },
                            { type: "textMessage", text: "Отец:Так и знал что от тебя не будет никакого толку!" },
                            { type: "textMessage", text: "Отец:Всё, моё терпение лопнуло." },
                            { type: "textMessage", text: "Отец:Уходи и не возвращайся, пока не станешь достойным нашей семьи!" },
                            { type: "textMessage", text: "Отец:Познай путь пиццы." },
                            { type: "changeMap", map: "street", direction: "down", x: utils.withGrid(16), y: utils.withGrid(18) },
                            { type: "textMessage", text: "Вы:Так и знал, что произойдёт что-то ужасное..." },
                        ]
                    }
                ]
            }
        },
        cutsceneSpaces: {
            [utils.asGridCoord(7, 3)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "Kitchen",
                            x: utils.withGrid(5),
                            y: utils.withGrid(9),
                            direction: "up"
                        }
                    ]
                }
            ],
            [utils.asGridCoord(6, 12)]: [
                {
                    events: [
                        {
                            type: "changeMap",
                            map: "street",
                            x: utils.withGrid(16),
                            y: utils.withGrid(18),
                            direction: "down"
                        }
                    ]
                }
            ],
        },
        walls: {
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(7, 2)]: true,
            [utils.asGridCoord(1, 5)]: true,
            [utils.asGridCoord(2, 5)]: true,
            [utils.asGridCoord(3, 5)]: true,
            [utils.asGridCoord(4, 5)]: true,
            [utils.asGridCoord(4, 4)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(6, 4)]: true,
            [utils.asGridCoord(6, 5)]: true,
            [utils.asGridCoord(8, 3)]: true,
            [utils.asGridCoord(4, 6)]: true,
            [utils.asGridCoord(9, 4)]: true,
            [utils.asGridCoord(10, 5)]: true,
            [utils.asGridCoord(11, 5)]: true,
            [utils.asGridCoord(12, 5)]: true,
            [utils.asGridCoord(11, 7)]: true,
            [utils.asGridCoord(12, 7)]: true,
            [utils.asGridCoord(2, 7)]: true,
            [utils.asGridCoord(3, 7)]: true,
            [utils.asGridCoord(4, 7)]: true,
            [utils.asGridCoord(7, 7)]: true,
            [utils.asGridCoord(8, 7)]: true,
            [utils.asGridCoord(9, 7)]: true,
            [utils.asGridCoord(2, 10)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(4, 10)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
            [utils.asGridCoord(1, 12)]: true,
            [utils.asGridCoord(2, 12)]: true,
            [utils.asGridCoord(3, 12)]: true,
            [utils.asGridCoord(4, 12)]: true,
            [utils.asGridCoord(5, 12)]: true,
            [utils.asGridCoord(7, 12)]: true,
            [utils.asGridCoord(8, 12)]: true,
            [utils.asGridCoord(9, 12)]: true,
            [utils.asGridCoord(10, 12)]: true,
            [utils.asGridCoord(11, 12)]: true,
            [utils.asGridCoord(12, 12)]: true,
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(0, 10)]: true,
            [utils.asGridCoord(0, 11)]: true,
            [utils.asGridCoord(13, 4)]: true,
            [utils.asGridCoord(13, 5)]: true,
            [utils.asGridCoord(13, 6)]: true,
            [utils.asGridCoord(13, 8)]: true,
            [utils.asGridCoord(13, 9)]: true,
            [utils.asGridCoord(13, 10)]: true,
            [utils.asGridCoord(13, 11)]: true,
        }
    },
    shop: {
        id: "shop",
        lowerSrc: "/images/maps/PizzaShopLower.png",
        upperSrc: "/images/maps/PizzaShopUpper.png",
        configObjects: {
            hero: {
                useShadow: true,
                type: "Person",
                isPlayerControlled: true,
            }
        },
        walls: {
            [utils.asGridCoord(0, 12)]: true,
            [utils.asGridCoord(1, 12)]: true,
            [utils.asGridCoord(2, 12)]: true,
            [utils.asGridCoord(3, 12)]: true,
            [utils.asGridCoord(4, 12)]: true,
            [utils.asGridCoord(6, 12)]: true,
            [utils.asGridCoord(7, 12)]: true,
            [utils.asGridCoord(8, 12)]: true,
            [utils.asGridCoord(9, 12)]: true,
            [utils.asGridCoord(10, 12)]: true,
            [utils.asGridCoord(11, 12)]: true,
            [utils.asGridCoord(11, 11)]: true,
            [utils.asGridCoord(11, 10)]: true,
            [utils.asGridCoord(11, 9)]: true,
            [utils.asGridCoord(11, 8)]: true,
            [utils.asGridCoord(11, 7)]: true,
            [utils.asGridCoord(11, 6)]: true,
            [utils.asGridCoord(11, 5)]: true,
            [utils.asGridCoord(11, 4)]: true,
            [utils.asGridCoord(11, 3)]: true,
            [utils.asGridCoord(11, 2)]: true,
            [utils.asGridCoord(10, 3)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(8, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(1, 3)]: true,
            [utils.asGridCoord(0, 3)]: true,
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(0, 10)]: true,
            [utils.asGridCoord(0, 11)]: true,
            [utils.asGridCoord(9, 4)]: true,
            [utils.asGridCoord(9, 5)]: true,
            [utils.asGridCoord(9, 6)]: true,
            [utils.asGridCoord(8, 6)]: true,
            [utils.asGridCoord(7, 6)]: true,
            [utils.asGridCoord(5, 6)]: true,
            [utils.asGridCoord(4, 6)]: true,
            [utils.asGridCoord(3, 6)]: true,
            [utils.asGridCoord(2, 6)]: true,
            [utils.asGridCoord(2, 4)]: true,
            [utils.asGridCoord(2, 5)]: true,
            [utils.asGridCoord(7, 8)]: true,
            [utils.asGridCoord(7, 9)]: true,
            [utils.asGridCoord(8, 8)]: true,
            [utils.asGridCoord(8, 9)]: true,
            [utils.asGridCoord(3, 8)]: true,
            [utils.asGridCoord(3, 9)]: true,
            [utils.asGridCoord(3, 10)]: true,
            [utils.asGridCoord(4, 8)]: true,
            [utils.asGridCoord(4, 9)]: true,
            [utils.asGridCoord(4, 10)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(5, 12)]:
                [
                    {
                        events: [
                            { type: "changeMap", map: "street", direction: "down", x: utils.withGrid(40), y: utils.withGrid(18) }
                        ]
                    }
                ]
        }
    },
    greenKitchen: {
        id: "greenKitchen",
        lowerSrc: "/images/maps/GreenKitchenLower.png",
        upperSrc: "/images/maps/GreenKitchenUpper.png",
        configObjects: {
            hero: {
                useShadow: true,
                type: "Person",
                isPlayerControlled: true,
            },
            main_china_guy: {
                type: "Person",
                useShadow: true,
                src: "/images/characters/people/main_china_guy.png",
                x: utils.withGrid(4),
                y: utils.withGrid(5),
                behaviorLoop: [
                    { type: "stand", direction: "down", time: 800 },
                ],
                talking: [
                    {
                        required: ["TALKED_TO_BETH"],
                        events: [
                            { type: "textMessage", text: "首席中文:Ну что...", faceHero: "main_china_guy" },
                            { type: "textMessage", text: "首席中文: Готов к турниру?" },
                            { type: "textMessage", text: "首席中文:Надеюсь, что да. Удачи!" },
                            { type: "changeMap", map: "streetNorth2", direction: "up", x: utils.withGrid(15), y: utils.withGrid(23) }
                        ]
                    },
                    {
                        required: ["TALKED_TO_MAIN_CHINA_GUY"],
                        events: [
                            { type: "textMessage", text: "首席中文:Неплохая была битва! Заходи ещё!", faceHero: "main_china_guy" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "首席中文:Добро пожаловать в наш недавно открытый ресторан!", faceHero: "main_china_guy" },
                            { type: "textMessage", text: "首席中文:Слушай, ты выглядишь довольно отчаянным." },
                            { type: "textMessage", text: "首席中文:Может, подерёмся пиццами? Я сейчас бы не отказался!" },
                            { type: "addStoryFlag", flag: "LOSE_MAIN_CHINA_GUY" },
                            { type: "battle", enemyId: "MainChinaGuy" },
                            { type: "textMessage", text: "首席中文:Ух! Это было освежающе! Не думаешь поучаствовать в завтрашнем турнире?" },
                            { type: "textMessage", text: "首席中文:Для тебя это будет отличным испытанием!" },
                            { type: "textMessage", text: "首席中文:Зайди в ларёк на юге и узнай поподробнее, если интересно." },
                            { type: "addStoryFlag", flag: "TALKED_TO_MAIN_CHINA_GUY" },
                        ]
                    },
                ]
            },
            china_guy2: {
                type: "Person",
                useShadow: true,
                src: "/images/characters/people/china_guy2.png",
                x: utils.withGrid(4),
                y: utils.withGrid(11),
                direction: "right"
            },
            talk: {
                type: "Person",
                useShadow: false,
                x: utils.withGrid(4),
                y: utils.withGrid(6),
                src: "/images/",
                talking: [
                    {
                        required: ["TALKED_TO_MAIN_CHINA_GUY"],
                        events: [
                            { type: "textMessage", text: "首席中文:Неплохая была битва! Заходи ещё!", faceHero: "main_china_guy" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "首席中文:Добро пожаловать в наш недавно открытый ресторан!", faceHero: "main_china_guy" },
                            { type: "textMessage", text: "首席中文:Слушай, ты выглядишь довольно отчаянным." },
                            { type: "textMessage", text: "首席中文:Может, подерёмся пиццами? Я сейчас бы не отказался!" },
                            { type: "addStoryFlag", flag: "LOSE_MAIN_CHINA_GUY" },
                            { type: "battle", enemyId: "MainChinaGuy" },
                            { type: "textMessage", text: "首席中文:Ух! Это было освежающе! Не думаешь поучаствовать в завтрашнем турнире?" },
                            { type: "textMessage", text: "首席中文:Для тебя это будет отличным испытанием!" },
                            { type: "textMessage", text: "首席中文:Зайди в ларёк на юге и узнай поподробнее, если интересно." },
                            { type: "addStoryFlag", flag: "TALKED_TO_MAIN_CHINA_GUY" }
                        ]
                    },
                ]
            }
        },
        walls: {
            [utils.asGridCoord(0, 12)]: true,
            [utils.asGridCoord(1, 12)]: true,
            [utils.asGridCoord(2, 12)]: true,
            [utils.asGridCoord(3, 12)]: true,
            [utils.asGridCoord(4, 12)]: true,
            [utils.asGridCoord(6, 12)]: true,
            [utils.asGridCoord(7, 12)]: true,
            [utils.asGridCoord(8, 12)]: true,
            [utils.asGridCoord(9, 12)]: true,
            [utils.asGridCoord(10, 12)]: true,
            [utils.asGridCoord(10, 11)]: true,
            [utils.asGridCoord(10, 10)]: true,
            [utils.asGridCoord(9, 4)]: true,
            [utils.asGridCoord(10, 9)]: true,
            [utils.asGridCoord(10, 8)]: true,
            [utils.asGridCoord(10, 7)]: true,
            [utils.asGridCoord(10, 6)]: true,
            [utils.asGridCoord(10, 5)]: true,
            [utils.asGridCoord(10, 4)]: true,
            [utils.asGridCoord(10, 3)]: true,
            [utils.asGridCoord(9, 3)]: true,
            [utils.asGridCoord(8, 4)]: true,
            [utils.asGridCoord(8, 3)]: true,
            [utils.asGridCoord(7, 3)]: true,
            [utils.asGridCoord(6, 3)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(4, 3)]: true,
            [utils.asGridCoord(3, 3)]: true,
            [utils.asGridCoord(2, 3)]: true,
            [utils.asGridCoord(1, 3)]: true,
            [utils.asGridCoord(0, 3)]: true,
            [utils.asGridCoord(0, 3)]: true,
            [utils.asGridCoord(0, 4)]: true,
            [utils.asGridCoord(0, 5)]: true,
            [utils.asGridCoord(0, 6)]: true,
            [utils.asGridCoord(0, 7)]: true,
            [utils.asGridCoord(0, 8)]: true,
            [utils.asGridCoord(0, 9)]: true,
            [utils.asGridCoord(0, 10)]: true,
            [utils.asGridCoord(0, 11)]: true,
            [utils.asGridCoord(1, 6)]: true,
            [utils.asGridCoord(2, 6)]: true,
            [utils.asGridCoord(3, 6)]: true,
            [utils.asGridCoord(5, 3)]: true,
            [utils.asGridCoord(4, 6)]: true,
            [utils.asGridCoord(5, 6)]: true,
            [utils.asGridCoord(6, 6)]: true,
            [utils.asGridCoord(8, 5)]: true,
            [utils.asGridCoord(6, 7)]: true,
            [utils.asGridCoord(3, 7)]: true,
            // [utils.asGridCoord(4, 7)]: true,
            [utils.asGridCoord(2, 9)]: true,
            [utils.asGridCoord(3, 9)]: true,
            [utils.asGridCoord(4, 9)]: true,
            [utils.asGridCoord(7, 10)]: true,
            [utils.asGridCoord(8, 10)]: true,
            [utils.asGridCoord(9, 10)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(5, 12)]:
                [
                    {
                        events: [
                            { type: "changeMap", map: "streetNorth", direction: "down", x: utils.withGrid(15), y: utils.withGrid(15) }
                        ]
                    }
                ]
        }
    },
    streetNorth2: {
        id: "streetNorth2",
        lowerSrc: "/images/maps/StreetNorthLower.png",
        upperSrc: "/images/maps/StreetNorthUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                useShadow: true,
                isPlayerControlled: true,
                direction: "up",
                x: utils.withGrid(15),
                y: utils.withGrid(23)
            },
            npc1: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(10),
                y: utils.withGrid(22),
                direction: "down",
                src: "/images/characters/people/npc5.png",
                talking: [
                    {
                        required:["GOT_JACKP"],
                        events:[
                            {type:'textMessage',text:"???:Спасибо ещё раз!",faceHero:"npc1"}
                        ]
                    },
                    {
                        required:["WON_JACK"],
                        events:[
                            {type:'textMessage',text:"???:Ого! Дал ты Джеку трёпку. Спасибо!",faceHero:"npc1"},
                            {type:'textMessage',text:"???:Он меня просто уже довольно достал. Ноет и ноет."},
                            {type:'textMessage',text:"???:Мне такое не по душе. Он нарушает мой покой."},
                            {type:'textMessage',text:"???:Держи это в качестве благодарности."},
                            {type:"addStoryFlag",flag:"GOT_JACKP"},
                            { type: "craftingMenu", pizzas: ["jackp"] },
                        ]
                    },
                    {
                        required: ["LISTENED_DIALOGUE_2"],
                        events: [
                            {
                                type: "textMessage",
                                text: "???:Удачи!",
                                faceHero: "npc1"
                            }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "???:И снова привет!", faceHero: "npc1" },
                            { type: "textMessage", text: "???:Не ожидал тебя увидеть здесь в качестве участника." },
                            { type: "textMessage", text: "???:Удачи!" },
                            { type: "addStoryFlag", flag: "LISTENED_DIALOGUE_2" }
                        ]
                    },
                ],
                behaviorLoop: [
                    { type: "stand", direction: "down", time: "800" },
                ]
            },
            beth: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(21),
                direction: "left",
                y: utils.withGrid(20),
                src: "images/characters/people/npc1.png",
                talking: [
                    {
                        required: ["TALKED_TO_BETH_ON_TOURNAMENT"],
                        events: [
                            { type: "textMessage", text: "Бетт:Не проиграй!", faceHero: "beth" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Бетт:Снова приветик!", faceHero: "beth" },
                            { type: "textMessage", text: "Бетт:Надеюсь ты готовился к турниру." },
                            { type: "textMessage", text: "Бетт:Я поставила на тебя 15 пицца-монет!" },
                            { type: "addStoryFlag", flag: "TALKED_TO_BETH_ON_TOURNAMENT" },
                        ]
                    }
                ],
                behaviorLoop: [
                    { type: "stand", time: 800, direction: "left" }
                ]
            },
            npc2: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(10),
                y: utils.withGrid(23),
                direction: "up",
                src: "images/characters/people/npc2.png",
                talking: [
                    {
                        required: ["WON_JACK"],
                        events: [
                            { type: "textMessage", text: "Джек:Уверен, ты проиграешь первым.", faceHero: "npc2" }
                        ]
                    },
                    {
                        required: ["LOSS_JACK"],
                        events: [
                            { type: "textMessage", text: "Джек:Ха! Лузер. Кого только не понабирают.", faceHero: "npc2" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Джек:ДА КАК ТАК?!", faceHero: "npc2" },
                            { type: "textMessage", text: "Джек:КАК ТАК" },
                            { type: "textMessage", text: "Джек:Ты попал на турнир, а я нет?!" },
                            { type: "textMessage", text: "Джек:Я бы был лучше тебя!" },
                            { type: "textMessage", text: "Джек:И сейчас я тебе это докажу!" },
                            { type: "addStoryFlag", flag: "LOSS_JACK" },
                            { type: "battle", enemyId: "jack" },
                            { type: "addStoryFlag", flag: "WON_JACK" },
                            { type: "textMessage", text: "Джек:Ну...Может я был не прав." },
                            { type: "textMessage", text: "Джек:Хотя..Нет! Тебе просто повезло!" },
                            { type: "textMessage", text: "Джек:Да и вообще, одна победа надо мной ничего не значит." }
                        ],
                    },
                ],
                behaviorLoop: [
                    { type: "stand", direction: "up", time: "800" },
                ]
            },
            dad: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(15),
                y: utils.withGrid(33),
                src: "/images/characters/people/npc3.png"
            },
            main_china_guy: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(15),
                y: utils.withGrid(15),
                src: "/images/characters/people/main_china_guy.png",
                talking: [
                    {
                        required: ["3"],
                        events: [
                            { type: "textMessage", text: "首席中文:Главное участие!" },
                            { type: 'textMessage', text: "首席中文:О, посмотри те ка, кто пришёл!" },
                            { type: "textMessage", text: "首席中文:Наш последний участник!" },
                            {type:"walk",who:"hero",direction:"left"},
                            {type:"stand",who:"hero",direction:"down"},
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "walk", who: "dad", direction: "up" },
                            { type: "textMessage",text:"Отец:Извините, что задержался. Сами понимаете, каково это - содержать ресторан."},
                            { type: "textMessage",text:"首席中文:Да, это Jīngdiǎn de! Ну, ничего страшного. Раз уж все в сборе, начинаем!"},
                            { type: "textMessage",text:"首席中文:Четыре участника, но победитель выйдет один! Да победит сильнейший!"},
                            { type: "textMessage",text:"Вы:Постойте..ОТЕЦ?! Что ты то тут делаешь?"},
                            { type: "textMessage",text:"首席中文:Оставьте свои семейные дела у себя! Мы тут все ради зрелища битв!"},
                            { type: "textMessage",text:"首席中文:Хотя драма вышла бы великолепной."},
                            { type: "textMessage",text:"首席中文:Так или иначе, сейчас Куппер Младший будет в противостоянии с Чарли!"},
                            { type: "textMessage",text:"首席中文:Это будет справедливо, ведь они оба примерно одинаково сильны."},
                            { type: "textMessage",text:"首席中文:Kāishǐ ba!"},
                            {type:"walk",who:"charlie",direction:"right"},
                            {type:"walk",who:"charlie",direction:"right"},
                            {type:"walk",who:"charlie",direction:"right"},
                            {type:"walk",who:"charlie",direction:"right"},
                            {type:"walk",who:"charlie",direction:"right"},
                            {type:"walk",who:"charlie",direction:"right"},
                            {type:"walk",who:"charlie",direction:"right"},
                            {type:"walk",who:"charlie",direction:"right"},
                            {type:"walk",who:"charlie",direction:"right"},
                            {type:"stand",who:"charlie",direction:"down"},
                            {type:"walk",who:"dad",direction:"right"},
                            {type:"walk",who:"dad",direction:"right"},
                            {type:"walk",who:"dad",direction:"right"},
                            {type:"walk",who:"dad",direction:"right"},
                            {type:"walk",who:"dad",direction:"right"},
                            {type:"walk",who:"dad",direction:"right"},
                            {type:"walk",who:"dad",direction:"up"},
                            {type:"walk",who:"dad",direction:"up"},
                            {type:"stand",who:"dad",direction:"down"},
                            {type:"walk",who:"hero",direction:"down"},
                            {type:"walk",who:"hero",direction:"right"},
                            {type:"walk",who:"hero",direction:"right"},
                            {type:"walk",who:"hero",direction:"right"},
                            {type:"walk",who:"hero",direction:"down"},
                            {type:"walk",who:"hero",direction:"down"},
                            {type:"walk",who:"hero",direction:"right"},
                            {type:"walk",who:"hero",direction:"right"},
                            {type:"stand",who:"hero",direction:"up"},
                            {type:"textMessage",text:"Чарли:Н-ну главное, что я участвовала.."},
                            {type:"textMessage",text:"Чарли:Ты меня 100% победишь!"},
                            {type:"addStoryFlag",flag:"LOSS_CHARLIE"},
                            {type:"battle",enemyId:"charlie"},
                            {type:"addStoryFlag",flag:"WON_CHARLIE"},
                            {type:"textMessage",text:"Чарли:Это было очевидно :("},
                            {type:"textMessage",text:"Чарли:Надеюсь я была хорошим соперником!"},
                            {type:"textMessage",text:"Чарли:Удачи в следующем раунде!"},
                        ]
                    },
                    {
                        required: ["2"],
                        events: [
                            { type: 'textMessage', text: "Вы:Почему я не знал, что моим противником будет Де Рубильдо?!" },
                            { type: 'textMessage', text: "首席中文:Ой! Ну в этом турнире тогда же не было бы ни капли Xìngqù!" },
                            { type: 'textMessage', text: "首席中文:Вообще, не сомневайся в себе!" },
                            { type: 'textMessage', text: "首席中文:Рубильдо может и 10-кратный чемпион по Пицца-битвам, но все люди проигрывают." },
                            { type: 'textMessage', text: "首席中文:Рано или поздно... Ну, ты лучше помолись, наверное." },
                            { type: "addStoryFlag", flag: "3" }
                        ]
                    },
                    {
                        required: ["1"],
                        events: [
                            { type: 'textMessage', text: "首席中文:Всё ещё ждём..." }
                        ]
                    },
                    {
                        required: ["CHEESE_EAT2"],
                        events: [
                            { type: "textMessage", text: "首席中文:Что-ж, мы пока ждём последнего участника." },
                            { type: "textMessage", text: "首席中文:Раз ты уже наелся сыра, можешь пообщаться с кем-нибудь." },
                            { type: "textMessage", text: "首席中文:В общем, займись чем нибудь." },
                            { type: "addStoryFlag", flag: "1" }
                        ]
                    },
                    {
                        events:
                            [
                                { type: "textMessage", text: "首席中文:Что-ж, мы пока ждём последнего участника." },
                                { type: "textMessage", text: "首席中文:Ты пока можешь пообщаться с кем-нибудь." },
                                { type: "textMessage", text: "首席中文:Или набраться сил перед боем, вкусив сыр!" },
                                { type: "textMessage", text: "首席中文:В общем, займись чем нибудь." },
                                { type: "addStoryFlag", flag: "1" }
                            ]
                    }
                ]
            },
            charlie: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(10),
                y: utils.withGrid(17),
                src: "/images/characters/people/npc4.png",
                direction: "down",
                behaviorLoop: [
                    { type: "stand", time: 800, direction: "down" }
                ],
                talking: [
                    {
                        required:["LOSS_CHARLIE"],
                        events:[
                            {type:'textMessage',text:"Чарли:Ого! Не думала, что я смогу это сделать! Хаха!"},
                            {type:'textMessage',text:"Чарли:Правда, скорее всего, я проиграю в следующем раунде.."},
                            {type:'textMessage',text:"Чарли:Но всё равно, хотя-бы не всухую!"},
                        ]
                    },
                    {
                        required: ["4"],
                        events: [
                            { type: "textMessage", text: "Чарли:Сыр классный 0_0" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Чарли:П-привет!", faceHero: "charlie" },
                            { type: "textMessage", text: "Чарли:Т-ты тоже участвуешь, да?" },
                            { type: "textMessage", text: "Чарли:Круто! А меня мама записала сюда... Говорит, чтобы чем-нибудь полезным занялась.." },
                            { type: "textMessage", text: "Чарли:Ещё мне так нравится этот сыр.. Он заставляет меня чувствовать себя..крутой!" },
                            { type: "addStoryFlag", flag: "4" }
                        ]
                    }
                ]
            },
            cheese: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(10),
                y: utils.withGrid(19),
                src: "/images/characters/cheese.png",
                talking: [
                    {
                        required: ["CHEESE_EAT2"],
                        events: [
                            { type: 'textMessage', text: "Вы решаете воздержаться от сыра!" }
                        ]
                    },
                    {
                        required: ["CHEESE_EAT1"],
                        events: [
                            { type: "textMessage", text: "Вы решаете вкусить ещё один кусочек этого сыра..." },
                            { type: "textMessage", text: "Что-то вам нехорошо..." },
                            { type: "addStoryFlag", flag: "CHEESE_EAT2" }
                        ]
                    },
                    {
                        events: [
                            { type: 'textMessage', text: "Вы вкушаете блаженство этого огромного куска сыра." },
                            { type: 'textMessage', text: "Просто великолепно!" },
                            { type: "addStoryFlag", flag: "CHEESE_EAT1" },
                        ]
                    }
                ]
            },
            china_guy3: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(14),
                y: utils.withGrid(15),
                src: "/images/characters/people/china_guy1.png"
            },
            china_guy4: {
                type: "Person",
                useShadow: true,
                x: utils.withGrid(16),
                y: utils.withGrid(15),
                src: "/images/characters/people/china_guy3.png"
            },
            de_rubildo: {
                type: 'Person',
                useShadow: true,
                x: utils.withGrid(20),
                y: utils.withGrid(16),
                src: "/images/characters/people/erio.png",
                talking: [
                    {
                        required: ["2"],
                        events: [
                            { type: "textMessage", text: "Де Рубильдо:С таким дилетантом как ты, это будет легчайшая для меня победа!" }
                        ]
                    },
                    {
                        events: [
                            { type: 'textMessage', text: "Де Рубильдо:Ого! КОГО Я ВИЖУ? Давно не виделись!" },
                            { type: 'textMessage', text: "Де Рубильдо:Не думал, что ты осмелишься пойти на турнир!" },
                            { type: 'textMessage', text: "Де Рубильдо:Спорю, ты не знал, что я буду твоим оппонентом! Хаха!" },
                            { type: 'textMessage', text: "Де Рубильдо:Я бы пожелал тебе удачи, но она тебе не поможет!!" },
                            { type: 'addStoryFlag', flag: "2" }
                        ]
                    }
                ]
            }
        },
        walls: {
            [utils.asGridCoord(14, 25)]: true,
            [utils.asGridCoord(13, 25)]: true,
            [utils.asGridCoord(12, 25)]: true,
            [utils.asGridCoord(11, 25)]: true,
            [utils.asGridCoord(10, 25)]: true,
            [utils.asGridCoord(9, 25)]: true,
            [utils.asGridCoord(8, 25)]: true,
            [utils.asGridCoord(9, 23)]: true,
            [utils.asGridCoord(9, 22)]: true,
            [utils.asGridCoord(15, 13)]: true,
            [utils.asGridCoord(9, 21)]: true,
            [utils.asGridCoord(9, 20)]: true,
            [utils.asGridCoord(9, 19)]: true,
            [utils.asGridCoord(9, 18)]: true,
            [utils.asGridCoord(9, 17)]: true,
            [utils.asGridCoord(8, 16)]: true,
            [utils.asGridCoord(9, 16)]: true,
            [utils.asGridCoord(10, 16)]: true,
            [utils.asGridCoord(11, 16)]: true,
            [utils.asGridCoord(11, 15)]: true,
            [utils.asGridCoord(12, 14)]: true,
            [utils.asGridCoord(13, 14)]: true,
            [utils.asGridCoord(14, 14)]: true,
            [utils.asGridCoord(16, 14)]: true,
            [utils.asGridCoord(17, 14)]: true,
            [utils.asGridCoord(18, 14)]: true,
            [utils.asGridCoord(19, 15)]: true,
            [utils.asGridCoord(20, 15)]: true,
            [utils.asGridCoord(21, 15)]: true,
            [utils.asGridCoord(8, 23)]: true,
            [utils.asGridCoord(7, 24)]: true,
            [utils.asGridCoord(23, 23)]: true,
            [utils.asGridCoord(22, 15)]: true,
            [utils.asGridCoord(23, 15)]: true,
            [utils.asGridCoord(22, 16)]: true,
            [utils.asGridCoord(22, 17)]: true,
            [utils.asGridCoord(22, 18)]: true,
            [utils.asGridCoord(22, 19)]: true,
            [utils.asGridCoord(22, 20)]: true,
            [utils.asGridCoord(22, 21)]: true,
            [utils.asGridCoord(22, 22)]: true,
            [utils.asGridCoord(22, 23)]: true,
            [utils.asGridCoord(24, 24)]: true,
            [utils.asGridCoord(23, 25)]: true,
            [utils.asGridCoord(22, 25)]: true,
            [utils.asGridCoord(9, 24)]: true,
            [utils.asGridCoord(22, 24)]: true,
            [utils.asGridCoord(21, 25)]: true,
            [utils.asGridCoord(20, 25)]: true,
            [utils.asGridCoord(19, 25)]: true,
            [utils.asGridCoord(18, 25)]: true,
            [utils.asGridCoord(17, 25)]: true,
            [utils.asGridCoord(16, 25)]: true,
            [utils.asGridCoord(23, 25)]: true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(15, 25)]:
                [
                    {
                        events: [
                            { type: "textMessage", text: "Вы:Ну, мне нечего там делать..." },
                            { type: "textMessage", text: "Вы:Турнир - мой последний шанс." },
                            { type: "walk", who: "hero", direction: "up" }
                        ]
                    }
                ],
            [utils.asGridCoord(15, 14)]:
                [
                    {
                        events: [
                            { type: "textMessage", text: "Вы:Ну, мне нечего там делать..." },
                            { type: "textMessage", text: "Вы:Турнир - мой последний шанс." },
                            { type: "walk", who: "hero", direction: "down" }
                        ]
                    }
                ]

        }
    },
}