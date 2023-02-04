class TitleScreen {
    constructor({ progress }) {
      this.progress = progress;
    }
  
    getOptions(resolve) {
      const safeFile = this.progress.getSaveFile();
      return [
        { 
          label: "Новая игра",
          description: "Начать новое эпик приключение!",
          handler: () => {
            const sceneTransition = new SceneTransition();
            sceneTransition.init(document.querySelector(".game-container"), () => {
              this.close();
              resolve();
              sceneTransition.fadeOut();
            })
          }
        },
        safeFile ? {
          label: "Продолжить игру",
          description: "Продолжить эпик приключение.",
          handler: () => {
            const sceneTransition = new SceneTransition();
            sceneTransition.init(document.querySelector(".game-container"), () => {
              this.close();
              resolve(safeFile);
              sceneTransition.fadeOut();
            })
          }
        } : null
      ].filter(v => v);
    }
  
    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("TitleScreen");
      this.element.innerHTML = (`
        <img class="TitleScreen_logo" src="/images/logo.png" alt="Pizza Legends" />
      `)
  
    }
  
    close() {
      this.keyboardMenu.end();
      this.element.remove();
    }
    
    init(container) {
      return new Promise(resolve => {
        this.createElement();
        container.appendChild(this.element);
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions(resolve))
      })
    }
  
  }