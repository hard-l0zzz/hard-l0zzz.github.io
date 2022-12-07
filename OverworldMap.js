class OverworldMap{
    constructor(config) {
        this.gameObjects = config.gameObjects;
        this.walls = config.walls || {};
        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;
        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;
    }

    drawLowerImage(ctx,cameraPerson){
        ctx.drawImage(this.lowerImage,
        utils.withGrid(5.5) - cameraPerson.x,
        utils.withGrid(5.5) - cameraPerson.y)
    }

    drawUpperImage(ctx,cameraPerson) {
        ctx.drawImage(this.upperImage,
        utils.withGrid(5.5) - cameraPerson.x,
        utils.withGrid(5.5) - cameraPerson.y)
    }

    isSpaceTaken(currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX,currentY,direction)
        return this.walls[`${x},${y}`] || false;
    }

    mountObjects(){
        Object.values(this.gameObjects).forEach(o => {
            o.mount(this);
        })
    }



    addWall(x,y){
        this.walls[`${x},${y}`] = true;
    }
    removeWall(x,y){
        delete this.walls[`${x},${y}`];
    }
    moveWall(wasX,wasY,direction){
        this.removeWall(wasX,wasY);
        const{x,y} = utils.nextPosition(wasX,wasY,direction);
        this.addWall(x,y);
    }

}





window.OverworldMaps = {
    DemoRoom: {
        lowerSrc: "/images/maps/DemoLower.png",
        upperSrc: "/images/maps/DemoUpper.png",
        gameObjects: {
            hero: new Person({
            isPlayerControlled: true,
            x:utils.withGrid(5),
            y:utils.withGrid(6)
            }),
            cat: new Person({
                x:utils.withGrid(7),
                y: utils.withGrid(9),
                src:"/images/characters/hero.png"
            })
        },
        walls:{
           [utils.asGridCoord(7,6)]:true,
           [utils.asGridCoord(8,6)]:true,
           [utils.asGridCoord(7,7)]:true,
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
        }

        
    },
    Kitchen: {
        lowerSrc: "/images/maps/KitchenLower.png",
        upperSrc: "/images/maps/KitchenUpper.png",
        gameObjects: {
            hero: new Person({
            x:3,
            y:1
            }),
            cat: new GameObject({
                x:9,
                y:2,
                src:"/images/characters/hero.png"
            }),
            npc1: new GameObject({
                x:7,
                y:5,
                src:"/images/characters/people/npc1.png"
            })
        }
    }
}