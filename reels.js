/* CHRISXCHANGE REELS — immersive vertical feed */
const REELS_KEY="chrisxchange-reels-v2",TIKTOK_KEY="chrisxchange-tiktok-reels-v1",USER_KEY="chrisxchange-reel-user";

// Official TikTok embeds. Add public TikTok post URLs here.
// Videos remain hosted by TikTok; this site does not download or re-host them.
const TIKTOK_POSTS = [];
let reels=[],tiktoks=[],objectUrls=new Map();

document.addEventListener("DOMContentLoaded",()=>{
 const um=document.getElementById("uploadModal"),tm=document.getElementById("tiktokModal"),form=document.getElementById("reelForm"),tf=document.getElementById("tiktokForm"),vi=document.getElementById("reelVideo");
 const open=m=>{m.classList.add("open");m.setAttribute("aria-hidden","false")},close=m=>{m.classList.remove("open");m.setAttribute("aria-hidden","true")};
 document.getElementById("openUpload")?.addEventListener("click",()=>open(um));document.getElementById("emptyUpload")?.addEventListener("click",()=>open(um));document.getElementById("openTikTok")?.addEventListener("click",()=>open(tm));
 document.getElementById("closeUpload")?.addEventListener("click",()=>close(um));document.getElementById("closeTikTok")?.addEventListener("click",()=>close(tm));
 [um,tm].forEach(m=>m?.addEventListener("click",e=>{if(e.target===m)close(m)}));
 vi?.addEventListener("change",()=>document.getElementById("fileName").textContent=vi.files[0]?.name||"No video selected");
 form?.addEventListener("submit",async e=>{
  e.preventDefault();const file=vi.files[0];if(!file)return;if(file.size>50*1024*1024){alert("Please choose a video smaller than 50 MB.");return}
  const creator=document.getElementById("creatorName").value.trim(),ownerKey=localStorage.getItem(USER_KEY)||creator;
  const r={id:"local-"+Date.now(),type:"local",creator,caption:document.getElementById("reelCaption").value.trim(),likes:0,comments:[],ownerKey,createdAt:new Date().toISOString()};
  try{await saveVideo(r.id,file);localStorage.setItem(USER_KEY,ownerKey);reels.unshift(r);persist();form.reset();document.getElementById("fileName").textContent="No video selected";close(um);render()}catch(err){alert("The video could not be saved on this device.")}
 });
 tf?.addEventListener("submit",e=>{
  e.preventDefault();const url=document.getElementById("tiktokUrl").value.trim(),m=url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if(!m){alert("Please paste a direct TikTok post URL containing /video/.");return}
  tiktoks.unshift({id:"tt-"+m[1],type:"tiktok",url,videoId:m[1],creator:(url.match(/tiktok\.com\/@([^/]+)/i)||[])[1]||"TikTok creator",caption:document.getElementById("tiktokCaption").value.trim(),likes:0,comments:[],createdAt:new Date().toISOString()});
  localStorage.setItem(TIKTOK_KEY,JSON.stringify(tiktoks));tf.reset();close(tm);render();
 });
 reels=JSON.parse(localStorage.getItem(REELS_KEY)||"[]");
 tiktoks=JSON.parse(localStorage.getItem(TIKTOK_KEY)||"[]");
 const configured=TIKTOK_POSTS.map((p,i)=>{
   const m=String(p.url||"").match(/tiktok\.com\/@([^/]+)\/video\/(\d+)/i);
   return m?{id:"tt-config-"+m[2],type:"tiktok",url:p.url,videoId:m[2],creator:m[1],caption:p.caption||"Trade & business video",likes:0,comments:[],createdAt:"2026-01-01T00:00:00.000Z",configured:true}:null;
 }).filter(Boolean);
 tiktoks=[...configured,...tiktoks.filter(x=>!configured.some(y=>y.id==="tt-config-"+x.videoId))];
 render();
});

function dbOpen(){return new Promise((resolve,reject)=>{const r=indexedDB.open("chrisxchange-reels-db",1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("videos"))r.result.createObjectStore("videos")};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function saveVideo(id,file){const db=await dbOpen();return new Promise((resolve,reject)=>{const t=db.transaction("videos","readwrite");t.objectStore("videos").put(file,id);t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}
async function getVideo(id){const db=await dbOpen();return new Promise((resolve,reject)=>{const t=db.transaction("videos","readonly"),r=t.objectStore("videos").get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function persist(){localStorage.setItem(REELS_KEY,JSON.stringify(reels))}
function persistItem(r){localStorage.setItem(r.type==="tiktok"?TIKTOK_KEY:REELS_KEY,JSON.stringify(r.type==="tiktok"?tiktoks:reels))}

async function render(){
 const feed=document.getElementById("reelsFeed"),empty=document.getElementById("emptyReels"),items=[...reels,...tiktoks].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
 feed.innerHTML="";empty.style.display=items.length?"none":"grid";
 for(const r of items){
  const card=document.createElement("article");card.className="reel-card";card.dataset.id=r.id;card.innerHTML=r.type==="tiktok"?tiktokMarkup(r):localMarkup(r);feed.appendChild(card);
  if(r.type==="local"){const v=card.querySelector(".reel-video");try{const f=await getVideo(r.id);if(f){const old=objectUrls.get(r.id);if(old)URL.revokeObjectURL(old);const src=URL.createObjectURL(f);objectUrls.set(r.id,src);v.src=src}}catch(e){}setupLocal(card,v)}else{loadTikTokEmbed()}
  setupActions(card,r);
 }
 observeVideos();
}
function localMarkup(r){return '<div class="reel-media"><video class="reel-video" playsinline loop preload="metadata"></video><button class="center-play" aria-label="Play"><i class="fa-solid fa-play"></i></button><div class="reel-bottom"><div class="creator-line"><span class="avatar"><i class="fa-solid fa-user"></i></span><strong>@'+escapeHtml(r.creator)+'</strong></div><p>'+escapeHtml(r.caption)+'</p></div><button class="sound-btn" aria-label="Mute or unmute"><i class="fa-solid fa-volume-xmark"></i></button></div>'+actionsMarkup(r)}
function tiktokMarkup(r){return '<div class="reel-media tiktok-media"><blockquote class="tiktok-embed" cite="'+escapeAttr(r.url)+'" data-video-id="'+escapeAttr(r.videoId)+'"><section><a target="_blank" href="'+escapeAttr(r.url)+'">@'+escapeHtml(r.creator)+'</a></section></blockquote><div class="reel-bottom"><div class="creator-line"><span class="avatar tiktok-avatar"><i class="fa-brands fa-tiktok"></i></span><strong>@'+escapeHtml(r.creator)+'</strong></div><p>'+escapeHtml(r.caption||"TikTok video")+'</p></div></div>'+actionsMarkup(r)}
function actionsMarkup(r){return '<div class="reel-side-actions"><button class="side-action like-btn"><i class="fa-regular fa-heart"></i><span>'+r.likes+'</span></button><button class="side-action comment-btn"><i class="fa-regular fa-comment"></i><span>'+r.comments.length+'</span></button><button class="side-action share-btn"><i class="fa-solid fa-share"></i><span>Share</span></button><button class="side-action dots-btn" aria-label="More"><i class="fa-solid fa-ellipsis-vertical"></i></button></div><div class="comments-panel"><div class="comment-list">'+r.comments.map(c=>'<div><strong>'+escapeHtml(c.name)+':</strong> '+escapeHtml(c.text)+'</div>').join("")+'</div><form class="comment-form"><input maxlength="120" placeholder="Write a comment..." required><button><i class="fa-solid fa-paper-plane"></i></button></form></div>'}
function setupLocal(card,v){const p=card.querySelector(".center-play"),s=card.querySelector(".sound-btn"),toggle=()=>{if(v.paused){pauseOthers(v);v.play().catch(()=>{});card.classList.add("playing")}else{v.pause();card.classList.remove("playing")}};p.onclick=toggle;v.onclick=toggle;s.onclick=e=>{e.stopPropagation();v.muted=!v.muted;s.innerHTML=v.muted?'<i class="fa-solid fa-volume-xmark"></i>':'<i class="fa-solid fa-volume-high"></i>'}}
function loadTikTokEmbed(){if(document.querySelector('script[data-tiktok-embed]'))return;const s=document.createElement("script");s.src="https://www.tiktok.com/embed.js";s.async=true;s.dataset.tiktokEmbed="1";document.body.appendChild(s)}
function pauseOthers(x){document.querySelectorAll(".reel-video").forEach(v=>{if(v!==x)v.pause()});document.querySelectorAll(".reel-card").forEach(c=>{if(c.querySelector(".reel-video")!==x)c.classList.remove("playing")})}
function observeVideos(){const o=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target.querySelector(".reel-video");if(!v)return;if(e.isIntersecting&&e.intersectionRatio>.75){pauseOthers(v);v.muted=true;v.play().then(()=>e.target.classList.add("playing")).catch(()=>{})}else{v.pause();e.target.classList.remove("playing")}}),{threshold:[.25,.75]});document.querySelectorAll(".reel-card").forEach(c=>o.observe(c))}
function setupActions(card,r){
 card.querySelector(".like-btn").onclick=()=>{r.likes++;card.querySelector(".like-btn span").textContent=r.likes;card.querySelector(".like-btn").classList.add("liked");persistItem(r)};
 card.querySelector(".comment-btn").onclick=()=>card.querySelector(".comments-panel").classList.toggle("open");
 card.querySelector(".comment-form").onsubmit=e=>{e.preventDefault();const i=e.target.querySelector("input");r.comments.push({name:"You",text:i.value.trim()});persistItem(r);render()};
 card.querySelector(".share-btn").onclick=()=>shareItem(r);card.querySelector(".dots-btn").onclick=e=>{e.stopPropagation();openDots(r,e.currentTarget)}
}
async function shareItem(r){const d={title:"CHRISXCHANGE Reel",text:"@"+r.creator+" — "+(r.caption||""),url:r.type==="tiktok"?r.url:location.href};try{if(navigator.share)await navigator.share(d);else{await navigator.clipboard.writeText(d.url);alert("Link copied.")}}catch(e){}}
function openDots(r,b){
 const menu=document.getElementById("dotsMenu"),owner=r.type==="local"&&localStorage.getItem(USER_KEY)===r.ownerKey;
 menu.innerHTML='<button data-a="share"><i class="fa-solid fa-share"></i> Share</button><button data-a="download"><i class="fa-solid fa-download"></i> '+(r.type==="local"?"Download":"Open original")+'</button><button data-a="copy"><i class="fa-solid fa-link"></i> Copy link</button>'+(!owner?'<button data-a="report"><i class="fa-solid fa-flag"></i> Report</button>':'<button class="danger" data-a="delete"><i class="fa-solid fa-trash"></i> Delete my Reel</button>');
 const x=b.getBoundingClientRect();menu.style.top=Math.min(innerHeight-220,Math.max(12,x.top-155))+"px";menu.style.right="18px";menu.classList.add("open");menu.setAttribute("aria-hidden","false");
 menu.querySelectorAll("button").forEach(btn=>btn.onclick=async()=>{const a=btn.dataset.a;if(a==="share")await shareItem(r);if(a==="copy"){await navigator.clipboard.writeText(r.type==="tiktok"?r.url:location.href);alert("Link copied.")}if(a==="download"){if(r.type==="local")downloadLocal(r);else window.open(r.url,"_blank","noopener")}if(a==="report")alert("Report received. Moderation will be connected to Supabase.");if(a==="delete"&&confirm("Delete this Reel?"))deleteLocal(r);closeDots()})
}
function closeDots(){const m=document.getElementById("dotsMenu");m.classList.remove("open");m.setAttribute("aria-hidden","true")}
document.addEventListener("click",e=>{if(!e.target.closest(".dots-btn")&&!e.target.closest(".reel-dots-menu"))closeDots()});
async function downloadLocal(r){try{const f=await getVideo(r.id);if(!f)return;const a=document.createElement("a");a.href=URL.createObjectURL(f);a.download=(r.creator||"reel")+"-reel."+(f.type.split("/")[1]||"mp4");a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}catch(e){alert("Download is not available.")}}
async function deleteLocal(r){reels=reels.filter(x=>x.id!==r.id);persist();try{const db=await dbOpen(),t=db.transaction("videos","readwrite");t.objectStore("videos").delete(r.id)}catch(e){}render()}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}function escapeAttr(v){return escapeHtml(v)}
