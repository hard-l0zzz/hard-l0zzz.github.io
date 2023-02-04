class PauseMenu {
    constructor({progress, onComplete}) {
      this.progress = progress;
      this.onComplete = onComplete;
    }
  
    getOptions(pageKey) {
  
      //Case 1: Show the first page of options
      if (pageKey === "root") {
        const lineupPizzas = playerState.lineup.map(id => {
          const {pizzaId} = playerState.pizzas[id];
          const base = Pizzas[pizzaId];
          return {
            label: base.name,
            description: base.description,
            handler: () => {
              this.keyboardMenu.setOptions( this.getOptions(id) )
            }
          }
        })
        return [
          ...lineupPizzas,
          {
            label: "Сохранение",
            description: "Сохранить прогресс игры.",
            handler: () => {
              this.progress.save();
              this.close();
            }
          },
          {
            label:"Музыка",
            description:"Включить или выключить музыку.",
            handler:() => {
              var myaudio = document.getElementById("myaudio");
              myaudio.volume = 0.42
              if(myaudio.paused == true){
                document.getElementById("myaudio").play();
                label.innerHTML = "Включить музыку"
              }
              if(myaudio.paused == false){
                document.getElementById("myaudio").pause();
              }
            }
          },
          {
            label: "Закрыть",
            description: "Закрыть меню.",
            handler: () => {
              this.close();
            }
          }
        ]
      }
  
      //Case 2: Show the options for just one pizza (by id)
      const unequipped = Object.keys(playerState.pizzas).filter(id => {
        return playerState.lineup.indexOf(id) === -1;
      }).map(id => {
        const {pizzaId} = playerState.pizzas[id];
        const base = Pizzas[pizzaId];
        return {
          label: `Поменять на ${base.name}`,
          description: base.description,
          handler: () => {
            playerState.swapLineup(pageKey, id);
            this.keyboardMenu.setOptions( this.getOptions("root") );
          }
        }
      })
  
      return [
        ...unequipped,
        {
          label: "Поставить наверх",
          description: "Поставить пиццу первой.",
          handler: () => {
            playerState.moveToFront(pageKey);
            this.keyboardMenu.setOptions( this.getOptions("root") );
          }
        },
        {
          label: "Назад",
          description: "Назад",
          handler: () => {
            this.keyboardMenu.setOptions( this.getOptions("root") );
          }
        }
      ];
    }
  
    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("PauseMenu");
      this.element.classList.add("overlayMenu");
      this.element.innerHTML = (`
        <h2>Пауза</h2>
      `)
    }
  
    close() {
      this.esc?.unbind();
      this.keyboardMenu.end();
      this.element.remove();
      this.onComplete();
    }
  
    async init(container) {
      this.createElement();
      this.keyboardMenu = new KeyboardMenu({
        descriptionContainer: container
      })
      this.keyboardMenu.init(this.element);
      this.keyboardMenu.setOptions(this.getOptions("root"));
  
      container.appendChild(this.element);
  
      utils.wait(200);
      this.esc = new KeyPressListener("Escape", () => {
        this.close();
      })
    }
  
  }