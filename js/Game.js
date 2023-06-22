class Game {
  constructor() {
    this.reset = createButton("");
    this.resetTitle = createElement("h2");

    this.leaderBoardTitle = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function (data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state,
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("carro1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("carro2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    // C38 AP
    fuels = new Group();
    powerCoins = new Group();

    // Adicione o sprite de combustível ao jogo
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adicione o sprite de moeda ao jogo
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);
  }

  // C38 AP
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      x = random(width / 2 + 150, width / 2 - 150);
      y = random(-height * 4.5, height - 400);

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(5, 5);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.position(width / 2 + 200, 10);
    this.resetTitle.html("Reiniciar");
    this.resetTitle.class("resetText");

    this.reset.position(width / 2 + 220, 60);
    this.reset.class("resetButton");

    this.leaderBoardTitle.position(width / 3 - 50, 10);
    this.leaderBoardTitle.html("Placar");
    this.leaderBoardTitle.class("resetText");

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 30);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 60);
  }

  play() {
    this.handleElements();
    this.resetGame();
    Player.getPlayersInfo();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showLeaderBoard();

      //índice da matriz
      var index = 0;
      for (var plr in allPlayers) {
        //adicione 1 ao índice para cada loop
        index = index + 1;

        //use os dados do banco de dados para exibir os carros nas direções x e y
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        // C38  AA
        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          camera.position.y = cars[index - 1].position.y;

          this.handleFuel(index);
          this.handlePowerCoins(index);
        }
      }

      // manipulação dos eventos do teclado
      if (keyIsDown(UP_ARROW)) {
        player.positionY += 10;
        player.update();
      }
      if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
        player.positionX -= 5;
        player.update();
      }
      if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 270) {
        player.positionX += 5;
        player.update();
      }

      drawSprites();
    }
  }

  handleFuel(index) {
    // Adicione o combustível
    cars[index - 1].overlap(fuels, function (collector, collected) {
      player.fuel = 185;
      //collected (coletado) é o sprite no grupo de colecionáveis que desencadeia
      //o evento
      collected.remove();
    });
  }

  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function (collector, collected) {
      player.score += 10;
      player.update();
      //collected (coletado) é o sprite no grupo de colecionáveis que desencadeia
      //o evento
      collected.remove();
    });
  }
  resetGame() {
    this.reset.mousePressed(() => {
      database.ref("/").set({
        gameState: 0,
        playerCount: 0,
        players: {},
      });
      //atualizar a pagina
      location.reload();
    });
  }

  showLeaderBoard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);

    if ((players[0].rank === 0 && players[1].rank === 0) || players[0] === 1) {
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }
    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }
}
