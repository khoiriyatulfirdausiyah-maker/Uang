const fs=require('fs');
const vm=require('vm');
const path=require('path');
const root=path.resolve(__dirname,'..');

const jsPath=path.join(root,'app/src/main/assets/app.js');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/style.css'),'utf8');
const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/build.yml'),'utf8');

let src=fs.readFileSync(jsPath,'utf8')
  .replace("applyThemeV82(false);\nsetHeader('home');render();",'')
  .replace("setHeader('home');render();",'');

function ok(c,m){
  if(!c)throw new Error(m);
  console.log(m+':OK');
}

ok(src.includes('function scheduleStatePersistV812'),'deferred-state-persist');
ok(src.includes('function flushStateV812'),'state-flush-hook');
ok(src.includes('requestIdleCallback'),'idle-save-path');
ok(src.includes('function scheduleRenderV812'),'scheduled-render');
ok(src.includes('function financeTotalsV812'),'global-finance-cache');
ok(src.includes('function budgetStatsV812'),'budget-stats-cache');
ok(src.includes('function appendTransactionsV812'),'true-append-pagination');
ok(src.includes("insertAdjacentHTML('beforeend'"),'transaction-append-dom');
ok(src.includes("next==='transactions'&&currentPage!=='transactions'"),'pagination-reset-on-entry');
ok(!css.includes('content-visibility:auto'),'android-content-visibility-auto-removed');
ok(css.includes('content-visibility:visible!important'),'transaction-content-visibility-explicit');
ok(/versionCode\s+95/.test(gradle)&&/versionName\s+"8\.13\.1"/.test(gradle),'android-version-8.13.1');
ok(workflow.includes('UangKu-v8.13.1-TEST-debug-apk'),'v8131-debug-artifact');
ok(workflow.includes('UangKu-v8.13.1-SIGNED-release-apk'),'v8131-signed-artifact');
ok(workflow.includes('node tests/responsiveness-v812.js'),'responsiveness-workflow-test');

let writes=0;
let timers=[];
const storage={};

const dummy={
  classList:{toggle(){},add(){},remove(){}},
  style:{},dataset:{},textContent:'',value:'',innerHTML:'',outerHTML:'',
  onclick:null,onchange:null,onsubmit:null,onkeydown:null,
  click(){},focus(){},setAttribute(){},addEventListener(){},
  querySelectorAll(){return[]},querySelector(){return null},closest(){return null},
  scrollTo(){},insertAdjacentHTML(){},remove(){},
  clientWidth:320,scrollLeft:0,scrollHeight:0
};

const context={
  console,
  window:{scrollTo(){},Native:null,addEventListener(){}},
  document:{
    visibilityState:'visible',
    documentElement:{dataset:{},style:{}},
    querySelector(){return dummy},
    querySelectorAll(){return[]},
    createElement(){return dummy},
    addEventListener(){}
  },
  localStorage:{
    getItem(k){return storage[k]??null},
    setItem(k,v){writes++;storage[k]=String(v)},
    removeItem(k){delete storage[k]}
  },
  requestAnimationFrame(fn){fn();return 1},
  setTimeout(fn){timers.push(fn);return timers.length},
  clearTimeout(){},
  confirm(){return false},
  FormData:global.FormData,Blob:global.Blob,URL:global.URL,
  Date,Math,JSON,Intl,Number,String,Array,Object,Set,Map,RegExp,Promise
};

context.global=context;
vm.createContext(context);
vm.runInContext(src,context,{filename:'app.js'});

writes=0;
vm.runInContext(`
state=normalizeState({
  accounts:[],transactions:[],budgets:[],goals:[],
  assets:{investment:[],property:[],physical:[]},
  debts:[],bills:[],routines:[],chat:[],
  categories:['Lainnya'],categoryIcons:{},categoryGroups:{},categoryTypes:{}
});
save();
`,context);

ok(writes===0,'save-does-not-block-on-localstorage');
vm.runInContext("flushStateV812();",context);
ok(writes===1,'flush-persists-state');

const demo={
  accounts:[{id:'a',name:'Bank',type:'Bank',initial:5000000}],
  transactions:[],
  budgets:[{id:'b',month:'2026-09',category:'Makan & Minum',limit:1000000}],
  goals:[],
  assets:{investment:[],property:[],physical:[]},
  debts:[],bills:[],routines:[],chat:[],
  categories:['Makan & Minum','Lainnya'],
  categoryIcons:{},
  categoryGroups:{'Makan & Minum':'needs','Lainnya':'other'},
  categoryTypes:{'Makan & Minum':'expense','Lainnya':'both'}
};

for(let i=0;i<1000;i++){
  demo.transactions.push({
    id:'t'+i,
    type:'expense',
    date:`2026-09-${String(i%28+1).padStart(2,'0')}`,
    amount:1000,
    accountId:'a',
    category:'Makan & Minum'
  });
}

context.demo=demo;
vm.runInContext("state=normalizeState(demo);invalidateDerivedCacheV83();",context);

const b1=context.budgetStatsV812('2026-09');
const b2=context.budgetStatsV812('2026-09');
ok(b1===b2,'budget-stats-memoized');

const f1=context.financeTotalsV812();
const f2=context.financeTotalsV812();
ok(f1===f2,'finance-totals-memoized');

const txHtml=context.renderTransactions();
const rows=(txHtml.match(/data-edit-tx=/g)||[]).length;
ok(rows<=60,`initial-transaction-dom-bounded (${rows})`);
