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
    test:{
        name:"test",
        success:[

        ]
    },
    suicide:{
        name:"Самоубийство",
        targetType:"friendly",
        success:[
            {type: "textMessage", text: "{CASTER} использует {ACTION}!"},
            {type:"stateChange",recover:-100}
        ]
    },
    saucyStatus: {
        name: "Выжимка помидоров :D",
        targetType:"friendly",
        success: [
            {type: "textMessage", text: "{CASTER} использует {ACTION}!"},
            {type: "stateChange", onCaster:true, status:{type: "Соус", expiresIn: 3} },
        ],
        description:"Скушать помидоры.Восстанавливает здоровье.Действует 3 хода"
    },
    mushStatus: {
        name: "Грибной шквал!",
        success: [
            {type: "textMessage", text: "{CASTER} использует {ACTION}!"},
            {type: "stateChange", status:{type: "Соусотечение", expiresIn: 3} },
        ],
        description:"Кинуть во врага грибы!Наносит урон.Действует 3 хода"
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
            {type: "textMessage", text: "{TARGET} вся в масле!"},
        ],
        description: "Бросить во врага масло!!Он может упасть, пропустив свой ход. Действует 3 хода."
    },
    //предметы
    item_recoverStatus: {
        name:"Молоко",
        description:"Чувство свежести и теплоты перенесётся через ваше сознание. Убирает активные эффекты.",
        targetType:"friendly",
        success: [
            {type: "textMessage", text: "{CASTER} пьёт {ACTION}!"},
            {type: "stateChange", status:null },
            {type: "textMessage", text: "Чувствуется молоко!"},
        ],
    },
    item_recoverHp: {
        name: "Бесконечный кусочек сыра",
        description:"Теперь уже конечный. Восстанавливает здоровье.",
        targetType:"friendly",
        success: [
            {type: "textMessage", text:"{CASTER} кушает {ACTION}!"},
            {type: "stateChange", recover:20},
            {type: "textMessage", text: "Чувствуется сыр, {CASTER} восстанавливает здоровье!"},
        ]
    },
    item_recoverHp1: {
        name: "Кусочек сыра",
        description:"Ощущения невообразимости всех исходов событий.Восстанавливает здоровье.",
        targetType:"friendly",
        success: [
            {type: "textMessage", text:"{CASTER} кушает {ACTION}!"},
            {type: "stateChange", recover:5},
            {type: "textMessage", text: "Чувствуется сыр, {CASTER} восстанавливает здоровье!"},
        ]
    }
}