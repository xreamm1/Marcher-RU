import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {loadSearch,loadNeural} from './tests/load-search.mjs';
const R=await loadSearch(),neural=await loadNeural(R),budget=Number(process.env.BUDGET||250),pairs=Number(process.env.PAIRS||3);
if(!Number.isInteger(budget)||budget<1||budget>5000||!Number.isInteger(pairs)||pairs<1||pairs>100)throw Error('BUDGET 1..5000, PAIRS 1..100');
const data=gunzipSync(readFileSync(new URL('dist/tables.gz',import.meta.url)));for(let at=0;at<data.length;){const n=data.readUInt32LE(at);at+=4;R.dbAddSlice(new Uint8Array(data.subarray(at,at+n)));at+=n}
const stats=[{engine:'marcher-ru',wins:0,draws:0,losses:0,unfinished:0,nodes:0,time:0,depth:0,searches:0},{engine:'damka',nodes:0,time:0,depth:0,searches:0}],games=[];
let seed=82731;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)%n};
for(let pair=0;pair<pairs;pair++){
 let start=R.initialBitPosition();if(pair){const moves=new Int32Array(512);for(let ply=0;ply<6;ply++){const n=R.generate(start.white,start.black,start.kings,start.side,moves,0),at=random(n)*2;start=R.applyMove(start,moves[at],moves[at+1])}}
 for(let color=0;color<2;color++){
  let p=start,winner=0,reason='180-ply safety limit',plies=0;const seen=new Map();
  for(;plies<180;plies++){
   const result=R.status(p.white,p.black,p.kings,p.side,p.plies,0);if(result){winner=result===3?0:result;reason='rules';break}
   const key=[p.white,p.black,p.kings,p.side].join(':');seen.set(key,(seen.get(key)||0)+1);if(seen.get(key)>=3){reason='threefold repetition';break}
   const who=p.side===color?0:1;R.ttClear();globalThis.__marcherOrdering=who===0?neural:null;
   const started=performance.now(),r=R.search(p.white,p.black,p.kings,p.side,p.plies,{variant:0,depth:32,budgetMs:budget,margin:0,russian:who===0});
   const s=stats[who];s.nodes+=r.nodes;s.time+=performance.now()-started;s.depth+=r.depth;s.searches++;p=R.applyMove(p,r.m0,r.m1);
  }
  const result=plies===180?'unfinished':winner===0?'draws':winner===color+1?'wins':'losses';stats[0][result]++;
  const game={pair,marcherColor:color===0?'white':'black',result,plies,reason,start};games.push(game);console.log(JSON.stringify(game));
 }
}
delete globalThis.__marcherOrdering;
const report={version:JSON.parse(readFileSync(new URL('package.json',import.meta.url))).version,budgetMs:budget,pairs,seed:82731,depthLimit:32,notes:'Same process and wall-clock budget, five-piece tables, TT cleared each turn as in the shared game Worker. Small sample; no Elo claim.',stats:stats.map(s=>({...s,nps:Math.round(s.nodes/s.time*1000),averageDepth:s.depth/s.searches})),games};
console.log(JSON.stringify(report,null,2));if(process.env.REPORT)writeFileSync(process.env.REPORT,JSON.stringify(report,null,2)+'\n');
