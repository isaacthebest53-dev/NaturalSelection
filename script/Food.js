// Food.js
import { CONFIG } from './Config.js';
import { foods, simWidth, simHeight } from './Main.js';

/**
 * Represents a piece of food on the map.
 */
export class Food {
  constructor(x,y){ 
    this.x=x; 
    this.y=y; 
    this.r=CONFIG.foodRadius; 
  }
  
  /**
   * Draws the food item on the canvas.
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx){ 
    ctx.beginPath(); 
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2); 
    ctx.fillStyle='limegreen'; 
    ctx.fill(); 
  }
}

/**
 * Spawns 'n' food items at a specific location or randomly.
 * @param {number} [n=1] - Number of food items to spawn.
 * @param {number} [x=null] - X coordinate to spawn at. Random if null.
 * @param {number} [y=null] - Y coordinate to spawn at. Random if null.
 */
export function spawnFood(n=1, x=null, y=null){
  for(let i=0;i<n;i++){
    //if(foods.length >= CONFIG.maxFood) {
    //  console.log ("Full");
    //  break;
    //} 
    // If x/y provided, use them; otherwise, pick a random spot within boundaries
    const spawnX = x !== null ? x : Math.random()*(simWidth-40)+20; 
    const spawnY = y !== null ? y : Math.random()*(simHeight-40)+20;
    foods.push(new Food(spawnX, spawnY));
  }
}