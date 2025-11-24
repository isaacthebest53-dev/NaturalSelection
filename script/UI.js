// UI.js
import { pauseBtn, addBeingsBtn, addFoodBtn, resetSimBtn, canvas } from './Main.js'; // Import UI elements from main for reference
import { spawnBeings } from './Beings.js';
import { spawnFood } from './Food.js';
import { applyConfig } from './Config.js';
import { updateGraph, xAxisTraitSelect, yAxisTraitSelect } from './Graph.js';

// UI element references (Accessing elements already defined in main/config)
const uiPanel = document.getElementById('ui');
const toggleConfigBtn = document.getElementById('toggleConfig');
const graphUIPanel = document.getElementById('graph-ui');
const toggleGraphBtn = document.getElementById('toggleGraph');
const simSpeedInput = document.getElementById('simSpeedInput');
const refreshGraphBtn = document.getElementById('refreshGraph');

// State reference: simSpeed must be exported from main.js if it's mutable
let simSpeed = 10; // Initial value, but updated via main.js export/setter if needed

const EXPANDED_CLASS = 'ui-expanded';

export function setupUIHandlers(setSimSpeed, togglePause) {
    
    // Toggle logic for the config panel
    toggleConfigBtn.onclick = () => {
      uiPanel.classList.toggle(EXPANDED_CLASS);
    };
    
    // Toggle logic for the graph panel
    toggleGraphBtn.onclick = () => {
        graphUIPanel.classList.toggle(EXPANDED_CLASS);
        
        // If expanding, manually trigger a Chart.js resize
        if (graphUIPanel.classList.contains(EXPANDED_CLASS)) {
            // NOTE: Chart.js reference is in Graph.js, this relies on Chart.js automatically handling resize on container change
        }
    };
    
    simSpeedInput.addEventListener('input', e => {
      // Calls setter/update function provided by main.js
      setSimSpeed(parseFloat(e.target.value)); 
    });
    
    pauseBtn.onclick = ()=>{ 
      togglePause(); // Calls function provided by main.js
    }
    
    addBeingsBtn.onclick = ()=> spawnBeings(5);
    addFoodBtn.onclick = ()=> spawnFood(10);
    resetSimBtn.onclick = applyConfig;
    
    // Graph refresh and selection handlers
    refreshGraphBtn.onclick = updateGraph;
    xAxisTraitSelect.onchange = updateGraph;
    yAxisTraitSelect.onchange = updateGraph;
    
    // click to add food
    canvas.addEventListener('click',(e)=>{
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top;
      spawnFood(1, x, y); // Small change: pass coordinates to spawner
    })
}