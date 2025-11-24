// main.js

// --- Imports ---
import { CONFIG, applyConfig, maxInputs } from './Config.js'; // <-- ADD maxInputs
import { Being, spawnBeings } from './Beings.js';
import { Food, spawnFood } from './Food.js';
import { setupGraph, updateGraph, updateTraitBounds } from './Graph.js'; // <-- ADD updateTraitBounds
import { setupUIHandlers } from './UI.js';

// Get canvas and contexts - MUST be declared before use
export const canvas = document.getElementById('c');
if (!canvas) {
    console.error('Canvas element not found! Make sure the HTML is loaded correctly.');
    throw new Error('Canvas element not found');
}
const ctx = canvas.getContext('2d');

// UI elements (Used in the loop/updates)
export const pauseBtn = document.getElementById('pause');
const countLabel = document.getElementById('count');
const foodCountLabel = document.getElementById('foodCount');
const avgSpeedLabel = document.getElementById('avgSpeed'); 
const avgSenseLabel = document.getElementById('avgSense'); 
const avgSizeLabel = document.getElementById('avgSize'); 
const avgMergeLabel = document.getElementById('avgMerge'); 
export const addBeingsBtn = document.getElementById('addBeings');
export const addFoodBtn = document.getElementById('addFood');
export const resetSimBtn = document.getElementById('resetSim');

// --- EXPORTED MUTABLE STATE (Shared with Beings/Food/Graph) ---
export let beings = [];
export let foods = [];
export let simWidth, simHeight; 
export let paused = false;
let simSpeed = 10;
let foodSpawnAccumulator = 0; 
let graphUpdateAccumulator = 0;
const graphUpdateInterval = 0.5; // Update graph every 0.5 seconds

// --- State Management Helpers (used by UI.js) ---
function setSimSpeed(newSpeed) {
    simSpeed = newSpeed;
}

function togglePause() {
    paused = !paused; 
    pauseBtn.textContent = paused ? 'Resume' : 'Pause'; 
    pauseBtn.classList.toggle('bg-blue-600');
    pauseBtn.classList.toggle('hover:bg-blue-700');
    pauseBtn.classList.toggle('bg-orange-600');
    pauseBtn.classList.toggle('hover:bg-orange-700');
}

// --- Canvas Resizing and UI Setup ---
function resizeCanvases() {
  const topDiv = document.getElementById('top');
  simWidth = canvas.width = topDiv.clientWidth;
  simHeight = canvas.height = topDiv.clientHeight;
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// Set up all UI event handlers
setupUIHandlers(setSimSpeed, togglePause);

// --- Graph Setup Wrapper ---
function applyConfigWithGraph() {
    // 1. Apply config, which clears arrays and updates CONFIG values
    applyConfig(); 
    
    // 2. Now that CONFIG is stable, update trait bounds and setup graph
    updateTraitBounds(CONFIG, maxInputs.maxSpeed, maxInputs.maxSense, maxInputs.maxSize);
    setupGraph();
}


// --- Main Loop ---
let last = performance.now();

function loop(now){
  let dt = Math.min(0.1, (now - last)/1000);
  dt *= simSpeed;
  last = now;
  let currentPopulation = beings.length;
  let totalSpeed = 0; let totalSense = 0; 
  let totalSize = 0; let totalMerge = 0; 
  
  if(!paused){
    
    // --- Food Generation Logic ---
    foodSpawnAccumulator += dt;
    const intervalInSeconds = CONFIG.foodSpawnInterval / 1000;
    
    if (foods.length < CONFIG.maxFood && foodSpawnAccumulator >= intervalInSeconds) {
        spawnFood(CONFIG.foodSpawnAmount);
        foodSpawnAccumulator -= intervalInSeconds;
    }
    
    // Update graph periodically (throttled)
    graphUpdateAccumulator += dt;
    if (graphUpdateAccumulator >= graphUpdateInterval) {
        updateGraph(); 
        graphUpdateAccumulator = 0;
    }
    // update beings 
    for(let i=beings.length-1;i>=0;--i){
      const b = beings[i];
      // Pass the *currently* known foods array (which is the global one)
      b.update(dt, foods, beings); 
      
      if(b.energy <= 0 || b.isEaten){ 
        var posx = b.x, posy = Being.y
        beings.splice(i,1); 
        spawnFood(1,posx,posy) 
      }
    }
  }
  
  // Re-calculate population and total stats after updates/deaths
  currentPopulation = beings.length;
  
  if (currentPopulation === 0 && !paused) {
      togglePause(); 
      console.log("Simulation paused: All beings have died. Press Resume to restart the time flow, or Reset to start a new population.");
  }
  if (currentPopulation > 0) {
      totalSpeed = beings.reduce((sum, b) => sum + b.maxSpeed, 0);
      totalSense = beings.reduce((sum, b) => sum + b.senseRange, 0);
      totalSize = beings.reduce((sum, b) => sum + b.sizeMultiplier, 0); 
      totalMerge = beings.reduce((sum, b) => sum + b.mergeChance, 0); 
  }
  const currentAvgSpeed = currentPopulation > 0 ? totalSpeed / currentPopulation : 0;
  const currentAvgSense = currentPopulation > 0 ? totalSense / currentPopulation : 0;
  const currentAvgSize = currentPopulation > 0 ? totalSize / currentPopulation : 0; 
  const currentAvgMerge = currentPopulation > 0 ? totalMerge / currentPopulation : 0; 
  
  // draw simulation
  ctx.clearRect(0,0,simWidth,simHeight);
  for(let f of foods) f.draw(ctx);
  for(let b of beings) b.draw(ctx);
  
  // HUD: counts
  countLabel.textContent = currentPopulation;
  avgSpeedLabel.textContent = currentAvgSpeed.toFixed(2);
  avgSenseLabel.textContent = currentAvgSense.toFixed(0); 
  foodCountLabel.textContent = foods.length;
  avgSizeLabel.textContent = currentAvgSize.toFixed(1); 
  avgMergeLabel.textContent = (currentAvgMerge * 100).toFixed(0) + '%'; 
  
  requestAnimationFrame(loop);
}

// Start the simulation after setting initial configuration
// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        applyConfigWithGraph();
        requestAnimationFrame(loop);
    });
} else {
    // DOM is already ready
    applyConfigWithGraph();
    requestAnimationFrame(loop);
}