// https://editor.p5js.org/oshoham/sketches/gosbqaqeS

let field;
let button;
let letters = [];

function setup() {
  createCanvas(400, 300);
  field = createInput("your text");
  button = createButton("Explode!!");
  button.mousePressed(explodeText);
}

function draw() {
  background(50);
  fill(255);
  noStroke();
  textSize(24);

  for (let i = 0; i < letters.length; i++) {
    text(letters[i].letter, letters[i].xPos, letters[i].yPos);
    letters[i].xPos += letters[i].xDir;
    letters[i].yPos += letters[i].yDir;
  }
}

function explodeText() {
  textSize(24);
  let text = field.value();
  let currentPos = random(width / 2);

  for (let i = 0; i < text.length; i++) {
    let letterObj = {
      letter: text.charAt(i),
      yPos: 50,
      xPos: currentPos,
      xDir: random(-1, 1),
      yDir: random(-0.5, 2),
    };
    letters.push(letterObj);
    currentPos += textWidth(text.charAt(i));
  }
}
