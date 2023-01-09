class KeyboardMenu {
    constructor() {
      this.options = []; //set by updater method
      this.up = null;
      this.down = null;
      this.prevFocus = null;
      this.select = null;
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
  
      //Description box element
      this.descriptionElement = document.createElement("div");
      this.descriptionElement.classList.add("DescriptionBox");
      this.descriptionElement.innerHTML = (`<p>I will provide information!</p>`);
      this.descriptionElementText = this.descriptionElement.querySelector("p");
    }
  
    end() {
  
      //Remove menu element and description element
      this.element.remove();
      this.descriptionElement.remove();
  
      //Clean up bindings
      this.up.unbind();
      this.down.unbind();
      this.select.unbind();
    }
  
    init(container) {
      this.createElement();
      container.appendChild(this.descriptionElement);
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