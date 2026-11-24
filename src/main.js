
import './style.css';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const KEY='fitness-pro-data-v1';
const defaults={goal:'massa',waterGoal:2500,water:[],workouts:[],runs:[],weight:[],settings:{},activeRun:null};
let data=load();
let runWatch=null, runStart=null, runCoords=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function load(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return structuredClone(defaults)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));}
function today(){return new Date().toISOString().slice(0,10)}
function fmtDate(d){return new Date(d).toLocaleDateString('pt-BR')}
function duration(ms){let s=Math.floor(ms/1000);return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function notify(t){const n=$('#notice');n.textContent=t;n.classList.remove('hidden');setTimeout(()=>n.classList.add('hidden'),3200)}
function view(name){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===`view-${name}`));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.view===name));render()}
function shell(){ $('#app').innerHTML=`
<header><div class="brand">FITNESS <span>PRO</span></div><div class="sub">Seu treino. Seu ritmo. Sua evolução.</div></header>
<main><div id="notice" class="notice hidden"></div>
<section id="view-home" class="view active"></section>
<section id="view-workouts" class="view"></section>
<section id="view-run" class="view"></section>
<section id="view-water" class="view"></section>
<section id="view-profile" class="view"></section></main>
<nav>${[['home','⌂','Início'],['workouts','🏋','Treinos'],['run','➤','Corrida'],['water','💧','Água'],['profile','⚙','Mais']].map(([v,i,t])=>`<button data-view="${v}" onclick="window.go('${v}')"><b>${i}</b>${t}</button>`).join('')}</nav>`;
}
window.go=view;
function render(){home();workouts();running();water();profile()}
function home(){
 const done=data.workouts.filter(w=>w.date===today()).length, water=data.water.filter(x=>x.date===today()).reduce((a,x)=>a+x.ml,0);
 $('#view-home').innerHTML=`<h1>Olá! Vamos treinar? 🔥</h1><p class="muted">Seu progresso começa hoje.</p>
 <div class="grid"><div class="card"><div class="muted small">Treinos hoje</div><div class="metric pink">${done}</div></div><div class="card"><div class="muted small">Corridas registradas</div><div class="metric blue">${data.runs.length}</div></div></div>
 <div class="card"><h2>💧 Hidratação de hoje</h2><div class="row"><strong>${water} ml</strong><span class="muted small" style="text-align:right">Meta ${data.waterGoal} ml</span></div><div class="progress"><i style="width:${Math.min(100,water/data.waterGoal*100)}%"></i></div><p><button onclick="window.go('water')">Registrar água</button></p></div>
 <div class="card"><h2>Escolha seu treino</h2><div class="grid">${['Academia','Rua','Casa','Calistenia'].map(m=>`<button class="secondary" onclick="window.newWorkout('${m}')">${m}</button>`).join('')}</div></div>
 <div class="card"><h2>Objetivo atual</h2><span class="pill">${data.goal==='massa'?'Ganhar massa muscular':'Perder peso'}</span><p class="muted small">Acompanhe sua rotina e evolução em um só lugar.</p></div>`;
}
window.newWorkout=(mode)=>{view('workouts');$('#workout-mode').value=mode;$('#workout-name').focus()};
function workouts(){
 $('#view-workouts').innerHTML=`<h1>Meus treinos</h1><p class="muted">Crie fichas e registre o que realizou.</p>
 <div class="card"><h2>Novo treino</h2><label>Modalidade</label><select id="workout-mode"><option>Academia</option><option>Rua</option><option>Casa</option><option>Calistenia</option></select>
 <label>Nome do treino</label><input id="workout-name" placeholder="Ex.: Peito e tríceps">
 <label>Exercícios (um por linha)</label><textarea id="workout-exercises" rows="3" placeholder="Supino reto - 3x10&#10;Crucifixo - 3x12"></textarea>
 <div class="row"><div><label>Duração (minutos)</label><input id="workout-min" type="number" min="1" placeholder="60"></div><div><label>Data</label><input id="workout-date" type="date" value="${today()}"></div></div>
 <button style="width:100%;margin-top:12px" onclick="window.addWorkout()">Salvar treino</button></div>
 <div class="card"><h2>Histórico</h2>${data.workouts.length? [...data.workouts].reverse().map(w=>`<div class="item"><div class="row"><strong>${esc(w.name)}</strong><span class="pill">${esc(w.mode)}</span></div><div class="muted small">${fmtDate(w.date)} · ${w.minutes||0} min</div><div class="small">${esc(w.exercises||'')}</div><div class="actions" style="margin-top:8px"><button class="secondary" onclick="window.editWorkout('${w.id}')">Editar</button><button class="danger" onclick="window.deleteWorkout('${w.id}')">Excluir</button></div></div>`).join(''):'<p class="muted">Nenhum treino registrado ainda.</p>'}</div>`;
}
window.addWorkout=()=>{let name=$('#workout-name').value.trim();if(!name)return notify('Informe o nome do treino.');data.workouts.push({id:crypto.randomUUID(),mode:$('#workout-mode').value,name,exercises:$('#workout-exercises').value,minutes:Number($('#workout-min').value)||0,date:$('#workout-date').value||today()});save();render();notify('Treino salvo!')};
window.editWorkout=id=>{let w=data.workouts.find(x=>x.id===id);if(!w)return;let name=prompt('Nome do treino:',w.name);if(name===null)return;w.name=name;w.exercises=prompt('Exercícios:',w.exercises)||'';w.minutes=Number(prompt('Duração em minutos:',w.minutes)||w.minutes);save();render()};
window.deleteWorkout=id=>{if(confirm('Excluir este treino?')){data.workouts=data.workouts.filter(x=>x.id!==id);save();render()}};
function water(){let amount=data.water.filter(x=>x.date===today()).reduce((a,x)=>a+x.ml,0);
 $('#view-water').innerHTML=`<h1>Hidratação 💧</h1><div class="card"><div class="muted">Consumido hoje</div><div class="metric blue">${amount} ml</div><div class="progress"><i style="width:${Math.min(100,amount/data.waterGoal*100)}%"></i></div><p class="muted small">Meta diária: ${data.waterGoal} ml</p><div class="actions">${[150,250,500].map(n=>`<button onclick="window.addWater(${n})">+${n} ml</button>`).join('')}</div><label>Meta diária (ml)</label><input id="water-goal" type="number" value="${data.waterGoal}"><button class="secondary" style="margin-top:8px" onclick="window.setWaterGoal()">Salvar meta</button></div>
 <div class="card"><h2>Registros de hoje</h2>${data.water.filter(x=>x.date===today()).map(x=>`<div class="item">${x.ml} ml <span class="muted small">${new Date(x.at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span></div>`).join('')||'<p class="muted">Nenhum registro ainda.</p>'}</div>`;
}
window.addWater=n=>{data.water.push({ml:n,date:today(),at:Date.now()});save();render()};
window.setWaterGoal=()=>{data.waterGoal=Math.max(250,Number($('#water-goal').value)||2500);save();render();notify('Meta atualizada.')};
function running(){let km=calcKm(runCoords);$('#view-run').innerHTML=`<h1>Corrida GPS</h1><p class="muted">O GPS registra seu percurso mesmo sem internet. O mapa online pode não ficar disponível offline.</p><div class="card"><div class="muted small">Distância</div><div class="gps pink">${km.toFixed(2)} km</div><div class="row"><div><div class="muted small">Tempo</div><strong id="run-time">${duration(runStart?Date.now()-runStart:0)}</strong></div><div><div class="muted small">Pontos GPS</div><strong>${runCoords.length}</strong></div></div><div class="actions" style="margin-top:15px"><button id="run-start" onclick="window.startRun()">Iniciar</button><button class="secondary" onclick="window.finishRun()">Finalizar e salvar</button></div><p class="muted small" id="gps-status">Pronto para iniciar.</p></div>
 <div class="card"><h2>Histórico de corridas</h2>${data.runs.length?[...data.runs].reverse().map(r=>`<div class="item"><strong>${r.km.toFixed(2)} km</strong> · ${duration(r.ms)}<div class="muted small">${fmtDate(r.date)} · ${r.points.length} pontos GPS</div><button class="secondary" style="margin-top:7px" onclick="window.exportRun('${r.id}')">Exportar percurso</button></div>`).join(''):'<p class="muted">Nenhuma corrida salva.</p>'}</div>`;
}
function calcKm(points){let total=0;for(let i=1;i<points.length;i++)total+=dist(points[i-1],points[i]);return total}
function dist(a,b){const R=6371,rad=x=>x*Math.PI/180, dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon),v=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(v))}
window.startRun=async()=>{if(runWatch!==null)return;runStart=Date.now();runCoords=[];$('#gps-status').textContent='Solicitando permissão de localização...';try{
 if(Capacitor.isNativePlatform()){await Geolocation.requestPermissions();runWatch=await Geolocation.watchPosition({enableHighAccuracy:true,timeout:15000,maximumAge:1000},(p,e)=>{if(p)runCoords.push({lat:p.coords.latitude,lon:p.coords.longitude,at:Date.now(),accuracy:p.coords.accuracy})});}
 else if(navigator.geolocation){runWatch=navigator.geolocation.watchPosition(p=>runCoords.push({lat:p.coords.latitude,lon:p.coords.longitude,at:Date.now(),accuracy:p.coords.accuracy}),e=>$('#gps-status').textContent=e.message,{enableHighAccuracy:true});}
 else throw new Error('GPS não disponível neste dispositivo.');
 $('#gps-status').textContent='Corrida em andamento. Mantenha a localização ativada.';$('#run-start').textContent='Correndo...';notify('GPS iniciado.');
 }catch(e){runStart=null;$('#gps-status').textContent=e.message||'Não foi possível iniciar o GPS.';runWatch=null}};
window.finishRun=async()=>{if(!runStart||runWatch===null&&runCoords.length===0)return notify('Inicie uma corrida primeiro.');if(Capacitor.isNativePlatform()&&runWatch!==null){try{await Geolocation.clearWatch({id:runWatch})}catch{}}else if(runWatch!==null)navigator.geolocation.clearWatch(runWatch);
 const ms=Date.now()-runStart;data.runs.push({id:crypto.randomUUID(),date:today(),ms,km:calcKm(runCoords),points:runCoords});save();runWatch=null;runStart=null;runCoords=[];render();notify('Corrida salva no histórico.')};
window.exportRun=id=>{let r=data.runs.find(x=>x.id===id);download(`fitness-pro-corrida-${r.date}.json`,JSON.stringify(r,null,2),'application/json')};
function profile(){const totalKm=data.runs.reduce((a,r)=>a+r.km,0);$('#view-profile').innerHTML=`<h1>Mais opções</h1>
 <div class="card"><h2>Objetivo físico</h2><select id="goal"><option value="massa" ${data.goal==='massa'?'selected':''}>Ganhar massa muscular</option><option value="peso" ${data.goal==='peso'?'selected':''}>Perder peso</option></select><button style="margin-top:9px" onclick="window.saveGoal()">Salvar objetivo</button></div>
 <div class="grid"><div class="card"><div class="muted small">Treinos salvos</div><div class="metric">${data.workouts.length}</div></div><div class="card"><div class="muted small">Distância total</div><div class="metric blue">${totalKm.toFixed(1)} km</div></div></div>
 <div class="card"><h2>Backup e restauração</h2><p class="muted small">Exporte seus dados para guardar no aparelho ou compartilhar. Para recuperar, selecione um arquivo de backup FITNESS PRO.</p><button style="width:100%" onclick="window.backup()">⬇ Exportar backup</button><label>Importar backup JSON</label><input type="file" id="import-file" accept=".json,application/json"><button class="secondary" style="width:100%;margin-top:8px" onclick="window.importBackup()">⬆ Importar backup</button><p class="muted small">A importação substitui os dados atuais. Exporte um backup antes, se quiser preservá-los.</p></div>
 <div class="card"><h2>Sobre</h2><p class="muted small">FITNESS PRO · versão 1.0 · Dados armazenados localmente neste aparelho.</p></div>`;
}
window.saveGoal=()=>{data.goal=$('#goal').value;save();notify('Objetivo atualizado.');home()};
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
window.backup=()=>{save();download(`fitness-pro-backup-${today()}.json`,JSON.stringify({app:'FITNESS PRO',version:1,exportedAt:new Date().toISOString(),data},null,2),'application/json');notify('Backup exportado. Você pode compartilhar o arquivo.')};
window.importBackup=async()=>{const f=$('#import-file').files[0];if(!f)return notify('Escolha um arquivo JSON.');try{const obj=JSON.parse(await f.text()),incoming=obj.data||obj;if(!incoming||!Array.isArray(incoming.workouts)||!Array.isArray(incoming.runs)||!Array.isArray(incoming.water))throw Error('Arquivo não reconhecido como backup FITNESS PRO.');if(!confirm('Importar este backup e substituir os dados atuais?'))return;data={...structuredClone(defaults),...incoming};save();render();notify('Backup importado com sucesso.')}catch(e){notify(e.message||'Não foi possível importar o arquivo.')}};
shell();render();
