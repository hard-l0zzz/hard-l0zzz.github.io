class Team {
    constructor(team,name){
        this.team = team;
        this.name = name;
        this.combatants = [];
    }

    createElement(){
        this.element = document.createElement("div");
        this.element.classList.add("Team");
        this.element.setAttribute("data-team", this.team);
        this.combatants.forEach(c => {
            let icon = document.createElement("div");
            icon.setAttribute("data-combatant", c.id);
            
        })
    }

    update(){

    }

    init(container) {

    }
}