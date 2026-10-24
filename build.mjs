import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import {build} from 'esbuild';
fs.mkdirSync('dist',{recursive:true});
await build({entryPoints:['src/rules.ts'],bundle:true,format:'esm',minify:true,outfile:'dist/rules.js'});
await build({entryPoints:['src/rules.ts'],bundle:true,platform:'node',format:'cjs',minify:true,outfile:'dist/rules.cjs'});
const worker=await build({entryPoints:['src/search.worker.ts'],bundle:true,format:'iife',minify:true,write:false});
fs.writeFileSync('dist/marcher-ru.worker.js',fs.readFileSync('vendor/marcher-ru/marcher-scalar.js','utf8')+'\n'+worker.outputFiles[0].text);
fs.copyFileSync('src/client.js','dist/client.js');fs.copyFileSync('vendor/marcher-ru/marcher-scalar.wasm','dist/marcher-scalar.wasm');
const parts=[];for(const name of fs.readdirSync('vendor/damka/db').filter(n=>n.endsWith('.bin')).sort()){const bytes=fs.readFileSync(path.join('vendor/damka/db',name)),header=Buffer.alloc(4);header.writeUInt32LE(bytes.length);parts.push(header,bytes)}fs.writeFileSync('dist/tables.gz',zlib.gzipSync(Buffer.concat(parts),{level:9}));console.log('Built ESM client, Russian rules, Web Worker, Marcher WASM and five-piece tables.');
