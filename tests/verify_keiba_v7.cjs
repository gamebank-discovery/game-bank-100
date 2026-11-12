/** KEIBA EDGE PRO v7 static + tactical policy regression test. */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../public-mirror/games/keiba-edge-pro/index.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(Boolean);
assert.ok(scripts.length>=2,'expected inline scripts');
scripts.forEach((src,i)=>{new vm.Script(src,{filename:'game-inline-'+i+'.js'});});
for(const item of ['id="dsDifficulty"','id="dsCoachText"','function storyAdvice(','tacticalBonus','rivalBoost','story.difficulty']) {
 assert.ok(html.includes(item),'missing v7 feature: '+item);
}
const script=scripts.find(src=>src.includes('function storyAdvice('));
assert.ok(script,'advisor script missing');
const match=script.match(/function storyAdvice\(step,energy,leaderGap,wet\)\{[\s\S]*?\n\}/);
assert.ok(match,'advisor not extractable');
const sandbox={};vm.createContext(sandbox);vm.runInContext(match[0],sandbox);
const advice=sandbox.storyAdvice;
assert.equal(advice(0,100,0,false).mode,'move','starting position: move');
assert.equal(advice(2,18,2,false).mode,'save','energy critical: save');
assert.equal(advice(3,70,15,false).mode,'move','far behind in corner: move');
assert.equal(advice(5,80,-2,false).mode,'burst','final straight with energy: burst');
assert.equal(advice(2,60,3,true).mode,'save','rain: save');
assert.equal(advice(5,23,5,false).mode,'save','no all-out attack when exhausted');
assert.ok(html.includes('r.difficulty||\'standard\''),'old v6 saved races must default to standard');
console.log('PASS: v7 inline JS syntax ('+scripts.length+' scripts), tactical advice, difficulty, backward compatibility');
