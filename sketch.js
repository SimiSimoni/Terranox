let arcadeFont;
let bgMusicIntro, bgMusicGame;
let bossMusic1, bossMusic2;
let preBossMusic, bossMusicFinal;
let isPreBattle = false;
let enemyAttacking = false;
let preBattleStep = 0;

const WASTE_ITEMS = {
  easy: [
    { name: "Botella de plástico", type: "plastico" },
    { name: "Cáscara de plátano", type: "organico" },
    { name: "Periódico", type: "papel" },
    { name: "Lata de refresco", type: "metal" },
    { name: "Pila usada", type: "electronico" },
    { name: "Bolsa de plástico", type: "plastico" },
    { name: "Restos de comida", type: "organico" },
    { name: "Revista", type: "papel" },
    { name: "Lata de comida", type: "metal" },
    { name: "Cargador viejo", type: "electronico" }
  ]
};

const BINS = [
  { type: "plastico", x: 0.15, color: "#fc7f23" },
  { type: "organico", x: 0.3, color: "#fc7f23" },
  { type: "papel", x: 0.45, color: "#fc7f23" },
  { type: "metal", x: 0.6, color: "#fc7f23" },
  { type: "electronico", x: 0.75, color: "#fc7f23" }
];

let player = { name: "Jugador", hp: 10 };
let enemy = { hp: 10 };
let currentWaste;
let round = 1;
const MAX_ROUNDS = 10;
let gameOver = false;
let gameState = "intro";
const LEVELS = [
  { x: 0.25, y: 0.5, active: true },
  { x: 0.5, y: 0.5, active: false },
  { x: 0.75, y: 0.5, active: false }
];
let currentLevel = -1;

const INTRO_TEXT = [
  "Érase una vez, en el planeta Tierra, \n el aire solía ser puro y de ríos cristalinos…\n",
  "Con el tiempo, las fábricas crecieron, \n los autos llenaron las calles \ny el humo gris se convirtió en parte de la población…\n",
  "Nadie notó que entre las sombras de los edificios \n y el humo de las chimeneas, \n algo oscuro comenzaba a despertar…\n",
  "Se llamaba TerraNox… ",
  "Nadie se atrevió a hacer algo al respecto, \n quizá por miedo, \n quizá por ignorancia, \n o por desconocer su debilidad…\n",
  "Hasta que llegaste tú…\n La esperanza de todos…\n",
  "Tu tienes las herramientas para hacer algo al respecto…\n Y lo lograrás…\n",
];

let currentParagraph = 0;
let displayedText = "";
let charIndex = 0;
const TEXT_SPEED = 2;
let introFinished = false;
let nameInput, submitButton;

const BOSSES = [
  { name: "RSU", music: null, idleGif: null, attackGif: null, attack: 2 },
  { name: "Avaricia", music: null, idleGif: null, attackGif: null, attack: 3 },
  { name: "TerraNox", music: null, idleGif: null, attackGif: null, maxHp: 20, attack: 4 }
];

function preload() {
  arcadeFont = loadFont("PressStart2P-Regular.ttf");

  bgMusicIntro = loadSound("musicaintro.mp3", onMusicLoad, onMusicError);
  bgMusicGame = loadSound("musicajuego.mp3", onMusicLoad, onMusicError);
  bossMusic1 = loadSound("musicajefeboss1.mp3", onMusicLoad, onMusicError);
  bossMusic2 = loadSound("musicajefeboss2.mp3", onMusicLoad, onMusicError);
  bossMusicFinal = loadSound("finalBossMusic.mp3", onMusicLoad, onMusicError);
  preBossMusic = loadSound("preBattleMusic.mp3", onMusicLoad, onMusicError);

  BOSSES[0].music = bossMusic1;
  BOSSES[1].music = bossMusic2;
  BOSSES[2].music = bossMusicFinal;

  BOSSES[0].idleGif = loadImage("boss1_idle.gif");
  BOSSES[0].attackGif = loadImage("boss1_attack.gif");
  BOSSES[1].idleGif = loadImage("boss2_idle.gif");
  BOSSES[1].attackGif = loadImage("boss2_attack.gif");
  BOSSES[2].idleGif = loadImage("boss3_idle.gif");
  BOSSES[2].attackGif = loadImage("boss3_attack.gif");
}

function setup() {
  createCanvas(windowWidth, windowHeight, P2D);
  textAlign(CENTER, CENTER);

  if (arcadeFont) {
    textFont(arcadeFont);
  } else {
    console.error("La fuente no se cargó correctamente.");
    textFont("Arial");
  }

  userStartAudio();

  if (bgMusicIntro && bgMusicIntro.isLoaded()) {
    bgMusicIntro.loop();
  } else {
    console.error("bgMusicIntro is not loaded properly.");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  fill(255);

  switch (gameState) {
    case "intro":
      drawIntro();
      break;
    case "nameInput":
      drawNameInput();
      break;
    case "mapa":
      drawMap();
      break;
    case "nivel":
      drawLevel();
      break;
  }
}

function drawIntro() {
  textSize(min(width, height) * 0.03); // Responsive text size
  fill(255);
  if (charIndex < INTRO_TEXT[currentParagraph].length) {
    displayedText = INTRO_TEXT[currentParagraph].substring(0, charIndex);
    charIndex += TEXT_SPEED;
  } else {
    textSize(min(width, height) * 0.02); // Responsive text size
    text("Haz clic para continuar", width / 2, height / 2 + 40);
  }

  text(displayedText, width / 2, height / 2);
}

function drawNameInput() {
  background(0);
  textSize(min(width, height) * 0.04); // Responsive text size
  fill(255);
  text("¿Cuál es tu nombre?", width / 2, height * 0.3);

  if (!nameInput) {
    nameInput = createInput("").attribute("placeholder", "Escribe tu nombre...");
    nameInput.size(width * 0.6, height * 0.05);
    nameInput.position(width * 0.2, height * 0.4);
    nameInput.style("font-size", "20px");
    nameInput.style("text-align", "center");
    nameInput.elt.focus();

    submitButton = createButton("Aceptar");
    submitButton.size(width * 0.6, height * 0.05);
    submitButton.position(width * 0.2, height * 0.5);
    submitButton.style("font-size", "20px");

    submitButton.mousePressed(handleSubmitName);
    submitButton.touchStarted(handleSubmitName);

    nameInput.mousePressed(() => nameInput.elt.focus());
    nameInput.touchStarted(() => nameInput.elt.focus());
  }
}

function handleSubmitName() {
  let enteredName = nameInput.value().trim();
  player.name = enteredName || "Jugador";
  nameInput.remove();
  submitButton.remove();
  bgMusicIntro.stop();
  bgMusicGame.loop();
  gameState = "mapa";
}

function mousePressed() {
  console.log('Mouse pressed at:', mouseX, mouseY);
  handleInput(mouseX, mouseY);
}

function touchStarted() {
  console.log('Touch started at:', touchX, touchY);
  handleInput(touchX, touchY);
  return false;
}

function handleInput(x, y) {
  console.log(`handleInput called with x: ${x}, y: ${y}`);
  if (gameState === "intro") {
    handleIntroInput();
  } else if (isPreBattle) {
    handlePreBattleInput();
  } else if (gameState === "mapa") {
    handleMapInput(x, y);
  } else if (gameState === "nivel") {
    handleLevelInput(x, y);
  }
}

function handleIntroInput() {
  console.log("handleIntroInput called");
  if (currentParagraph < INTRO_TEXT.length - 1) {
    currentParagraph++;
    displayedText = "";
    charIndex = 0;
  } else {
    introFinished = true;
    gameState = "nameInput";
    introFinished = false;
    currentParagraph = 0;
  }
}

function handlePreBattleInput() {
  console.log("handlePreBattleInput called");
  preBattleStep++;
  if (preBattleStep === 3) {
    enemy.name = "TerraNox";
    bossMusicFinal.loop();
    isPreBattle = false;
    textSize(min(width, height) * 0.03); // Responsive text size
    text("—Insensato... ¿Crees que puedes detenerme? \n Soy la sombra de la humanidad, \n la consecuencia de su codicia. " +
      "Con cada fábrica que arde,\n con cada río envenenado,\n mi poder crece. " +
      "TÚ no eres rival para mí.", width / 2, height / 2);
    setTimeout(() => {
      gameState = "nivel";
    }, 3000);
  }
}

function handleMapInput(x, y) {
  console.log(`handleMapInput called with x: ${x}, y: ${y}`);
  for (let i = 0; i < LEVELS.length; i++) {
    let levelSize = min(width, height) * 0.1;
    if (
      x > LEVELS[i].x * width &&
      x < LEVELS[i].x * width + width * 0.05 &&
      y > LEVELS[i].y * height &&
      y < LEVELS[i].y * height + height * 0.05 &&
      LEVELS[i].active
    ) {
      console.log(`Level ${i} selected`);
      currentLevel = i;
      gameState = "nivel";
      resetGame();
      pickNewWaste();
    }
  }
}

function handleLevelInput(x, y) {
  console.log(`handleLevelInput called with x: ${x}, y: ${y}`);
  if (gameOver) {
    if (player.hp > 0 && currentLevel + 1 < LEVELS.length) {
      LEVELS[currentLevel + 1].active = true;
    }
    gameState = "mapa";
  } else {
    for (let bin of BINS) {
      if (
        x > bin.x * width &&
        x < bin.x * width + width * 0.1 &&
        y > height * 0.75 &&
        y < height * 0.75 + width * 0.1
      ) {
        console.log(`Bin ${bin.type} selected`);
        checkWaste(bin.type);
      }
    }
  }
}

function drawMap() {
  textSize(min(width, height) * 0.03); // Responsive text size
  text("Selecciona un nivel", width / 2, height * 0.1);
  for (let i = 0; i < LEVELS.length; i++) {
    let level = LEVELS[i];
    fill(level.active ? "green" : "red");
    rect(level.x * width, level.y * height, width * 0.05, height * 0.05);
    fill(255);
    text(i + 1, level.x * width + width * 0.025, level.y * height + height * 0.02);
  }
}

function drawLevel() {
  if (gameOver) {
    textSize(min(width, height) * 0.04); // Responsive text size
    text(player.hp <= 0 ? "Perdiste!" : "Ganaste!", width / 2, height / 2);
    textSize(min(width, height) * 0.03); // Responsive text size
    text("Haz clic para volver al mapa", width / 2, height / 2 + 40);
    return;
  }

  if (isPreBattle) {
    drawPreBattleText();
    return;
  }

  drawBins();
  drawStatus();
  drawEnemy();
}

function drawPreBattleText() {
  textSize(min(width, height) * 0.03); // Responsive text size
  fill(255);
  switch (preBattleStep) {
    case 0:
      text("Estás a punto de hacer historia, \n ¿te encuentras listo para enfrentarte a TerraNox?", width / 2, height / 2);
      break;
    case 1:
      text("El aire es denso, cargado de humo y veneno." +
        "Frente a ti, la colosal silueta de TerraNox se alza," +
        "con su cuerpo hecho de hollín, \n metal corroído y llamas verdes que arden en su interior.\n", width / 2, height / 2);
      break;
    case 2:
      text("Haz clic para continuar la batalla...", width / 2, height / 2 + 40);
      break;
  }
}

function drawBins() {
  for (let bin of BINS) {
    stroke(bin.color);
    strokeWeight(4);
    noFill();
    rect(bin.x * width, height * 0.8, width * 0.12, height * 0.12, 10);
    fill(255);
    noStroke();
    textSize(min(width, height) * 0.02); // Responsive text size
    text(bin.type.toUpperCase(), bin.x * width + width * 0.06, height * 0.85);
  }
}

function drawStatus() {
  textSize(min(width, height) * 0.03); // Responsive text size
  text(`Round ${round} / ${MAX_ROUNDS}`, width / 2, height * 0.05);
  text("Desecho actual:", width / 2, height * 0.15);
  text(currentWaste ? currentWaste.name : "Cargando...", width / 2, height * 0.2);
  textSize(min(width, height) * 0.025); // Responsive text size
  text(`${player.name}'s HP: ${player.hp}`, width * 0.2, height * 0.05);
  text(`${enemy.name}'s HP: ${enemy.hp}`, width * 0.8, height * 0.05);
}

function drawEnemy() {
  let enemyGif = enemyAttacking ? BOSSES[currentLevel].attackGif : BOSSES[currentLevel].idleGif;
  image(enemyGif, width / 2 - width * 0.1, height / 2 - height * 0.2, width * 0.2, height * 0.3);
}

function checkWaste(selectedType) {
  if (currentWaste && selectedType === currentWaste.type) {
    console.log("¡Correcto! +2 de ataque");
    enemy.hp -= 2;
  } else {
    console.log("Incorrecto. -2 de vida");
    player.hp -= 2;
    enemyAttacking = true;
    setTimeout(() => { enemyAttacking = false; }, 500);
  }

  round++;
  if (round > MAX_ROUNDS || player.hp <= 0 || enemy.hp <= 0) {
    gameOver = true;
  } else {
    pickNewWaste();
  }
}

function pickNewWaste() {
  currentWaste = random(WASTE_ITEMS.easy);
}

function resetGame() {
  player.hp = 10;
  enemy.hp = BOSSES[currentLevel].maxHp || 10;
  round = 1;
  gameOver = false;

  bgMusicGame.stop();
  bgMusicIntro.stop();
  bossMusic1.stop();
  bossMusic2.stop();
  preBossMusic.stop();
  bossMusicFinal.stop();

  if (currentLevel >= 0 && currentLevel < BOSSES.length) {
    enemy.name = BOSSES[currentLevel].name;
    idleAnimation = BOSSES[currentLevel].idleGif;
    attackAnimation = BOSSES[currentLevel].attackGif;
    BOSSES[currentLevel].music.loop();
  } else {
    enemy.name = "Enemigo Común";
    idleAnimation = null;
    attackAnimation = null;
    bgMusicGame.loop();
  }
}

function onMusicLoad() {
  console.log("Music loaded correctly");
}

function onMusicError(err) {
  console.error("Error loading music:", err);
}

console.log("Game initialized");
