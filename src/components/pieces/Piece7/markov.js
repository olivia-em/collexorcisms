// A2Z F25
// Daniel Shiffman
// https://github.com/Programming-from-A-to-Z/A2Z-F25

// This is based on Allison Parrish's great RWET examples
// https://github.com/aparrish/rwet-examples

// This example does not include "weighted selection" or "temperature"
// As an exercise you might try to add it!

// A Markov Generator class
class MarkovGeneratorWord {
  constructor(n, max) {
    // Order (or length) of each ngram
    this.n = n;
    // What is the maximum amount we will generate?
    this.max = max;
    // An object as dictionary
    // each ngram is the key, a list of possible next elements are the values
    this.ngrams = {};
    // A separate array of possible beginnings to generated text
    this.beginnings = [];
  }

  // Helper to split text into tokens
  tokenize(text) {
    return text.split(/\s+/);
  }

  // A function to feed in text to the markov chain
  feed(text) {
    let tokens = this.tokenize(text);

    // Discard this line if it's too short
    if (tokens.length < this.n) {
      return false;
    }

    // Store the first ngram of this line
    var beginning = tokens.slice(0, this.n).join(" ");
    this.beginnings.push(beginning);

    // Now let's go through everything and create the dictionary
    for (var i = 0; i < tokens.length - this.n; i++) {
      // Usings slice to pull out N elements from the array
      let gram = tokens.slice(i, i + this.n).join(" ");
      // What's the next element in the array?
      let next = tokens[i + this.n];

      // Is this a new one?
      if (!this.ngrams[gram]) {
        this.ngrams[gram] = [];
      }
      // Add to the list
      this.ngrams[gram].push(next);
    }
  }

  // Generate a text from the information ngrams
  generate() {
    // Get a random beginning
    let current =
      this.beginnings[Math.floor(Math.random() * this.beginnings.length)];

    // The output is now an array of tokens that we'll join later
    let output = this.tokenize(current);

    // Generate a new token max number of times
    for (let i = 0; i < this.max; i++) {
      // If this is a valid ngram
      if (this.ngrams[current]) {
        // What are all the possible next tokens
        let possible_next = this.ngrams[current];
        // Pick one randomly
        let next =
          possible_next[Math.floor(Math.random() * possible_next.length)];
        // Add to the output
        output.push(next);
        // Get the last N entries of the output; we'll use this to look up
        // an ngram in the next iteration of the loop
        current = output.slice(output.length - this.n, output.length).join(" ");
      } else {
        break;
      }
    }
    // Here's what we got!
    return output.join(" ");
  }
}

export default MarkovGeneratorWord;
