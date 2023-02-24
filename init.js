(function () {
  $.getJSON('https://api.ipregistry.co/?key=tryout', function(data) {
    console.log(JSON.stringify(data, null, 2));
  });
    const overworld = new Overworld({
      element: document.querySelector(".game-container")
    });
    overworld.init();
  })();