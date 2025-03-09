let arcadeFont;
let bgMusicIntro, bgMusicGame;
let bossMusic1, bossMusic2;
let preBossMusic, preBossText, bossMusicFinal, finalBossText;
let isPreBattle = false; 
let preBattleStep = 0;

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
  { type: "plastico", x: 0.1, color: "#2196F3" }, // Updated to use relative positions
  { type: "organico", x: 0.25, color: "#4CAF50" },
  { type: "papel", x: 0.4, color: "#FFC107" },
  { type: "metal", x: 0.55, color: "#9E9E9E" },
  { type: "electronico", x: 0.7, color: "#673AB7" }
];

let player = { name: "Jugador", hp: 10 };
let enemy = { hp: 10 };
let currentWaste;
let round = 1;
let maxRounds = 10;
let gameOver = false;
let gameState = "intro";
let levels = [
  { x: 0.25, y: 0.5, active: true }, // Updated to use relative positions
  { x: 0.5, y: 0.5, active: false },
  { x: 0.75, y: 0.5, active: false }
];
let currentLevel = -1;

let introText = [
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
let textSpeed = 2;
let introFinished = false;
let nameInput, submitButton;

let bosses = [
  { name: "TerraNox Jr." },
  { name: "TerraNox Supremo" },
  { name: "TerraNox Ultimo" }
];

function preload() 
{
  // Carga de fuente
  arcadeFont = loadFont("PressStart2P-Regular.ttf");

  // Carga de música
  bgMusicIntro = loadSound("musicaintro.mp3", 
    () => console.log("Intro Music cargado correctamente"), 
    (err) => console.error("Error cargando Intro Music:", err));
  
  bgMusicGame = loadSound("musicajuego.mp3", 
    () => console.log("Game Music cargado correctamente"), 
    (err) => console.error("Error cargando Game Music:", err));
  
  bossMusic1 = loadSound("musicajefeboss1.mp3", 
    () => console.log("bossMusic1 cargado correctamente"), 
    (err) => console.error("Error cargando bossMusic1:", err));
  
  bossMusic2 = loadSound("musicajefeboss2.mp3", 
    () => console.log("bossMusic2 cargado correctamente"), 
    (err) => console.error("Error cargando bossMusic2:", err));
  
  bossMusicFinal = loadSound("finalBossMusic.mp3", 
    () => console.log("bossMusicFinal cargado correctamente"), 
    (err) => console.error("Error cargando bossMusicFinal:", err));
  
  preBossMusic = loadSound("preBattleMusic.mp3", 
    () => console.log("preBossMusic cargado correctamente"), 
    (err) => console.error("Error cargando preBossMusic:", err)); 

  // Asignar la música a los jefes
  bosses[0].music = bossMusic1;
  bosses[1].music = bossMusic2;
  bosses[2].music = bossMusicFinal;

  // Carga de imágenes de los jefes
  bosses[0].idleGif = loadImage("boss1_idle.gif");
  bosses[0].attackGif = loadImage("boss1_attack.gif");
  bosses[1].idleGif = loadImage("boss2_idle.gif");
  bosses[1].attackGif = loadImage("boss2_attack.gif");
  bosses[2].idleGif = loadImage("boss3_idle.gif");
  bosses[2].attackGif = loadImage("boss3_attack.gif");

  // Carga de GIFs del protagonista
  player.idleGif = loadImage("player_idle.gif");
  player.attackGif = loadImage("player_attack.gif");
}

function setup() 
{
  let canvas = createCanvas(windowWidth, windowHeight, P2D);  // Create the canvas to cover the full window
  let context = canvas.drawingContext;
  context.willReadFrequently = true;  // Set the willReadFrequently attribute

  textAlign(CENTER, CENTER);
  
  // Verifica que la fuente esté cargada antes de usarla
  if (arcadeFont) {
    textFont(arcadeFont);
  } else {
    console.error("La fuente no se cargó correctamente.");
    textFont("Arial"); // Usar una fuente alternativa si no se carga correctamente
  }

  userStartAudio();

  // Ensure the intro music is loaded before playing
  if (bgMusicIntro && bgMusicIntro.isLoaded()) {
    bgMusicIntro.loop();
  } else {
    console.error("bgMusicIntro is not loaded properly.");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);  // Ensure the canvas resizes with the window
}

function draw() {
  background(0);
  fill(255);

  if (gameState === "intro") {
    drawIntro();
  } else if (gameState === "nameInput") {
    drawNameInput();
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
    textSize(12);
    text("Haz clic para continuar", width / 2, height / 2 + 40);
  }
  
  text(displayedText, width / 2, height / 2);
}

function drawNameInput() {
  textSize(20);
  text("¿Cuál es tu nombre?", width / 2, height * 0.3);
  
  if (!nameInput) {
    nameInput = createInput("");
    nameInput.position(width / 2 - 50, height * 0.4);
    submitButton = createButton("Aceptar");
    submitButton.position(width / 2 + 50, height * 0.4);
    submitButton.mousePressed(() => {
      player.name = nameInput.value().trim() || "Jugador";
      nameInput.remove();
      submitButton.remove();
    
      bgMusicIntro.stop();
      bgMusicGame.loop();
      
      gameState = "mapa";
    });
  }
}

function mousePressed() {
  if (gameState === "intro") {
    if (currentParagraph < introText.length - 1) {
      currentParagraph++;
      displayedText = "";
      charIndex = 0;
    } else {
      introFinished = true;
      gameState = "nameInput";
      introFinished = false;
      currentParagraph = 0;
    }
  } else if (isPreBattle) {
    preBattleStep++;
    if (preBattleStep === 3) 
    {
      enemy.name = "TerraNox";
      bossMusicFinal.loop();
      isPreBattle = false;
      textSize(30);
      text("—Insensato... ¿Crees que puedes detenerme? \n Soy la sombra de la humanidad, \n la consecuencia de su codicia. " +
        "Con cada fábrica que arde,\n con cada río envenenado,\n mi poder crece. " +
        "TÚ no eres rival para mí.", width / 2, height / 2);
      setTimeout(() => 
        {
        gameState = "nivel";
      }, 3000); // Wait 3 seconds before starting the battle
    }
  } else {
    if (gameState === "mapa") {
      for (let i = 0; i < levels.length; i++) {
        if (
          mouseX > levels[i].x * width &&
          mouseX < levels[i].x * width + width * 0.05 &&
          mouseY > levels[i].y * height &&
          mouseY < levels[i].y * height + height * 0.05 &&
          levels[i].active
        ) {
          currentLevel = i;
          gameState = "nivel";
          resetGame();
          pickNewWaste();
        }
      }
    } else if (gameState === "nivel" && gameOver) {
      if (player.hp > 0 && currentLevel + 1 < levels.length) {
        levels[currentLevel + 1].active = true;
      }
      gameState = "mapa";
    } else if (gameState === "nivel") {
      // Verificar si se hizo clic en un bote de basura
      for (let bin of bins) {
        if (
          mouseX > bin.x * width &&
          mouseX < bin.x * width + width * 0.1 &&
          mouseY > height * 0.75 &&
          mouseY < height * 0.75 + width * 0.1 // Use width for height to maintain square shape
        ) {
          checkWaste(bin.type); // Llama a la función para verificar la respuesta
        }
      }
    }
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

  bgMusicGame.stop();  
  bgMusicIntro.stop();  
  bossMusic1.stop(); 
  bossMusic2.stop();  
  preBossMusic.stop();  
  bossMusicFinal.stop();  

  if (currentLevel === 0) 
  {
    enemy.name = bosses[0].name;
    idleAnimation = bosses[0].idleGif;
    attackAnimation = bosses[0].attackGif;
    bossMusic1.loop();  // Iniciar música de jefe 1
  } else if (currentLevel === 1) 
  {
    enemy.name = bosses[1].name;
    idleAnimation = bosses[1].idleGif;
    attackAnimation = bosses[1].attackGif;
    bossMusic2.loop();  // Iniciar música de jefe 2
  } else if (currentLevel === 2) 
  {
    enemy.name = bosses[2].name;
    idleAnimation = bosses[2].idleGif;
    attackAnimation = bosses[2].attackGif;
    bossMusicFinal.loop();  // Iniciar música de jefe final
  } else 
  {
    enemy.name = "Enemigo Común";
    idleAnimation = null;
    attackAnimation = null;
    bgMusicGame.loop();  // Música de fondo del juego
  }
}

function drawMap() {
  textSize(20);
  text("Selecciona un nivel", width / 2, height * 0.1);
  for (let i = 0; i < levels.length; i++) {
    let level = levels[i];

    fill(level.active ? "green" : "red");
    rect(level.x * width, level.y * height, width * 0.05, height * 0.05); // Maintain square shape
    fill(255);
    text(i + 1, level.x * width + width * 0.025, level.y * height + height * 0.025);
  }
}

function drawLevel() 
{
  if (gameOver) 
  {
    textSize(30);
    text(player.hp <= 0 ? "Perdiste!" : "Ganaste!", width / 2, height / 2);
    textSize(20);
    text("Haz clic para volver al mapa", width / 2, height / 2 + 40);
    return;
  }

  if (isPreBattle) 
  {
    // Mostrar el texto antes de la batalla
    textSize(20);
    fill(255);
    if (preBattleStep === 0) {
      text("Estás a punto de hacer historia, \n ¿te encuentras listo para enfrentarte a TerraNox?", width / 2, height / 2);
    } else if (preBattleStep === 1) {
      text("El aire es denso, cargado de humo y veneno."+"Frente a ti, la colosal silueta de TerraNox se alza,"+"con su cuerpo hecho de hollín, \n metal corroído y llamas verdes que arden en su interior.\n", width / 2, height / 2);
    } else if (preBattleStep === 2) {
      text("Haz clic para continuar la batalla...", width / 2, height / 2 + 40);
    }
    return; 
  }
  
  for (let bin of bins) 
  {
    fill(bin.color);
    rect(bin.x * width, height * 0.75, width * 0.1, width * 0.1); // Maintain square shape
    fill(255);
    text(bin.type.toUpperCase(), bin.x * width + width * 0.05, height * 0.80);
  }

  textSize(20);
  text("Round " + round + " / " + maxRounds, width / 2, height * 0.05);
  text("Desecho actual:", width / 2, height * 0.15);
  text(currentWaste ? currentWaste.name : "Cargando...", width / 2, height * 0.2);
  textSize(16);
  text(player.name + "'s HP: " + player.hp, width * 0.1, height * 0.05);
  text("Enemy's HP: " + enemy.hp, width * 0.9, height * 0.05);

  // Display idle animation
  if (idleAnimation) {
    image(idleAnimation, width * 0.6, height * 0.3, width * 0.3, width * 0.3);  // Adjusted position for boss animation
  }

  // Display player idle animation
  image(player.idleGif, width * 0.1, height * 0.6, width * 0.2, width * 0.2);  // Adjusted position and size for player animation
}

function checkWaste(selectedType) {
  if (currentWaste && selectedType === currentWaste.type) {
    console.log("¡Correcto! +2 de ataque");
    enemy.hp -= 2; // Reducir vida del enemigo si aciertas
  } else {
    console.log("Incorrecto. -2 de vida");
    player.hp -= 2;
  }

  round++;
  if (round > maxRounds || player.hp <= 0 || enemy.hp <= 0) {
    gameOver = true;
  } else {
    pickNewWaste(); // Elegir un nuevo desecho
  }
}
