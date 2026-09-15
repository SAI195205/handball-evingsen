let teams=HandballStore.teams(),games=HandballStore.games(),news=HandballStore.news();function switchTab(n){document.querySelectorAll('.admin-section').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.admin-nav button').forEach(x=>x.classList.toggle('active',x.dataset.tab===n));document.getElementById('tab-'+n).classList.add('active')}document.querySelectorAll('.admin-nav button').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));function closeModal(id){document.getElementById(id).classList.remove('open')}function render(){teamTable.innerHTML=`<table class="admin-table"><thead><tr><th>Mannschaft</th><th>Training</th><th>Ansprechpartner</th><th></th></tr></thead><tbody>${teams.map((t,i)=>`<tr><td><strong>${t.name}</strong><br><span class="small">${t.org}</span></td><td>${t.training}</td><td>${t.coach}</td><td><button class="smallbtn" onclick="openTeam(${i})">Bearbeiten</button></td></tr>`).join('')}</tbody></table>`;gameTable.innerHTML=`<table class="admin-table"><thead><tr><th>Datum</th><th>Team</th><th>Spiel</th><th>Status</th><th></th></tr></thead><tbody>${games.map((g,i)=>`<tr><td>${g.date}<br>${g.time}</td><td>${g.team}</td><td><strong>${g.home} – ${g.away}</strong><br><span class="small">${g.place}</span></td><td><span class="status ${g.status||'geplant'}">${g.status||'geplant'}</span></td><td><button class="smallbtn" onclick="openGame(${i})">Bearbeiten</button> <button class="smallbtn danger" onclick="deleteGame(${i})">Löschen</button></td></tr>`).join('')}</tbody></table>`;newsTable.innerHTML=`<table class="admin-table"><thead><tr><th>Datum</th><th>Team</th><th>Überschrift</th><th></th></tr></thead><tbody>${news.map((n,i)=>`<tr><td>${n.date}</td><td>${n.team}</td><td>${n.title}</td><td><button class="smallbtn" onclick="openNews(${i})">Bearbeiten</button> <button class="smallbtn danger" onclick="deleteNews(${i})">Löschen</button></td></tr>`).join('')}</tbody></table>`;const opts=teams.map(t=>`<option>${t.name}</option>`).join('');gTeam.innerHTML=opts;nTeam.innerHTML=opts}function openGame(i=''){gameIndex.value=i;const g=i===''?{team:teams[0].name,status:'geplant',date:'',time:'',home:'',away:'',place:'',homeScore:'',awayScore:''}:games[i];gTeam.value=g.team;gStatus.value=g.status||'geplant';gDate.value=g.date;gTime.value=g.time;gHome.value=g.home;gAway.value=g.away;gPlace.value=g.place;gHomeScore.value=g.homeScore||'';gAwayScore.value=g.awayScore||'';gameModal.classList.add('open')}function saveGame(){const i=gameIndex.value,g={team:gTeam.value,status:gStatus.value,date:gDate.value,time:gTime.value,home:gHome.value,away:gAway.value,place:gPlace.value,homeScore:gHomeScore.value,awayScore:gAwayScore.value,type:'Spiel'};if(i==='')games.unshift(g);else games[+i]=g;HandballStore.set('hb_games',games);closeModal('gameModal');render()}function deleteGame(i){if(confirm('Spiel löschen?')){games.splice(i,1);HandballStore.set('hb_games',games);render()}}function openNews(i=''){newsIndex.value=i;const n=i===''?{team:teams[0].name,date:'',title:'',text:'',image:''}:news[i];nTeam.value=n.team;nDate.value=n.date;nTitle.value=n.title;nText.value=n.text;nImage.value='';newsModal.classList.add('open')}function fileData(f){
 return new Promise((resolve,reject)=>{
   if(!f) return resolve(null);
   if(!f.type.startsWith('image/')){
     return reject(new Error('Bitte eine Bilddatei auswählen.'));
   }
   const reader=new FileReader();
   reader.onerror=()=>reject(new Error('Bild konnte nicht gelesen werden.'));
   reader.onload=()=>{
     const img=new Image();
     img.onerror=()=>reject(new Error('Bild konnte nicht verarbeitet werden.'));
     img.onload=()=>{
       const max=1600;
       let w=img.width,h=img.height;
       if(w>max||h>max){
         const scale=Math.min(max/w,max/h);
         w=Math.round(w*scale); h=Math.round(h*scale);
       }
       const c=document.createElement('canvas');
       c.width=w;c.height=h;
       c.getContext('2d').drawImage(img,0,0,w,h);
       resolve(c.toDataURL('image/jpeg',0.78));
     };
     img.src=reader.result;
   };
   reader.readAsDataURL(f);
 });
}
async function saveNews(){
 try{
   const idx=document.getElementById('newsIndex').value;
   const old=idx===''?{}:news[+idx];
   const team=document.getElementById('nTeam').value;
   const date=document.getElementById('nDate').value.trim();
   const title=document.getElementById('nTitle').value.trim();
   const text=document.getElementById('nText').value.trim();
   if(!team||!date||!title||!text){
     alert('Bitte Mannschaft, Datum, Überschrift und Text ausfüllen.');
     return;
   }
   const input=document.getElementById('nImage');
   const img=await fileData(input.files[0]);
   const entry={team,date,title,text,image:img||old.image||('BILDPLATZHALTER · '+team)};
   if(idx==='') news.unshift(entry); else news[+idx]=entry;
   try{
     HandballStore.set('hb_news',news);
   }catch(e){
     alert('Der Browser-Speicher ist voll. Bitte ein kleineres Bild verwenden.');
     return;
   }
   closeModal('newsModal');
   render();
   alert('Spielbericht wurde gespeichert.');
 }catch(e){
   console.error(e);
   alert(e.message||'Spielbericht konnte nicht gespeichert werden.');
 }
}
function deleteNews(i){if(confirm('Bericht löschen?')){news.splice(i,1);HandballStore.set('hb_news',news);render()}}function openTeam(i){teamIndex.value=i;const t=teams[i];tName.value=t.name;tTraining.value=t.training;tCoach.value=t.coach;tImage.value='';teamModal.classList.add('open')}async function saveTeam(){const i=+teamIndex.value,t=teams[i],img=await fileData(tImage.files[0]);t.training=tTraining.value;t.coach=tCoach.value;if(img)t.image=img;teams[i]=t;HandballStore.set('hb_teams',teams);closeModal('teamModal');render()}function exportData(){const b=new Blob([JSON.stringify({teams,games,news},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='handball-daten.json';a.click()}importFile.onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());if(d.teams)teams=d.teams;if(d.games)games=d.games;if(d.news)news=d.news;HandballStore.set('hb_teams',teams);HandballStore.set('hb_games',games);HandballStore.set('hb_news',news);render()}catch(e){alert('Import fehlgeschlagen')}};function resetAll(){if(confirm('Alles zurücksetzen?')){HandballStore.reset();location.reload()}}render();