let wasteItems = {
  easy: [
    { name: "Botella de plástico", type: "plastico" },
    { name: "Cáscara de plátano", type: "organico" },
    { name: "Periódico", type: "papel" },
    { name: "Lata de refresco", type: "metal" },
    { name: "Pila usada", type: "electronico" }
  ]
};

let bins = [
  { type: "plastico", x: 100, color: "#F44336" },
  { type: "organico", x: 250, color: "#4CAF50" },
  { type: "papel", x: 400, color: "#FFC107" },
  { type: "metal", x: 550, color: "gray" },
  { type: "electronico", x: 700, color: "rgb(159,45,159)" }
];

let player = { hp: 10 };
let enemy = { hp: 10 };
let currentWaste;
let round = 1;
let maxRounds = 10;
let gameOver = false;
let gameState = "intro"; // Se inicia en la introducción
let levels = [
  { x: 200, y: 200, active: true },
  { x: 400, y: 200, active: false },
  { x: 600, y: 200, active: false }
];
let currentLevel = -1;

// Introducción del juego
let introText = [
  "Érase una vez, en el planeta Tierra, \n el aire solía ser puro y de ríos cristalinos…",
  "Con el tiempo, las fábricas crecieron, \n los autos llenaron las calles \ny el humo gris se convirtió en parte de la población…",
  "Nadie notó que entre las sombras de los edificios \n y el humo de las chimeneas, \n algo oscuro comenzaba a despertar…"
];

let currentParagraph = 0;
let displayedText = "";
let charIndex = 0;
let textSpeed = 2;
let introFinished = false;
let bgMusic;
let arcadeFont;

function preload() {
  arcadeFont = loadFont("PressStart2P-Regular.ttf");
  bgMusic = loadSound("musicaintro.mp3");
}

function setup() 
{
  createCanvas(800, 400);
  textAlign(CENTER, CENTER);
  textFont(arcadeFont || "Arial"); 
  userStartAudio(); 
  bgMusic.loop();
}

function draw() {
  background(0); // Fondo negro
  fill(255); // Letras blancas

  if (gameState === "intro") {
    drawIntro();
  } else if (gameState === "mapa") {
    drawMap();
  } else if (gameState === "nivel") {
    drawLevel();
  }
}

function drawIntro() {
  textSize(16);
  fill(255);

  if (charIndex < introText[currentParagraph].length) {
    displayedText = introText[currentParagraph].substring(0, charIndex);
    charIndex += textSpeed;
  } else {
    introFinished = true;
    textSize(12);
    text("Haz clic para continuar", width / 2, height / 2 + 40);
  }

  text(displayedText, width / 2, height / 2);
}

function mousePressed() {
  if (!bgMusic.isPlaying()) {
    bgMusic.loop(); // Reproducir música al primer clic
  }

  if (gameState === "intro") {
    if (introFinished) {
      currentParagraph++;
      if (currentParagraph < introText.length) {
        displayedText = "";
        charIndex = 0;
        introFinished = false;
      } else {
        gameState = "mapa";
      }
    }
  } else if (gameState === "mapa") {
    for (let i = 0; i < levels.length; i++) {
      if (
        mouseX > levels[i].x &&
        mouseX < levels[i].x + 50 &&
        mouseY > levels[i].y &&
        mouseY < levels[i].y + 50 &&
        levels[i].active
      ) {
        currentLevel = i;
        gameState = "nivel";
        resetGame();
        pickNewWaste();
      }
    }
  } else if (gameState === "nivel") {
    if (gameOver) {
      if (player.hp > 0 && currentLevel + 1 < levels.length) {
        levels[currentLevel + 1].active = true;
      }
      gameState = "mapa";
    } else {
      // 🔹 Detectar clic en los botes de basura
      for (let bin of bins) {
        if (
          mouseX > bin.x &&
          mouseX < bin.x + 80 &&
          mouseY > 300 &&
          mouseY < 380
        ) {
          checkWaste(bin.type);
        }
      }
    }
  }
}

function drawMap() {
  textSize(20);
  text("Selecciona un nivel", width / 2, 50);
  for (let i = 0; i < levels.length; i++) {
    let level = levels[i];
    fill(level.active ? "green" : "red");
    rect(level.x, level.y, 50, 50);
    fill(255);
    text(i + 1, level.x + 25, level.y + 25);
  }
}

function drawLevel() {
  if (gameOver) {
    textSize(30);
    text(player.hp <= 0 ? "Perdiste!" : "Ganaste!", width / 2, height / 2);
    textSize(20);
    text("Haz clic para volver al mapa", width / 2, height / 2 + 40);
    return;
  }

  for (let bin of bins) {
    fill(bin.color);
    rect(bin.x, 300, 80, 80);
    fill(255);
    text(bin.type.toUpperCase(), bin.x + 40, 340);
  }

  textSize(20);
  text("Round " + round + " / " + maxRounds, width / 2, 30);
  text("Desecho actual:", width / 2, 60);
  text(currentWaste ? currentWaste.name : "Cargando...", width / 2, 90);
  textSize(16);
  text("Player HP: " + player.hp, 100, 20);
  text("Enemy HP: " + enemy.hp, 700, 20);
}

// 🔹 Nueva función para validar la respuesta
function checkWaste(selectedType) 
{
  if (currentWaste && selectedType === currentWaste.type) 
  {
    console.log("¡Correcto! +2 de ataque");
    enemy.hp-=2; // Reducir vida del enemigo si aciertas
  } else 
  {
    console.log("Incorrecto. -2 de vida");
    player.hp-=2; // Reducir vida del jugador si se equivoca
  }

  round++;
  if (round > maxRounds || player.hp <= 0 || enemy.hp <= 0) {
    gameOver = true;
  } else {
    pickNewWaste(); // Elegir un nuevo desecho
  }
}

function pickNewWaste() {
  currentWaste = random(wasteItems.easy);
}

function resetGame() {
  player.hp = 10;
  enemy.hp = 10;
  round = 1;
  gameOver = false;
}
