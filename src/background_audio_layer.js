// https://editor.p5js.org/neotions/sketches/H5Yx4yebU

let circles = [];

let speed = 0.5;

var limit = Math.max(
  document.body.scrollHeight,
  document.body.offsetHeight,
  document.documentElement.clientHeight,
  document.documentElement.scrollHeight,
  document.documentElement.offsetHeight,
);

function setup() {
  canvas = createCanvas(windowWidth, limit);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");
  colorMode(HSB);
  // Initialize circles
  for (let i = 0; i < 8; i++) {
    circles.push({
      x: random(width),
      y: random(height),
      xspeed: random(0 - speed, speed),
      yspeed: random(0 - speed, speed),
      h: random(360),
      s: randomGaussian(100, 10),
      b: randomGaussian(100, 10),
    });
  }
}

function draw() {
  background(0);
  // Update and draw circles
  for (let circle of circles) {
    fill(circle.h, circle.s, circle.b);
    ellipse(circle.x, circle.y, 200, 200);
    circle.x += circle.xspeed;
    circle.y += circle.yspeed;

    // Boundary check
    if (circle.x > width || circle.x < 0) {
      circle.xspeed *= -1;
    }
    if (circle.y > height || circle.y < 0) {
      circle.yspeed *= -1;
    }
  }

  filter(BLUR, 70);
}
