// Food.js
import { CONFIG } from './Config.js';
import { foods, simWidth, simHeight } from './Main.js';

export class Food {
  constructor(x,y){ 
    this.x=x; this.y=y; this.r=CONFIG.foodRadius; 
  }
  draw(ctx){ 
    ctx.beginPath(); 
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2); 
    ctx.fillStyle='limegreen'; 
    ctx.fill(); 
  }
}

export function spawnFood(n=1, x=null, y=null){
  for(let i=0;i<n;i++){
    if(foods.length >= CONFIG.maxFood) break; 
    const spawnX = x !== null ? x : Math.random()*(simWidth-40)+20; 
    const spawnY = y !== null ? y : Math.random()*(simHeight-40)+20;
    foods.push(new Food(spawnX, spawnY));
  }
}