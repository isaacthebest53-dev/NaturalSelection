// Graph.js
import { beings } from './Main.js'; // Needs the beings array for data

// UI elements (Graph specific)
const xAxisTraitSelect = document.getElementById('xAxisTrait');
const yAxisTraitSelect = document.getElementById('yAxisTrait');
if (!xAxisTraitSelect || !yAxisTraitSelect) {
    console.warn('Graph UI elements not found. Graph features may not work.');
}
let traitScatterChart;

// Data structure for traits mapping (used for labels and min/max on the chart)
// Initialize with default values to avoid circular dependency issues
// These will be updated by updateTraitBounds() once CONFIG is available
let TRAITS = {
    maxSpeed: { label: 'Max Speed', key: 'maxSpeed', min: 0.1, max: 5.0, fixed: 2, color: 'rgba(255, 0, 0, 0.6)' },
    senseRange: { label: 'Sense Range', key: 'senseRange', min: 50, max: 500, fixed: 0, color: 'rgba(0, 255, 255, 0.6)' },
    sizeMultiplier: { label: 'Size Multiplier', key: 'sizeMultiplier', min: 0.5, max: 3.0, fixed: 1, color: 'rgba(255, 165, 0, 0.6)' },
    mergeChance: { label: 'Merge Chance (%)', key: 'mergeChance', min: 0.0, max: 100, fixed: 0, color: 'rgba(255, 0, 255, 0.6)' } 
};

function updateTraitBounds(currentConfig, maxSpeed, maxSense, maxSize) {
    // Sync the TRAITS min/max values with the simulation's current configuration limits
    TRAITS.maxSpeed.min = currentConfig.minSpeed;
    TRAITS.maxSpeed.max = parseFloat(maxSpeed);
    TRAITS.senseRange.min = currentConfig.minSense;
    TRAITS.senseRange.max = parseFloat(maxSense);
    TRAITS.sizeMultiplier.min = currentConfig.minSizeMultiplier;
    TRAITS.sizeMultiplier.max = parseFloat(maxSize);
    TRAITS.mergeChance.min = currentConfig.minMergeChance * 100;
    TRAITS.mergeChance.max = 100;
}

function setupGraph() {
    const ctx = document.getElementById('trait-scatter-chart');
    
    const initialX = TRAITS[xAxisTraitSelect.value];
    const initialY = TRAITS[yAxisTraitSelect.value];
    const config = {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Population Traits',
                data: [], 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(255, 255, 255, 1)',
                pointRadius: 4,
                pointHoverRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: `${initialY.label} vs ${initialX.label}`,
                    color: 'white',
                    font: { size: 14 }
                }
            },
            scales: {
                x: {
                    type: 'linear', position: 'bottom',
                    title: { display: true, text: initialX.label, color: 'white' },
                    min: initialX.min, max: initialX.max,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    title: { display: true, text: initialY.label, color: 'white' },
                    min: initialY.min, max: initialY.max,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    };
    
    if (traitScatterChart) { traitScatterChart.destroy(); }
    traitScatterChart = new Chart(ctx, config);
}

function updateGraph() {
    if (!traitScatterChart || beings.length === 0) return;
    const xKey = xAxisTraitSelect.value;
    const yKey = yAxisTraitSelect.value;
    
    const xTrait = TRAITS[xKey];
    const yTrait = TRAITS[yKey];
    
    const scatterData = beings.map(b => {
        let xValue = b[xKey];
        let yValue = b[yKey];
        
        if (xKey === 'mergeChance') xValue *= 100;
        if (yKey === 'mergeChance') yValue *= 100;
        
        let color = xTrait.color;
        
        return {
            x: parseFloat(xValue.toFixed(xTrait.fixed)),
            y: parseFloat(yValue.toFixed(yTrait.fixed)),
            backgroundColor: color
        };
    });
    
    // Update Chart Data
    traitScatterChart.data.datasets[0].data = scatterData;
    traitScatterChart.data.datasets[0].backgroundColor = scatterData.map(d => d.backgroundColor);
    
    // Update Chart Labels and Scales
    traitScatterChart.options.plugins.title.text = `${yTrait.label} vs ${xTrait.label}`;
    
    traitScatterChart.options.scales.x.title.text = xTrait.label;
    traitScatterChart.options.scales.x.min = xTrait.min;
    traitScatterChart.options.scales.x.max = xTrait.max;
    
    traitScatterChart.options.scales.y.title.text = yTrait.label;
    traitScatterChart.options.scales.y.min = yTrait.min;
    traitScatterChart.options.scales.y.max = yTrait.max;
    
    traitScatterChart.update();
}

export { setupGraph, updateGraph, updateTraitBounds, TRAITS, xAxisTraitSelect, yAxisTraitSelect };