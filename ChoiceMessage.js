class ChoiceMessage {
  constructor({ text, choices, onComplete }) {
    this.text = text;
    this.choices = choices;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    // Создаем элемент сообщения
    this.element = document.createElement("div");
    this.element.classList.add("ChoiceMessage");

    // Добавляем текст сообщения
    const textElement = document.createElement("p");
    textElement.innerText = this.text;
    textElement.classList.add("ChoiceMessage_text")
    this.element.appendChild(textElement);

    // Добавляем кнопки выбора
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("ChoiceMessage_button");
    this.element.appendChild(buttonContainer);

    this.choices.forEach((choice) => {
      const buttonElement = document.createElement("button");
      buttonElement.innerText = choice.text;
      buttonElement.classList.add("ChoiceMessage_button_text")
      buttonElement.addEventListener("click", () => {
        console.log("нажатие")
        this.handleChoice(choice);
        this.done()
      });
      buttonContainer.appendChild(buttonElement);
    });
  }

  done() {
    this.element.remove();
    this.onComplete();
  }

  showTextMessage(text) {
    const message = new TextMessage({
      text,
      onComplete: () => { }
    });
  }



  handleChoice(choice) {
    // выполняем каждое действие из массива actions
    choice.actions.forEach(action => {
      if (action.type === "textMessage") {
        const message = new TextMessage({
          text: action.text,
          onComplete: () => {

          }
        });
        message.init(document.querySelector(".game-container"));
      }
    });
  }


  

  choiceMessage(resolve, choices, handleChoice) {
    const message = new ChoiceMessage({
      choices: choices,
      onChoice: (choice) => {
        handleChoice(choice);
        this.done();
        resolve();
        message.remove();
      }
    });

    message.init(document.querySelector(".game-container"));
  }



  init(container) {
    this.createElement();
    container.appendChild(this.element);
  }
}