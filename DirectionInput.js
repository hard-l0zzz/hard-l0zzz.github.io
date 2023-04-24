class DirectionInput{
    constructor() {
        this.heldDirections = [];

        this.map = {
            "KeyW": "up",
            "KeyS": "down",
            "KeyA": "left",
            "KeyD": "right",
            "ArrowUp": "up",
            "ArrowDown": "down",
            "ArrowLeft": "left",
            "ArrowRight": "right",
        }

    }

    get direction(){
        return this.heldDirections[0];
    }

    init() {
        document.addEventListener("keydown", e => {
            const dir = this.map[e.code];
            if(dir && this.heldDirections.indexOf(dir) === -1) {
                this.heldDirections.unshift(dir);
            }
        });
        document.addEventListener("keyup", e => {
            const dir = this.map[e.code];
            const index = this.heldDirections.indexOf(dir);
            if(index > -1) {
                this.heldDirections.splice(index, 1);
            } 
        })
        
    }




}