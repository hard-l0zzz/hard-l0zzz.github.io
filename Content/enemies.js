window.Enemies = {
     "erio":{
        name:"Эрио",
        src:"/images/characters/people/erio.png",
        pizzas:{
            "a":{
                pizzaId:"s002",
                maxHp:50,
                level:1,
            },
            "b":{
                pizzaId:"v002",
                maxHp: 50,
                level:1,
            }
        }
    },
    "jack":{
        name:"Джек",
        src:"/images/characters/people/npc5.png"
    },
    "MainChinaGuy":{
        name:"首席中文",
        src:"/images/characters/people/main_china_guy.png",
        pizzas:{
            "a":{
                pizzaId: "s002",
                maxHp:1,
                level:5,
                damageMultiplier: 2, // урон в два раза больше обычного
            },
        },
      },      
    "beth":{
        name:"Бетт",
        src:"/images/characters/people/npc1.png",
        pizzas:{
            "a":{
                pizzaId:"f001",
                maxHp:50,
                level:1,
                //attackBonus: 20000,
                //.........
            }
        }
    },
    "cat":{
        name:"Кот",
        src:"images/characters/hero.png",
        pizzas:{
            "a":{
                pizzaId:"s001",
                maxHp:1,
                level:1,
            },
        }
    },
    "babka":{
        name:"Бабка",
        src:"images/characters/people/npc4.png",
        pizzas:{
            "a":{
                pizzaId:"s002",
                maxHp:1,
                level:2
            },
            "b":{
                pizzaId:"stepalox",
                maxHp:1,
                level:1
            }
        }
    },
    "lizard":{
        name:"Ящерка",
        src:"/images/characters/people/lizard_girl.png",
        pizzas:{
            "a":{
                pizzaId:"stepalox",
                maxHp:35,
                level:-99,
            },
            // "b":{
            //     pizzaId:"f001",
            //     maxHp:1,
            //     level:1,
            // },
            // "c":{
            //     pizzaId:"f001",
            //     maxHp:1,
            //     level:1,
            // },
            // "d":{
            //     pizzaId:"f001",
            //     maxHp:1,
            //     level:1,
            // },
        }
    }
}
