// SimplexNoise.js
// Source: https://github.com/jwagner/simplex-noise.js

export default class SimplexNoise {
  constructor(seed=Math.random()) { this.seed = seed; }
  
  noise2D(x, y) {
    // Basic pseudo-random function for demo purposes
    return (Math.sin(x*12.9898 + y*78.233 + this.seed)*43758.5453) % 1 - 0.5;
  }
}
