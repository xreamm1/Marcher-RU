import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
export async function loadSearch(){
 const {outputFiles}=await build({entryPoints:[fileURLToPath(new URL('search-entry.ts',import.meta.url))],bundle:true,platform:'node',format:'cjs',write:false});
 const m={exports:{}};new Function('module','exports','require',outputFiles[0].text)(m,m.exports,require);return m.exports;
}
export async function loadNeural(R){
 const m={exports:{}},dir=fileURLToPath(new URL('../vendor/marcher-ru/',import.meta.url));new Function('module','exports','require','__dirname','__filename',readFileSync(new URL('../vendor/marcher-ru/marcher-scalar.js',import.meta.url),'utf8'))(m,m.exports,require,dir,dir+'marcher-scalar.js');
 const bytes=readFileSync(new URL('../dist/marcher-scalar.wasm',import.meta.url));
 const M=await m.exports({instantiateWasm(imports,receive){WebAssembly.instantiate(bytes,imports).then(r=>receive(r.instance));return {}}});
 const lo=new BigUint64Array(65536),hi=new BigUint64Array(65536);
 for(let n=1;n<65536;n++){const rest=n&(n-1),bit=31-Math.clz32(n^rest);lo[n]=lo[rest]|1n<<BigInt(R.toSquare64(bit)^56);hi[n]=hi[rest]|1n<<BigInt(R.toSquare64(bit+16)^56)}
 const expand=mask=>lo[mask&65535]|hi[mask>>>16];
 return (w,b,k,s)=>M._wasm_nnue_eval(expand(w&~k),expand(b&~k),expand(w&k),expand(b&k),s+1);
}
