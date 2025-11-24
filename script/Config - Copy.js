// Config.js
import { spawnBeings } from './Beings.js';
import { spawnFood } from './Food.js';
// Removed: import { setupGraph, updateTraitBounds, TRAITS } from './Graph.js'; 
import { beings, foods } from './Main.js'; // Imports the mutable state arrays

// Configuration (Default values)
let CONFIG = {
  // Evolutionary traits (Initial values)
  initialMaxSpeed: 1.0, 
  initialSenseRange: 50,
  initialSizeMultiplier: 1.0,
  initialMergeChance: 0.1, 
  // Evolutionary costs (Constants)
  baseEnergyLoss: 0.5, 
  speedCostMultiplier: 0.5, 
  senseCostMultiplier: 0.005,
  sizeCostMultiplier: 3.0,    
  // Predation/Merging Settings
  energyGainFromBeing: 60,    
  predationSizeAdvantage: 1.2, 
  maxCellCount: 100,             
  // Other settings
  beingsInit: 20, 
  maxFood: 500,
  mutationRate: 0.2, 
  
  // Fixed constants
  foodSpawnInterval: 100, 
  foodSpawnAmount: 10, 
  beingRadius: 12, 
  foodRadius: 6,
  energyMax: 100,
  energyGainPerFood: 30,
  minSpeed: 0.1, 
  minSense: 50, 
  minSizeMultiplier: 0.5, 
  minMergeChance: 0.0,
};

// --- UI Input References (Must be loaded from DOM) ---
// Note: We access the DOM directly here to simplify the dependency chain
const resetSimBtn = document.getElementById('resetSim');

// Setup slider helper (Moved from main.js)
function setupSlider(inputId, displayId) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  const stepValue = input.step;
  let decimalPlaces = stepValue.includes('.') ? stepValue.split('.')[1].length : 0;
  if (stepValue.includes('.') && parseFloat(stepValue) < 0.01) {
      decimalPlaces = Math.max(3, decimalPlaces);
  }
  if (inputId === 'initialMergeChance' || inputId === 'mutationRate') {
      decimalPlaces = 0;
  }
  display.textContent = parseFloat(input.value).toFixed(decimalPlaces);
  input.addEventListener('input', () => {
      display.textContent = parseFloat(input.value).toFixed(decimalPlaces);
  });
  return input;
}

// Configuration Inputs (now all sliders)
const inputInitialMaxSpeed = setupSlider('initialMaxSpeed', 'initialMaxSpeedValue');
const inputSenseCostMultiplier = setupSlider('senseCostMultiplier', 'senseCostMultiplierValue'); 
const inputBeingsInit = setupSlider('beingsInit', 'beingsInitValue');
const inputMaxFood = setupSlider('maxFood', 'maxFoodValue');
const inputBaseEnergyLoss = setupSlider('baseEnergyLoss', 'baseEnergyLossValue');
const inputSpeedCostMultiplier = setupSlider('speedCostMultiplier', 'speedCostMultiplierValue');
const inputInitialSenseRange = setupSlider('initialSenseRange', 'initialSenseRangeValue'); 
const inputInitialSizeMultiplier = setupSlider('initialSizeMultiplier', 'initialSizeMultiplierValue'); 
const inputSizeCostMultiplier = setupSlider('sizeCostMultiplier', 'sizeCostMultiplierValue'); 
const inputMutationRate = setupSlider('mutationRate', 'mutationRateValue');
const inputFoodSpawnInterval = setupSlider('foodSpawnInterval', 'foodSpawnIntervalValue'); 
const inputInitialMergeChance = setupSlider('initialMergeChance', 'initialMergeChanceValue'); 


// --- Core Apply Function ---
function applyConfig() {
  // 1. Update CONFIG from UI inputs (values are read directly from the sliders)
  CONFIG.initialMaxSpeed = parseFloat(inputInitialMaxSpeed.value);
  CONFIG.senseCostMultiplier = parseFloat(inputSenseCostMultiplier.value);
  CONFIG.beingsInit = parseInt(inputBeingsInit.value);
  CONFIG.maxFood = parseInt(inputMaxFood.value);
  CONFIG.baseEnergyLoss = parseFloat(inputBaseEnergyLoss.value);
  CONFIG.speedCostMultiplier = parseFloat(inputSpeedCostMultiplier.value);
  
  CONFIG.initialSenseRange = parseFloat(inputInitialSenseRange.value); 
  CONFIG.initialSizeMultiplier = parseFloat(inputInitialSizeMultiplier.value); 
  CONFIG.sizeCostMultiplier = parseFloat(inputSizeCostMultiplier.value); 
  CONFIG.initialMergeChance = parseFloat(inputInitialMergeChance.value) / 100; // Convert percent to ratio
  CONFIG.mutationRate = parseFloat(inputMutationRate.value) / 100; // Convert percent to ratio
  CONFIG.foodSpawnInterval = parseFloat(inputFoodSpawnInterval.value) * 1000;
  
  // VISUAL FEEDBACK: Flash the button to confirm config applied
  resetSimBtn.classList.add('bg-green-500');
  resetSimBtn.classList.remove('bg-red-600');
  setTimeout(() => {
      resetSimBtn.classList.remove('bg-green-500');
      resetSimBtn.classList.add('bg-red-600');
  }, 200);
  // 2. Reset simulation state and food accumulator (Done in main.js, this is fine)
  beings.length = 0; // Clear the array in place
  foods.length = 0;  // Clear the array in place
  
  // 3. Update trait bounds and reset graph (MOVED TO MAIN.JS)
  // We need to use the input values to update the TRAITS definition in Graph.js
  // REMOVED: updateTraitBounds(CONFIG, inputInitialMaxSpeed.max, inputInitialSenseRange.max, inputInitialSizeMultiplier.max);
  // REMOVED: setupGraph(); 
  
  // 4. Spawn new initial population using the freshly updated CONFIG values
  spawnBeings(CONFIG.beingsInit);
  spawnFood(CONFIG.beingsInit * 2); 
}

// Export the input max values needed for Graph.js
const maxInputs = {
    maxSpeed: inputInitialMaxSpeed.max,
    maxSense: inputInitialSenseRange.max,
    maxSize: inputInitialSizeMultiplier.max
}

export { CONFIG, applyConfig, resetSimBtn, maxInputs };