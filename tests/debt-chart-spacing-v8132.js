const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'app/src/main/assets/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/style.css'),'utf8');
const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/build.yml'),'utf8');

function ok(c,m){if(!c)throw new Error(m);console.log(m+':OK')}

ok(js.includes('home-debt-body-v70'),'debt-body-class');
ok(css.includes('.home-debt-body-v70'),'debt-body-css');
ok(css.includes('column-gap:22px!important'),'desktop-debt-gap');
ok(css.includes('column-gap:14px!important'),'small-phone-debt-gap');
ok(css.includes('grid-template-columns:132px minmax(0,1fr)!important'),'desktop-protected-chart-column');
ok(css.includes('grid-template-columns:108px minmax(0,1fr)!important'),'small-phone-protected-chart-column');
ok(/versionCode\s+96/.test(gradle)&&/versionName\s+"8\.13\.2"/.test(gradle),'android-version-8.13.2');
ok(workflow.includes('UangKu-v8.13.2-TEST-debug-apk'),'v8132-debug-artifact');
