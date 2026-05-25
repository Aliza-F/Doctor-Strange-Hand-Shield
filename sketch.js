let video;      // Variable to hold the webcam feed
let handPose;   // Variable for the ml5 handPose model
let hands = []; // Array to store the tracking results

/**
 * PRELOAD: This runs before anything else.
 * We load the AI model here so it's ready when the sketch starts.
 */
function preload() {
  // flipped: true makes the coordinates match the mirrored camera
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create the webcam video and set it to the standard 640x480 size
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide(); // Hide the actual HTML video element; we draw it in p5 instead
  
  // Start detecting hands from the video feed
  handPose.detectStart(video, gotHands);
}

function draw() {
  background(10); // Dark background to make the glow effects stand out

  // --- 1. CALCULATE POSITIONING ---
  // We find the 'x' and 'y' needed to put the 640x480 video in the middle of the screen
  let vx = (width - 640) / 2;
  let vy = (height - 480) / 2;
  
  // Draw the camera feed at those centered coordinates
  image(video, vx, vy, 640, 480); 

  // --- 2. CHECK FOR HANDS ---
  if (hands.length > 0) {
    for (let hand of hands) {
      // We use the middle finger knuckle as the center of the palm
      let palm = hand.middle_finger_mcp;
      
      // Calculate where the magic should be drawn on the SCREEN
      // (Hand coordinate + the Video offset)
      let magicX = palm.x + vx;
      let magicY = palm.y + vy;

      // Calculate distance between thumb and index finger to control the size
      let d = dist(hand.index_finger_tip.x, hand.index_finger_tip.y, hand.thumb_tip.x, hand.thumb_tip.y);

      // --- 3. SIZE CALCULATION (CLAMPING) ---
      // Map finger distance (30-160px) to a reasonable shield size (50-220px)
      let shieldSize = map(d, 30, 160, 50, 220);
      
      // Constrain ensures it never explodes to a huge size or gets too tiny
      shieldSize = constrain(shieldSize, 0, 250); 

      // Only draw the shield if the hand is actually open (distance > 35)
      if (d > 35) {
        drawStrangeShield(magicX, magicY, shieldSize);
      }
    }
  }
}

/**
 * Function to draw the mystical rotating shield
 */
function drawStrangeShield(x, y, size) {
  push();
  translate(x, y); // Move the drawing "paper" to the palm position
  
  // Set up the neon glow effect using the Canvas drawing context
  drawingContext.shadowBlur = 35;
  drawingContext.shadowColor = color(255, 120, 0);
  
  noFill();
  
  // --- LAYER 1: THICK OUTER RING ---
  stroke(255, 140, 0);
  strokeWeight(6); 
  ellipse(0, 0, size * 1.5);
  
  // --- LAYER 2: ROTATING RUNE RING ---
  push();
  rotate(frameCount * 0.02); // frameCount makes it spin over time
  strokeWeight(3);
  ellipse(0, 0, size * 1.7);
  // Loop to draw 12 little rune-lines around the circle
  for(let i=0; i<12; i++) {
    rotate(TWO_PI/12);
    line(size * 0.75, 0, size * 0.85, 0); 
  }
  pop();

  // --- LAYER 3: INTERLOCKING HEXAGONS ---
  strokeWeight(4);
  stroke(255, 180, 0);
  push();
  rotate(-frameCount * 0.04); // Rotate in the opposite direction
  drawHexagon(0, 0, size * 0.8);
  rotate(PI/6);               // Offset by 30 degrees to create the star look
  drawHexagon(0, 0, size * 0.8);
  pop();

  // --- LAYER 4: PULSING CENTER CORE ---
  // Use a Sine wave to create a pulsing "breathing" effect
  let pulse = sin(frameCount * 0.1) * 10;
  fill(255, 200, 0, 180);
  noStroke();
  ellipse(0, 0, (size * 0.2) + pulse);
  
  pop(); // Restore drawing state
}

/**
 * Custom function to draw a 6-sided polygon (Hexagon)
 */
function drawHexagon(x, y, r) {
  beginShape();
  for (let a = 0; a < TWO_PI; a += TWO_PI / 6) {
    // Math for plotting points in a circle
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape(CLOSE);
}

/**
 * Callback function: runs whenever the AI finds new hand data
 */
function gotHands(results) {
  hands = results;
}

/**
 * Ensures the canvas stays the right size if you resize the browser
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
