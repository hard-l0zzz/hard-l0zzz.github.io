class KeyboardMenu {
    constructor(config = {}) {
      this.options = []; 
      this.up = null;
      this.down = null;
      this.prevFocus = null;
      this.select = null;
      this.descriptionContainer = config.descriptionContainer || null;
    }
  
    setOptions(options) {
      this.options = options;
      this.element.innerHTML = this.options.map((option, index) => {
        const disabledAttr = option.disabled ? "disabled" : "";
        return (`
          <div class="option">
            <button ${disabledAttr} data-button="${index}" data-description="${option.description}">
              ${option.label}
            </button>
            <span class="right">${option.right ? option.right() : ""}</span>
          </div>
        `)
      }).join("");
  
      this.element.querySelectorAll("button").forEach(button => {
  
        button.addEventListener("click", () => {
          const chosenOption = this.options[ Number(button.dataset.button) ];
          chosenOption.handler();
        })
        button.addEventListener("keyup", () => {
            if (event.keyCode === 69){
                const chosenOption = this.options[ Number(button.dataset.button) ];
                // var buttonSound
                chosenOption.handler();
            }
        })
        button.addEventListener("mouseenter", () => {
          button.focus();
        })
        button.addEventListener("focus", () => {
          this.prevFocus = button;
          this.descriptionElementText.innerText = button.dataset.description;
        })
      })
  
      setTimeout(() => {
        this.element.querySelector("button[data-button]:not([disabled])").focus();
      }, 10)
  
      
  
  
    }
  
    createElement() {
      this.element = document.createElement("div");
      this.element.classList.add("KeyboardMenu");
  
      //место с описанием
      this.descriptionElement = document.createElement("div");
      this.descriptionElement.classList.add("DescriptionBox");
      this.descriptionElement.innerHTML = (`<p>тут должна быть информация!</p>`);
      this.descriptionElementText = this.descriptionElement.querySelector("p");
    }
  
    end() {
  
      //убрать меню и описание
      this.element.remove();
      this.descriptionElement.remove();
  
      this.up.unbind();
      this.down.unbind();
      this.select.unbind();
    }
  
    init(container) {
      this.createElement();
      (this.descriptionContainer || container).appendChild(this.descriptionElement);
      container.appendChild(this.element);
  
      this.up = new KeyPressListener("KeyW", () => {
        const current = Number(this.prevFocus.getAttribute("data-button"));
        const prevButton = Array.from(this.element.querySelectorAll("button[data-button]")).reverse().find(el => {
          return el.dataset.button < current && !el.disabled;
        })
        prevButton?.focus();
      })
      this.down = new KeyPressListener("KeyS", () => {
        const current = Number(this.prevFocus.getAttribute("data-button"));
        const nextButton = Array.from(this.element.querySelectorAll("button[data-button]")).find(el => {
          return el.dataset.button > current && !el.disabled;
        })
        nextButton?.focus();
      })
      this.select = new KeyPressListener("KeyE", () => {

      })
    }
  
  }