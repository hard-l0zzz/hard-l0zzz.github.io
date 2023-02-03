class LootMenu {
    constructor({ items, onComplete}) {
      this.items = items;
      this.onComplete = onComplete;
    }
  
    getOptions() {
      return this.items.map(id => {
        const base = Actions[id];
        return {
          label: base.name,
          description: base.description,
          handler: () => {
            playerState.addItem(id);
            this.close();
          }
        }
      })
    }
  
    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("LootMenu");
      this.element.classList.add("overlayMenu");
      this.element.innerHTML = (`
        <h2>Взять предмет</h2>
      `)
    }
  
    close() {
      this.keyboardMenu.end();
      this.element.remove();
      this.onComplete();
    }
  
  
    init(container) {
      this.createElement();
      this.keyboardMenu = new KeyboardMenu({
        descriptionContainer: container
      })
      this.keyboardMenu.init(this.element)
      this.keyboardMenu.setOptions(this.getOptions())
  
      container.appendChild(this.element);
    }
  }