/*
  faceAPI.js
  ----------
  This file implements the Face Drawing API using three approaches:
  
  1. A global function (FaceAPI.drawFace) that renders a face inside a specified container,
     based on an options object.
  
  2. A FaceDrawer class that initializes the face drawing and provides an update() method
     to change the visualization dynamically.
  
  3. (Optionally) ES6 module exports for use in modern bundlers.
  
  Usage:
    - Include face.css in your HTML.
    - Include faceAPI.js via <script src="faceAPI.js"></script>.
    - Use FaceAPI.drawFace(containerId, options) or instantiate new FaceDrawer(containerId, options).
*/

(function(global){
  // Default options for the face drawing
  const defaultOptions = {
    voiced: false,
    voiceless: false,
    nasal: false,
    stop: false,
    fricative: false,
    affricate: false,
    high: false,
    mid: false,
    low: false,
    front: false,
    central: false,
    back: false,
    rounded: false,
    unrounded: false,
    aspirated: false,
    lateral: false,
    approximant: false,
    flap: false,
    trill: false,
    glottal: false,
    tense: false
  };

  // Returns the HTML markup for the face drawing.
  function getFaceHTML() {
    return `
    <!-- Face Markup -->
    <div id="FcE_speaker-voicing-container">
      <div id="FcE_speaker-icon">
        <svg viewBox="0 0 24 24">
          <path d="M11 5L6 9H2v6h4l5 4V5zm4.5 7c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zm2.5 0c0 3.07-1.63 5.64-4 6.93V5.07c2.37 1.29 4 3.86 4 6.93z"/>
        </svg>
      </div>
      <div id="FcE_voicing-icon"></div>
    </div>
    
    <div id="FcE_head">
      <!-- Ears -->
      <div id="FcE_ear-left" class="FcE_ear"></div>
      <div id="FcE_ear-right" class="FcE_ear"></div>
      <!-- Hair -->
      <div id="FcE_hair"></div>
      <!-- Forehead -->
      <div id="FcE_forehead"></div>
      <!-- Chin Line -->
      <div id="FcE_chin"></div>
      <!-- Eyebrows -->
      <div id="FcE_eyebrow-left" class="FcE_eyebrow"></div>
      <div id="FcE_eyebrow-right" class="FcE_eyebrow"></div>
      <!-- Eyes -->
      <div id="FcE_eye-left" class="FcE_eye">
        <div id="FcE_pupil-left" class="FcE_pupil"></div>
        <div class="FcE_eyelid"></div>
      </div>
      <div id="FcE_eye-right" class="FcE_eye">
        <div id="FcE_pupil-right" class="FcE_pupil"></div>
        <div class="FcE_eyelid"></div>
      </div>
      <!-- Nose Bridge -->
      <div id="FcE_nose-bridge"></div>
      <!-- Nose -->
      <div id="FcE_nose">
        <div id="FcE_nostril-left" class="nostril"></div>
        <div id="FcE_nostril-right" class="nostril"></div>
        <span class="nasal-icon left">((</span>
        <span class="nasal-icon right">))</span>
      </div>
      <!-- Mouth -->
      <div id="FcE_mouth">
        <div id="FcE_teeth"></div>
        <div id="FcE_bottom-teeth"></div>
        <div id="FcE_tongue" class="tongue-central"></div>
      </div>
    </div>
    
    <!-- Neck -->
    <div id="FcE_neck"></div>
    <!-- Adams Apple -->
    <div id="FcE_addams-apple"></div>
    
    <!-- Indicators -->
    <div id="FcE_fricative-indicator" class="FcE_indicator">
      <svg class="FcE_wave-icon" viewBox="0 0 20 10">
        <path d="M0 5 Q5 -2 10 5 T20 5" fill="none" stroke="#00f" stroke-width="2" />
      </svg>
      <svg class="FcE_wave-icon" viewBox="0 0 20 10">
        <path d="M0 5 Q5 -2 10 5 T20 5" fill="none" stroke="#00f" stroke-width="2" />
      </svg>
      <svg class="FcE_wave-icon" viewBox="0 0 20 10">
        <path d="M0 5 Q5 -2 10 5 T20 5" fill="none" stroke="#00f" stroke-width="2" />
      </svg>
    </div>
    <div id="FcE_affricate-indicator" class="FcE_indicator">
      <svg class="FcE_wave-icon" viewBox="0 0 20 10">
        <path d="M0 5 Q5 -2 10 5 T20 5" fill="none" stroke="#00f" stroke-width="2" />
      </svg>
      <svg class="FcE_wave-icon" viewBox="0 0 20 10">
        <path d="M0 5 Q5 -2 10 5 T20 5" fill="none" stroke="#00f" stroke-width="2" />
      </svg>
      <svg class="FcE_wave-icon" viewBox="0 0 20 10">
        <path d="M0 5 Q5 -2 10 5 T20 5" fill="none" stroke="#00f" stroke-width="2" />
      </svg>
    </div>
    `;
  }

  // Updates the face visualization inside the provided container based on options.
  function updateVisualization(container, options) {
    options = Object.assign({}, defaultOptions, options);
    
    const FcE_nose = container.querySelector("#FcE_nose");
    const FcE_mouth = container.querySelector("#FcE_mouth");
    const FcE_voicingIcon = container.querySelector("#FcE_voicing-icon");
    const FcE_tongue = container.querySelector("#FcE_tongue");
    const FcE_eyeLeft = container.querySelector("#FcE_eye-left");
    const FcE_eyeRight = container.querySelector("#FcE_eye-right");
    const FcE_pupilLeft = container.querySelector("#FcE_pupil-left");
    const FcE_pupilRight = container.querySelector("#FcE_pupil-right");
    const FcE_topTeeth = container.querySelector("#FcE_teeth");
    const FcE_bottomTeeth = container.querySelector("#FcE_bottom-teeth");
    const FcE_addams_apple = container.querySelector("#FcE_addams-apple");
    const FcE_fricativeIndicator = container.querySelector("#FcE_fricative-indicator");
    const FcE_affricateIndicator = container.querySelector("#FcE_affricate-indicator");

    // Nasal icons
    if(options.nasal){
      FcE_nose.classList.add("nasal-active");
    } else {
      FcE_nose.classList.remove("nasal-active");
    }
    
    // Voicing icon
    FcE_voicingIcon.classList.remove("voiced", "voiceless");
    if(options.voiced){
      FcE_voicingIcon.classList.add("voiced");
    } else if(options.voiceless){
      FcE_voicingIcon.classList.add("voiceless");
    }
    
    // Decide mouth width and horizontal positioning
    let newWidth = options.high ? 80 : options.low ? 40 : 60;
    const mouthLeft = (180 - newWidth) / 2;
    
    // Update mouth shape and tongue visibility
    if(options.stop){
      FcE_mouth.classList.remove("rounded", "affricate");
      FcE_mouth.classList.add("stop");
      FcE_mouth.style.width = "40px";
      FcE_mouth.style.height = "10px";
      FcE_mouth.style.borderRadius = "5px";
      FcE_tongue.style.display = "none";
      FcE_mouth.style.left = (180 - 40) / 2 + "px";
    } else if(options.affricate){
      FcE_mouth.classList.remove("rounded", "stop");
      FcE_mouth.classList.add("affricate", "stop");
      FcE_mouth.style.width = newWidth + "px";
      FcE_mouth.style.height = "10px";
      FcE_mouth.style.borderRadius = "5px";
      FcE_tongue.style.display = "none";
      FcE_mouth.style.left = mouthLeft + "px";
    } else if(options.fricative){
      FcE_mouth.classList.remove("rounded", "affricate");
      FcE_mouth.classList.add("stop");
      FcE_mouth.style.width = newWidth + "px";
      FcE_mouth.style.height = "10px";
      FcE_mouth.style.borderRadius = "5px";
      FcE_tongue.style.display = "none";
      FcE_mouth.style.left = mouthLeft + "px";
    } else {
      FcE_mouth.classList.remove("stop", "affricate", "rounded");
      if(options.rounded){
        FcE_mouth.classList.add("rounded");
        FcE_mouth.style.width = "40px";
        FcE_mouth.style.height = "40px";
        FcE_mouth.style.borderRadius = "50%";
        FcE_mouth.style.left = (180 - 40) / 2 + "px";
      } else {
        FcE_mouth.style.width = newWidth + "px";
        FcE_mouth.style.height = "30px";
        FcE_mouth.style.borderRadius = "0 0 40px 40px";
        FcE_mouth.style.left = mouthLeft + "px";
      }
      FcE_tongue.style.display = "block";
    }
    
    // Hide or show teeth based on options
    if(options.stop || options.fricative || options.affricate){
      FcE_topTeeth.style.display = "none";
      FcE_bottomTeeth.style.display = "none";
    } else {
      FcE_topTeeth.style.display = "block";
      FcE_bottomTeeth.style.display = "block";
    }
    
    // Update tongue position based on tongue modifiers
    if(FcE_tongue.style.display !== "none"){
      FcE_tongue.classList.remove("tongue-front", "tongue-central", "tongue-back");
      if(options.front){
        FcE_tongue.classList.add("tongue-front");
      } else if(options.back){
        FcE_tongue.classList.add("tongue-back");
      } else {
        FcE_tongue.classList.add("tongue-central");
      }
    }
    
    // Update indicators for fricative and affricate
    FcE_fricativeIndicator.style.opacity = options.fricative ? "1" : "0";
    if(options.affricate){
      FcE_affricateIndicator.style.opacity = "1";
      setTimeout(() => {
        FcE_affricateIndicator.style.opacity = "0";
      }, 500);
    } else {
      FcE_affricateIndicator.style.opacity = "0";
    }
    
    // Handle aspirated option: create a cloud effect
    if(options.aspirated){
      const cloud = document.createElement("div");
      cloud.className = "FcE_cloud";
      container.appendChild(cloud);
      setTimeout(() => {
        if(cloud.parentNode) cloud.parentNode.removeChild(cloud);
      }, 500);
    } else {
      const existingCloud = container.querySelector(".FcE_cloud");
      if(existingCloud){
        existingCloud.remove();
      }
    }
    
    // Log lateral airflow if enabled
    if(options.lateral){
      console.log("Lateral airflow active");
    }
    
    // Toggle mouth classes for approximant, flap, and trill
    FcE_mouth.classList.toggle("approximant", options.approximant);
    FcE_mouth.classList.toggle("flap", options.flap);
    FcE_mouth.classList.toggle("trill", options.trill);
    
    // Toggle glottal on Adams Apple
    if(options.glottal){
      FcE_addams_apple.classList.add("glottal");
    } else {
      FcE_addams_apple.classList.remove("glottal");
    }
    
    // Toggle tense on mouth
    FcE_mouth.classList.toggle("tense", options.tense);
  }

  // Sets up additional events: blinking, eye movement, and random eye color.
  function setupEvents(container) {
    const FcE_eyeLeft = container.querySelector("#FcE_eye-left");
    const FcE_eyeRight = container.querySelector("#FcE_eye-right");
    const FcE_pupilLeft = container.querySelector("#FcE_pupil-left");
    const FcE_pupilRight = container.querySelector("#FcE_pupil-right");
    
    // Blinking eyes every 5 seconds
    function blinkEyes() {
      FcE_eyeLeft.classList.add("blink");
      FcE_eyeRight.classList.add("blink");
      setTimeout(() => {
        FcE_eyeLeft.classList.remove("blink");
        FcE_eyeRight.classList.remove("blink");
      }, 300);
    }
    setInterval(blinkEyes, 5000);
    
    // Eyes follow the cursor
    document.addEventListener("mousemove", (e) => {
      movePupil(FcE_eyeLeft, FcE_pupilLeft, e.clientX, e.clientY);
      movePupil(FcE_eyeRight, FcE_pupilRight, e.clientX, e.clientY);
    });
    function movePupil(eye, pupil, mouseX, mouseY) {
      const rect = eye.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      const dx = mouseX - eyeCenterX;
      const dy = mouseY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const maxOffset = 5;
      const offsetX = Math.cos(angle) * maxOffset;
      const offsetY = Math.sin(angle) * maxOffset;
      pupil.style.transform = "translate(" + offsetX + "px, " + offsetY + "px)";
    }
    
    // Set a random eye color at initialization
    function setRandomEyeColor() {
      const eyeColors = ["#8B4513", "#1E90FF", "#228B22", "#8E7618"];
      const color = eyeColors[Math.floor(Math.random() * eyeColors.length)];
      FcE_pupilLeft.style.backgroundColor = color;
      FcE_pupilRight.style.backgroundColor = color;
    }
    setRandomEyeColor();
  }

  // Global API function to draw a face in a container given its id and options.
  function drawFace(containerId, options) {
    const container = document.getElementById(containerId);
    if(!container) {
      console.error("Container not found: " + containerId);
      return;
    }
    container.innerHTML = getFaceHTML();
    updateVisualization(container, options);
    setupEvents(container);
  }

  // FaceDrawer class: initialize and update the face drawing.
  class FaceDrawer {
    constructor(containerId, options) {
      this.container = document.getElementById(containerId);
      if(!this.container) {
        console.error("Container not found: " + containerId);
        return;
      }
      this.options = Object.assign({}, defaultOptions, options);
      this.container.innerHTML = getFaceHTML();
      updateVisualization(this.container, this.options);
      setupEvents(this.container);
    }
    update(options) {
      this.options = Object.assign({}, this.options, options);
      updateVisualization(this.container, this.options);
    }
  }

  // Expose the API globally.
  global.FaceAPI = {
    drawFace: drawFace,
    FaceDrawer: FaceDrawer
  };

  // For CommonJS or ES6 module exports:
  if(typeof module !== "undefined" && module.exports) {
    module.exports = { drawFace, FaceDrawer };
  }
  
})(this);

// To use as an ES6 module, you could uncomment the following lines:
// export { drawFace, FaceDrawer };
