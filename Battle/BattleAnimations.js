window.BattleAnimations = {
    async spin(event, onComplete) {
        const element = event.caster.pizzaElement;
        const animationClassName = event.caster.team === "player" ? "battle-spin-right" : "battle-spin-left";
        element.classList.add(animationClassName);
        
        element.addEventListener("animationend", () => {
            element.classList.remove(animationClassName);
        }, {once:true});

        await utils.wait(100);
        onComplete();
    },

    async jump(event, onComplete){
      const element = event.caster.pizzaElement;
      const animationClassName = event.caster.team === "player" ? "battle-jump-right" : "battle-jump-left";
      element.classList.add(animationClassName);
      element.addEventListener("animationend", () => {
        element.classList.remove(animationClassName);
    }, {once:true});

    await utils.wait(600);
    onComplete();
    },

    async fireBlast(event,onComplete){
      const element = event.caster.pizzaElement;
      const animationClassName = event.caster.team === "player" ? "battle-blast-right" : "battle-blast-left";
      element.classList.add(animationClassName);
      element.addEventListener("animationend", () => {
        element.classList.remove(animationClassName);
    }, {once:true});

    const {caster} = event;
    let div = document.createElement("div");
    div.classList.add("blast-element");
    div.classList.add(caster.team === "player" ? "battle-blast-projectile-left" : "battle-blast-projectile-right");

    div.innerHTML = (`
      <svg viewBox="0 0 64 64" width="64" height="64">
        <circle cx="32" cy="32" r="32" fill="${event.color}" />
      </svg>
    `);
    document.getElementById("boom").play();
    div.addEventListener("animationend", () => {
      div.remove();
    });
    document.querySelector(".Battle").appendChild(div);


    await utils.wait(700);
    onComplete();
    },

    async sauce(event, onComplete) {
      const {caster} = event;
      let div = document.createElement("div");
      div.classList.add("sauce-element");
      div.classList.add(caster.team === "player" ? "battle-sauce-left" : "battle-sauce-right");
  
      div.innerHTML = (`
        <svg viewBox="0 0 36 36" width="36" height="36">
          <circle cx="18" cy="18" r="18" fill="${event.color}" />
        </svg>
      `);
  

      div.addEventListener("animationend", () => {
        div.remove();
      });
  
      document.querySelector(".Battle").appendChild(div);
      await utils.wait(820);
      onComplete();
    },
    
    async glob(event, onComplete) {
      const {caster} = event;
      let div = document.createElement("div");
      div.classList.add("glob-orb");
      div.classList.add(caster.team === "player" ? "battle-glob-right" : "battle-glob-left");
  
      div.innerHTML = (`
        <svg viewBox="0 0 32 32" width="32" height="32">
          <circle cx="16" cy="16" r="16" fill="${event.color}" />
        </svg>
      `);
  
      //Удалить класс после завершения анимации
      div.addEventListener("animationend", () => {
        div.remove();
      });
  
      //Добавить на сцену
      document.querySelector(".Battle").appendChild(div);
  
      await utils.wait(820);
      onComplete();
    }
  }