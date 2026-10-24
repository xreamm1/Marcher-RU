import {writeFileSync} from 'node:fs';
import {cpus} from 'node:os';
import {loadSearch} from './tests/load-search.mjs';
const R=await loadSearch(),p=R.initialBitPosition(),samples=[];
// Fixed tree, cold TT and no root NNUE: compare elapsed work, not timer noise.
for(let i=0;i<4;i++){
 R.ttClear();const started=performance.now(),r=R.search(p.white,p.black,p.kings,p.side,p.plies,{variant:0,depth:14,budgetMs:0,margin:0,russian:true}),time=performance.now()-started;
 if(i)samples.push({nodes:r.nodes,score:r.score,m0:r.m0,m1:r.m1,time,nps:Math.round(r.nodes/time*1000)});
}
const report={version:'0.2.1',node:process.version,cpu:cpus()[0]?.model,position:'initial',depth:14,rootNnue:false,coldTT:true,samples};
console.log(JSON.stringify(report,null,2));if(process.env.REPORT)writeFileSync(process.env.REPORT,JSON.stringify(report,null,2)+'\n');
