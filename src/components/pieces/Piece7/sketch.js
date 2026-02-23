// A2Z F25
// Daniel Shiffman
// https://github.com/Programming-from-A-to-Z/A2Z-F25

// This is based on Allison Parrish's great RWET examples
// https://github.com/aparrish/rwet-examples

// An array of lines from a text file
let lines;
// The Markov Generator object
let markov;
// An output element
let output;

async function setup() {
  // N-gram length and maximum length
  markov = new MarkovGeneratorWord(1, 280);

  let lines = await loadStrings("data/exorcisms.txt");

  // Feed one line at a time
  for (let i = 0; i < lines.length; i++) {
    markov.feed(lines[i]);
  }

  // Make the button
  let button = createButton("generate");
  button.mousePressed(generate);

  noCanvas();
}

function generate() {
  // Generate some text
  let result = markov.generate();
  // Put in HTML line breaks wherever there was a carriage return
  result = result.replace("\n", "<br/><br/>");
  createP(result);
}
