import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadSearch} from './tests/load-search.mjs';
const R=await loadSearch(),initial=R.initialBitPosition();
const rng=R.createRng(20261024),full=new Int32Array(512),leaf=new Int32Array(512);
for(let i=0;i<20000;i++){
 const p=R.randomPlacement(rng),n=R.generate(p.white,p.black,p.kings,p.side,full,0),q=R.generate(p.white,p.black,p.kings,p.side,leaf,0,true);
 if(n===0)assert.equal(q,0);
 else if(full[1]===0)assert.equal(q,-1);
 else {assert.equal(q,n);assert.deepEqual(leaf.slice(0,q*2),full.slice(0,n*2))}
 assert.equal(R.evaluateMen(p.white,p.black,p.side),R.evaluate(p.white,p.black,0,p.side));
}
const run=(p,depth,russian)=>{R.ttClear();return R.search(p.white,p.black,p.kings,p.side,p.plies,{variant:0,depth,budgetMs:0,margin:0,russian})};
const original=run(initial,5,false);
assert.equal(original.score,4);assert.equal(original.nodes,1509);
assert.equal(R.searchStats().reductions,0);
let calls=0;globalThis.__marcherOrdering=()=>{calls++;return 0};
globalThis.__marcherRussianEval=()=>{throw Error('NNUE must never run at leaves')};
const improved=run(initial,9,true),stats=R.searchStats();
assert.equal(calls,7);assert(stats.reductions>0);assert(stats.researches>0);
const moves=new Int32Array(512),count=R.generate(initial.white,initial.black,initial.kings,initial.side,moves,0);
assert(Array.from({length:count},(_,i)=>i).some(i=>moves[i*2]===improved.m0&&moves[i*2+1]===improved.m1));
for(const text of ['W:Wc3:Bb4','W:Wb6:Bc7,f6']){
 const p=R.parsePos(text),r=run(p,7,true),next=R.applyMove(p,r.m0,r.m1);
 assert.equal(next.black,0);assert.equal(R.status(next.white,next.black,next.kings,next.side,next.plies,0),1);
}
delete globalThis.__marcherOrdering;delete globalThis.__marcherRussianEval;
for(const fixture of JSON.parse(readFileSync(new URL('tests/search-fixtures.json',import.meta.url))).tests){
 const r=run(R.parsePos(fixture.position),fixture.depth,true);
 for(const field of ['m0','m1','score','nodes'])assert.equal(r[field],fixture[field],fixture.position+' '+field);
}
const again=run(initial,5,false);assert.equal(again.score,original.score);assert.equal(again.nodes,original.nodes);
console.log('PASS original Damka baseline, root-only NNUE, verified reductions, legal moves, forced captures, unchanged Damka after improved search');
console.log('PASS 20000 leaf/full generator comparisons and exact men-only evaluation');
console.log('PASS identical best moves, scores and node counts against pre-optimization fixtures');
