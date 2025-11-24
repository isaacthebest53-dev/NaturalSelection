// Beings.js
import { CONFIG } from './Config.js';
import { beings, foods, simWidth, simHeight } from './Main.js'; // Imports the mutable arrays and dimensions
import { Food } from './Food.js'; // Needed for collision radius constant

class Being {
    constructor(x, y, 
        parentSpeed = CONFIG.initialMaxSpeed, 
        parentSense = CONFIG.initialSenseRange, 
        parentSize = CONFIG.initialSizeMultiplier,
        parentMergeChance = CONFIG.initialMergeChance,
        parentCellCount = 1){ 
      
      this.x = x; this.y = y;
      this.vx = (Math.random()*2-1)*0.5; this.vy = (Math.random()*2-1)*0.5;
      
      this.cellCount = parentCellCount;
      this.maxEnergy = CONFIG.energyMax * this.cellCount;
      this.energy = Math.round(this.maxEnergy * 0.7 + Math.random() * this.maxEnergy * 0.3);
      this.age = 0;
      this.isEaten = false; 
      
      this.cellPositions = [];
      this.updateCellPositions();
      
      // --- Mutation Helper ---
      const applyMutation = (parentValue) => {
        if (CONFIG.mutationRate > 0) {
          const mutationFactor = 1 + (Math.random()*2 - 1) * CONFIG.mutationRate;
          return parentValue * mutationFactor;
        }
        return parentValue;
      };
      // --- Evolving Traits ---
      this.maxSpeed = Math.max(CONFIG.minSpeed, applyMutation(parentSpeed));
      this.senseRange = Math.max(CONFIG.minSense, applyMutation(parentSense));
      this.sizeMultiplier = Math.max(CONFIG.minSizeMultiplier, applyMutation(parentSize));
      this.mergeChance = Math.max(CONFIG.minMergeChance, Math.min(1.0, applyMutation(parentMergeChance)));
      
      this.r = CONFIG.beingRadius * this.sizeMultiplier;
    }
    
    updateCellPositions() {
        this.cellPositions = [{x: this.x, y: this.y}]; // Head cell
        
        if (this.cellCount > 1) {
            const r = this.r;
            const chainGap = r * 1.8; 
            
            const speed = Math.hypot(this.vx, this.vy) || 1;
            const headingX = this.vx / speed;
            const headingY = this.vy / speed;
            
            for (let i = 1; i < this.cellCount; i++) {
                const prevPos = this.cellPositions[i - 1];
                const x = prevPos.x - headingX * chainGap;
                const y = prevPos.y - headingY * chainGap;
                this.cellPositions.push({x: x, y: y});
            }
        }
    }
    // Helper function to create a new merged being
    static createMergedBeing(predator, prey) {
        const newCellCount = predator.cellCount + prey.cellCount;
        
        if (newCellCount > CONFIG.maxCellCount) {
             predator.energy = Math.min(predator.maxEnergy, predator.energy + (prey.energy * 0.5)); 
             prey.isEaten = true;
             return null;
        }
        const totalWeightedMass = (predator.sizeMultiplier * predator.cellCount) + (prey.sizeMultiplier * prey.cellCount);
        const avgSpeed = ((predator.maxSpeed * predator.sizeMultiplier * predator.cellCount) + 
                          (prey.maxSpeed * prey.sizeMultiplier * prey.cellCount)) / totalWeightedMass;
                          
        const avgSense = ((predator.senseRange * predator.sizeMultiplier * predator.cellCount) + 
                          (prey.senseRange * prey.sizeMultiplier * prey.cellCount)) / totalWeightedMass;
        const avgSize = (predator.sizeMultiplier + prey.sizeMultiplier) / 2; 
        const avgMergeChance = ((predator.mergeChance * predator.sizeMultiplier * predator.cellCount) + 
                                (prey.mergeChance * prey.sizeMultiplier * prey.cellCount)) / totalWeightedMass; 
        
        // This is safe because 'Being' is defined in this module
        const mergedBeing = new Being(
            predator.x, predator.y, 
            avgSpeed, 
            avgSense, 
            avgSize,
            avgMergeChance,
            newCellCount
        );
        mergedBeing.energy = Math.min(mergedBeing.maxEnergy, predator.energy + prey.energy);
        
        return mergedBeing;
    }
    update(dt, foods, otherBeings){
        this.age += dt;
        
        // --- Energy Loss proportional to Cell Count ---
        const speedSquared = this.maxSpeed * this.maxSpeed;
        const senseSquared = this.senseRange * this.senseRange;
        const sizeSquared = this.sizeMultiplier * this.sizeMultiplier; 
        const combinedSenseCost = speedSquared * senseSquared * CONFIG.senseCostMultiplier;
        const speedBaseCost = speedSquared * CONFIG.speedCostMultiplier;
        
        const baseCellCost = CONFIG.baseEnergyLoss * this.cellCount; 
        const sizeCellCost = sizeSquared * CONFIG.sizeCostMultiplier * this.cellCount; 
        const totalLoss = (baseCellCost + sizeCellCost + combinedSenseCost + speedBaseCost) * dt;
        
        this.energy -= totalLoss;
        if(this.energy <= 0) {
          this.energy = 0;
          return; // Early exit if dead
        }
        // Find nearest food within *individual* senseRange
        let target = null; let targetDist = Infinity;
        // NOTE: The foods array is imported from main.js but passed as an argument here
        for(let f of foods){ 
          const dx = f.x - this.x; const dy = f.y - this.y;
          const d = Math.hypot(dx,dy);
          if(d < targetDist && d < this.senseRange){ targetDist = d; target = f; } 
        }
        if(target){
          const dx = target.x - this.x; const dy = target.y - this.y;
          const dist = Math.hypot(dx,dy)||1;
          this.vx += (dx/dist) * 0.6;
          this.vy += (dy/dist) * 0.6;
        } else {
          this.vx += (Math.random()*2-1)*0.2;
          this.vy += (Math.random()*2-1)*0.2; 
        }
        
        // limit speed
        const sp = Math.hypot(this.vx,this.vy);
        if(sp > this.maxSpeed){ 
            this.vx = (this.vx/sp) * this.maxSpeed; 
            this.vy = (this.vy/sp) * this.maxSpeed; 
        }
        // integrate
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        
        this.updateCellPositions(); 
        
        // keep inside (wall collision)
        const r = this.r; 
        const push = this.maxSpeed * 0.2; 
        const rand = () => (Math.random()-0.5) * this.maxSpeed * 0.5; 
        
        // Check head cell boundary (uses imported simWidth/simHeight)
        if(this.x < r) { 
          this.x = r; this.vx = Math.abs(this.vx) * 0.6 + push; this.vy += rand();
        }
        if(this.x > simWidth - r) { 
          this.x = simWidth - r; this.vx = -Math.abs(this.vx) * 0.6 - push; this.vy += rand();
        }
        if(this.y < r) { 
          this.y = r; this.vy = Math.abs(this.vy) * 0.6 + push; this.vx += rand(); 
        }
        if(this.y > simHeight - r) { 
          this.y = simHeight - r; this.vy = -Math.abs(this.vy) * 0.6 - push; this.vx += rand(); 
        }
        // --- Predation/Merging Logic ---
        // otherBeings is simply the 'beings' array from main.js
        for(let b2 of otherBeings){
          if(b2 !== this && !b2.isEaten){ 
              const d = Math.hypot(this.x - b2.x, this.y - b2.y);
              const requiredDistance = this.r + b2.r;
              
              if(d < requiredDistance){
                  const thisMass = this.sizeMultiplier * this.cellCount;
                  const b2Mass = b2.sizeMultiplier * b2.cellCount; 
                  
                  if(thisMass > b2Mass * CONFIG.predationSizeAdvantage){
                      if (Math.random() < b2.mergeChance) {
                          // MERGE SUCCESSFUL!
                          const newBeing = Being.createMergedBeing(this, b2); // Static method called
                          
                          if (newBeing) {
                              Object.assign(this, newBeing); 
                              b2.isEaten = true; 
                              break; 
                          } else {
                              b2.isEaten = true;
                              break; 
                          }
                      } else {
                          // PREDATION SUCCESSFUL!
                          this.energy = Math.min(this.maxEnergy, this.energy + CONFIG.energyGainFromBeing * b2.cellCount);
                          b2.isEaten = true;
                          break; 
                      }
                  }
              }
          }
        }
        // eat food on contact
        for(let i = foods.length-1; i>=0; --i){ // Uses imported foods array
          const f = foods[i];
          const d = Math.hypot(this.x - f.x, this.y - f.y);
          if(d < this.r + CONFIG.foodRadius){
            this.energy = Math.min(this.maxEnergy, this.energy + CONFIG.energyGainPerFood);
            foods.splice(i,1); // Modifies imported foods array
            
            // reproduction
            if (this.energy >= this.maxEnergy) {
              this.energy = this.maxEnergy * 0.6;
              // Pushes new being into imported beings array
              beings.push(new Being(this.x + Math.random()*20-10, this.y + Math.random()*20-10, 
                  this.maxSpeed, this.senseRange, this.sizeMultiplier, this.mergeChance, this.cellCount));
            }
          }
        }
    }
    
    draw(ctx){
        const r = this.r; 
        const positions = this.cellPositions;
        const headX = this.x;
        const headY = this.y;
        
        // 1. Visualize senseRange
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(headX, headY, this.senseRange, 0, Math.PI * 2); ctx.stroke();
        
        // 2. Visualize maxSpeed 
        const speedRatio = this.maxSpeed / CONFIG.initialMaxSpeed;
        if (Math.abs(speedRatio - 1) > 0.05) { 
          ctx.strokeStyle = speedRatio > 1 ? 'rgba(0,255,0,0.6)' : 'rgba(255,0,0,0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(headX, headY, r * 1.5 * Math.min(3, speedRatio), 0, Math.PI * 2); 
          ctx.stroke();
        }
        
        // 3. Calculate Color based on Speed
        const maxRefSpeed = 4.0; const minRefSpeed = CONFIG.minSpeed; 
        const speedRange = maxRefSpeed - minRefSpeed;
        const normalizedSpeed = Math.min(1, Math.max(0, (this.maxSpeed - minRefSpeed) / speedRange));
        const red = Math.floor(255 * (1 - normalizedSpeed));
        const green = Math.floor(255 * normalizedSpeed);
        const blue = 50; 
        const bodyColor = `rgb(${red}, ${green}, ${blue})`; 
        
        // 4a. Visualize Merge Chance
        if (this.mergeChance > 0) {
            const glowRadius = r * (1.1 + this.mergeChance * 0.4); 
            const opacity = this.mergeChance * 0.45; 
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 0, 255, ${opacity})`;
            ctx.lineWidth = 5 + this.mergeChance * 5; 
            ctx.arc(headX, headY, glowRadius, 0, Math.PI * 2); 
            ctx.stroke();
        }
        // 4b. Draw connections/slime trail
        if (this.cellCount > 1) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.5)`;
            ctx.lineWidth = r * 0.8; 
            
            ctx.moveTo(positions[0].x, positions[0].y);
            for (let i = 1; i < positions.length; i++) {
                ctx.lineTo(positions[i].x, positions[i].y);
            }
            ctx.stroke();
        }
        // 4c. Draw all cells (circles)
        for (let i = positions.length - 1; i >= 0; i--) {
            const pos = positions[i];
            ctx.beginPath(); 
            ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); 
            ctx.fillStyle = bodyColor; 
            ctx.fill();
            
            if (this.cellCount > 1) {
                ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`; 
                ctx.lineWidth = i === 0 ? 3 : 2; 
                ctx.stroke();
            }
            // Simple eyes on the HEAD cell only
            if (i === 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)'; 
                ctx.beginPath(); 
                ctx.arc(pos.x - r * 0.3, pos.y - r * 0.2, 2, 0, Math.PI * 2); ctx.fill(); 
                ctx.beginPath(); 
                ctx.arc(pos.x + r * 0.3, pos.y - r * 0.2, 2, 0, Math.PI * 2); ctx.fill();
            }
        }
        // 5. Energy Bar and Cell Count
        const w = r*2; const h = 4; const px = headX - r; const py = headY - r - 8;
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(px-1,py-1,w+2,h+2);
        
        const pct = Math.max(0, this.energy / this.maxEnergy); 
        ctx.fillStyle = `rgba(${Math.floor(200*(1-pct))},${Math.floor(200*pct)},40,0.95)`;
        ctx.fillRect(px,py,w*pct,h);
        
        if (this.cellCount > 1) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`x${this.cellCount}`, headX, py - 4);
        }
    }
}

function spawnBeings(n=1){
  for(let i=0;i<n;i++){
    beings.push(new Being(Math.random()*(simWidth-40)+20, Math.random()*(simHeight-40)+20, 
      CONFIG.initialMaxSpeed, CONFIG.initialSenseRange, CONFIG.initialSizeMultiplier, CONFIG.initialMergeChance));
  }
}

export { Being, spawnBeings };