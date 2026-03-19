// https://editor.p5js.org/coloringchaos/sketches/W_K0yrl55
// https://editor.p5js.org/neotions/sketches/H5Yx4yebU

let bruises = [];
let droppedWords = []; // permanent word memory
let words = [];
let wordIndex = 0;

function preload() {
  loadStrings("marks.txt", function (txt) {
    words = txt.join(" ").split(/\s+/);
    console.log("WORDS:", words);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  textAlign(CENTER, CENTER);
  textSize(20);
}

function draw() {
  background(255);

  // --- draw bruises ---
  for (let i = bruises.length - 1; i >= 0; i--) {
    bruises[i].update();
    bruises[i].display();
    if (bruises[i].lifespan <= 0) {
      // save word before removing bruise
      droppedWords.push({
        word: bruises[i].word,
        x: bruises[i].x,
        y: bruises[i].y,
      });
      bruises.splice(i, 1);
    }
  }

  // blur ONLY the bruises layer
  filter(BLUR, 20);

  // --- draw words on active bruises (sharp) ---
  fill(255);
  noStroke();
  for (let b of bruises) {
    if (b.word) text(b.word, b.x, b.y);
  }

  // --- draw persisted words (sharp, bruise gone) ---
  for (let d of droppedWords) {
    text(d.word, d.x, d.y);
  }
}

function mousePressed() {
  let w = words[wordIndex % words.length];
  wordIndex++;
  bruises.push(new Bruise(mouseX, mouseY, w));
}

// --- Bruise class ---
function Bruise(x, y, word) {
  this.x = x;
  this.y = y;
  this.word = word;
  this.size1 = random(100, 200);
  this.size2 = random(100, 200);
  this.r = random(200);
  this.g = random(200);
  this.b = random(200);
  this.lifespan = 255;
  this.fadeSpeed = 255 / (60 * 5);
  this.update = function () {
    this.lifespan -= this.fadeSpeed;
  };
  this.display = function () {
    noStroke();
    fill(this.r, this.g, this.b, this.lifespan);
    ellipse(this.x, this.y, this.size1, this.size2);
  };
}
