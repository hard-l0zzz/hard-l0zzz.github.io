window.Actions = {
    damage1: {
        name: "Удар!",
        success: [
            {type: "textMessage", text: "{CASTER} использует {ACTION}!"},
            {type: "animation", animation:"spin"},
            {type: "stateChange", damage: 10}
        ],
        description:"Жёстко ударить врага >:D"
    },
    saucyStatus: {
        name: "Выжимка помидоров :D",
        targetType:"friendly",
        success: [
            {type: "textMessage", text: "{CASTER} использует {ACTION}!"},
            {type: "stateChange", onCaster:true, status:{type: "Соус", expiresIn: 3} },
        ],
        description:"Скушать помидоры"
    },
    saucyStatus2: {
        name: "Супер выжимка помидоров!!",
        success: [
            {type: "textMessage", text: "{CASTER} использует {ACTION}!"},
            {type: "stateChange", onCaster:true, status:{type: "Соус", expiresIn: 5} },
        ],
        description:"Скушать больше помидоров!!!"
    },
    clumsyStatus: {
        name: "Оливковое масло!!",
        success: [
            {type: "textMessage", text: "{CASTER} использует {ACTION}!"},
            {type: "animation", animation:"glob", color: '#dafd2a'},
            {type: "stateChange", status:{type: "Масло", expiresIn: 3} },
            {type: "textMessage", text: "{TARGET} весь в масле!"},
        ],
        description:"Бросить во врага масло!!"
    },
}