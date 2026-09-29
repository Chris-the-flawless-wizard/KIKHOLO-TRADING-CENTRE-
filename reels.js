/* CHRISXCHANGE REELS — persistent, mobile-first short-video feed */
const SUPABASE_URL="https://wopjohlkjhqymhjjxqgi.supabase.co";
const SUPABASE_KEY="sb_publishable_ZAngJWvWaTYJWUF8JZWSZQ_tGh4lDwD";
const LOGIN_URL="index%20html/login.html";
const MAX_VIDEO=50*1024*1024;
const DISCOVERY=[
  {platform:"youtube",query:"trade business entrepreneurship Uganda Africa",title:"Business & Trade in Africa"},
  {platform:"youtube",query:"small business trade entrepreneurship East Africa",title:"Small Business & Trade"},
  {platform:"youtube",query:"import export international trade tips",title:"Import • Export • Trade Tips"},
  {platform:"tiktok",query:"trade business entrepreneurship Uganda",title:"TikTok • Trade & Business"}
];
let sb=null,me=null,reels=[],observer=null;

document.addEventListener("DOMContentLoaded",async()=>{
  setupUI();
  if(!window.supabase){showError("The Reels connection library could not load. Refresh and try again.");return}
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const {data}=await sb.auth.getSession(); me=data?.session?.user||null;
  await loadFeed();
  subscribe();
});

function setupUI(){
 const um=$("#uploadModal"),tm=$("#tiktokModal"),ym=$("#youtubeModal");
 const open=m=>{if(!m)return;m.classList.add("open");m.setAttribute("aria-hidden","false")};
 const close=m=>{if(!m)return;m.classList.remove("open");m.setAttribute("aria-hidden","true")};
 $("#openUpload")?.addEventListener("click",()=>requireLogin(()=>open(um)));
 $("#emptyUpload")?.addEventListener("click",()=>requireLogin(()=>open(um)));
 $("#openTikTok")?.addEventListener("click",()=>requireLogin(()=>open(tm)));
 $("#openYouTube")?.addEventListener("click",()=>requireLogin(()=>open(ym)));
 $("#closeUpload")?.addEventListener("click",()=>close(um));
 $("#closeTikTok")?.addEventListener("click",()=>close(tm));
 $("#closeYouTube")?.addEventListener("click",()=>close(ym));
 [um,tm,ym].forEach(m=>m?.addEventListener("click",e=>{if(e.target===m)close(m)}));
 $("#reelVideo")?.addEventListener("change",e=>$("#fileName").textContent=e.target.files[0]?.name||"No video selected");
 $("#reelForm")?.addEventListener("submit",publishVideo);
 $("#tiktokForm")?.addEventListener("submit",publishTikTok);
 $("#youtubeForm")?.addEventListener("submit",publishYouTube);
}

async function loadFeed(){
 const feed=$("#reelsFeed"),empty=$("#emptyReels");
 if(!feed)return;
 feed.innerHTML='<div class="feed-loading"><i class="fa-solid fa-spinner fa-spin"></i><span>Loading CHRISXCHANGE Reels…</span></div>';
 try{
  const {data,error}=await sb.from("reels").select("*").order("created_at",{ascending:false}).limit(100);
  if(error)throw error;
  const ids=(data||[]).map(x=>x.id);
  const [commentsRes,likesRes]=await Promise.all([
    ids.length?sb.from("reel_comments").select("id,reel_id,user_id,body,created_at").in("reel_id",ids).order("created_at",{ascending:true}):Promise.resolve({data:[],error:null}),
    ids.length?sb.from("reel_likes").select("reel_id,user_id").in("reel_id",ids):Promise.resolve({data:[],error:null})
  ]);
  if(commentsRes.error)throw commentsRes.error;
  if(likesRes.error)throw likesRes.error;
  const comments=commentsRes.data||[],likes=likesRes.data||[];
  reels=(data||[]).map(r=>({...r,comments:comments.filter(c=>c.reel_id===r.id),likes:likes.filter(l=>l.reel_id===r.id).length,liked:likes.some(l=>l.reel_id===r.id&&l.user_id===me?.id)}));
  render();
 }catch(e){
  console.error(e);
  showError("Reels could not connect to CHRISXCHANGE. The page is still available; refresh to try again.");
 }
}

function render(){
 const feed=$("#reelsFeed"),empty=$("#emptyReels");
 if(!feed)return;
 feed.innerHTML="";
 const items=[...reels,...DISCOVERY.map((d,i)=>({id:"discover-"+i,type:d.platform,discovery:true,query:d.query,creator_name:d.title,caption:"Discover fresh "+(d.platform==="youtube"?"YouTube":"TikTok")+" content about trade, business and entrepreneurship."}))];
 if(!items.length){empty.style.display="grid";return}
 empty.style.display="none";
 items.forEach((r,i)=>{const card=document.createElement("article");card.className="reel-card";card.dataset.id=r.id;card.innerHTML=r.discovery?discoveryMarkup(r):markup(r);feed.appendChild(card);if(!r.discovery)setupActions(card,r);else setupDiscovery(card,r);});
 observeCards();
}

function markup(r){
 const media=r.type==="video" ? '<video class="reel-video" playsinline loop preload="metadata" controlslist="nodownload"></video>' :
 r.type==="tiktok" ? tiktokMarkup(r) : youtubeMarkup(r);
 const mediaWrap=r.type==="video" ? '<div class="reel-media">'+media+'<button class="center-play" aria-label="Play"><i class="fa-solid fa-play"></i></button><button class="sound-btn" aria-label="Mute or unmute"><i class="fa-solid fa-volume-xmark"></i></button></div>' : '<div class="reel-media embed-media">'+media+'</div>';
 return mediaWrap+'<div class="reel-bottom"><div class="creator-line"><span class="avatar"><i class="'+(r.type==="tiktok"?"fa-brands fa-tiktok":"fa-solid fa-user")+'"></i></span><strong>@'+esc(r.creator_name)+'</strong></div><p>'+esc(r.caption||"")+'</p></div>'+actionsMarkup(r);
}
function tiktokMarkup(r){return '<blockquote class="tiktok-embed" cite="'+attr(r.source_url||"")+'" data-video-id="'+attr(tiktokId(r.source_url||""))+'"><section><a target="_blank" rel="noopener" href="'+attr(r.source_url||"")+'">@'+esc(r.creator_name)+'</a></section></blockquote>'}
function youtubeMarkup(r){return '<iframe class="youtube-frame" src="https://www.youtube.com/embed/'+attr(youtubeId(r.source_url||""))+'?autoplay=0&mute=1&playsinline=1&rel=0" title="YouTube trade video" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'}
function discoveryMarkup(r){
 if(r.platform==="youtube")return '<div class="reel-media embed-media discovery-media"><iframe class="youtube-frame" src="https://www.youtube.com/embed?listType=search&list='+encodeURIComponent(r.query)+'&rel=0" title="'+attr(r.creator_name)+'" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div><div class="reel-bottom"><div class="creator-line"><span class="avatar"><i class="fa-brands fa-youtube"></i></span><strong>'+esc(r.creator_name)+'</strong></div><p>'+esc(r.caption)+'</p></div><div class="reel-discovery-link"><a href="https://www.youtube.com/results?search_query='+encodeURIComponent(r.query)+'" target="_blank" rel="noopener">Open YouTube search <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div>';
 return '<div class="reel-media discovery-tiktok"><div class="discovery-platform"><i class="fa-brands fa-tiktok"></i><strong>Discover TikTok trade videos</strong><span>Search results stay on TikTok — CHRISXCHANGE does not copy or re-host them.</span><a href="https://www.tiktok.com/search?q='+encodeURIComponent(r.query)+'" target="_blank" rel="noopener">Open TikTok <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div></div><div class="reel-bottom"><div class="creator-line"><span class="avatar tiktok-avatar"><i class="fa-brands fa-tiktok"></i></span><strong>'+esc(r.creator_name)+'</strong></div><p>'+esc(r.caption)+'</p></div>';
}
function actionsMarkup(r){return '<div class="reel-side-actions"><button class="side-action like-btn '+(r.liked?"liked":"")+'"><i class="fa-'+(r.liked?"solid":"regular")+' fa-heart"></i><span>'+r.likes+'</span></button><button class="side-action comment-btn"><i class="fa-regular fa-comment"></i><span>'+r.comments.length+'</span></button><button class="side-action share-btn"><i class="fa-solid fa-share"></i><span>Share</span></button><button class="side-action dots-btn" aria-label="More"><i class="fa-solid fa-ellipsis-vertical"></i></button></div><div class="comments-panel"><div class="comment-list">'+r.comments.map(c=>'<div><strong>You:</strong> '+esc(c.body)+'</div>').join("")+'</div><form class="comment-form"><input maxlength="120" placeholder="Write a comment..." required><button aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button></form></div>'}

function setupActions(card,r){
 const v=card.querySelector(".reel-video"),p=card.querySelector(".center-play"),s=card.querySelector(".sound-btn");
 const toggle=()=>{if(v.paused){pauseOthers(v);v.play().catch(()=>{});card.classList.add("playing")}else{v.pause();card.classList.remove("playing")}};
 if(v){p.onclick=toggle;v.onclick=toggle;s.onclick=e=>{e.stopPropagation();v.muted=!v.muted;s.innerHTML=v.muted?'<i class="fa-solid fa-volume-xmark"></i>':'<i class="fa-solid fa-volume-high"></i>'};loadVideo(v,r)}
 card.querySelector(".like-btn").onclick=()=>toggleLike(r,card);
 card.querySelector(".comment-btn").onclick=()=>card.querySelector(".comments-panel").classList.toggle("open");
 card.querySelector(".comment-form").onsubmit=e=>{e.preventDefault();addComment(r,e.target.querySelector("input").value.trim())};
 card.querySelector(".share-btn").onclick=()=>shareReel(r);
 card.querySelector(".dots-btn").onclick=e=>{e.stopPropagation();openDots(r,e.currentTarget)};
}
async function loadVideo(v,r){if(!r.video_url)v.parentElement.innerHTML='<div class="video-unavailable"><i class="fa-solid fa-video-slash"></i><span>Video unavailable</span></div>';else v.src=r.video_url}
function setupDiscovery(card,r){card.querySelectorAll("a").forEach(a=>a.addEventListener("click",e=>e.stopPropagation()))}
function observeCards(){
 observer?.disconnect();
 observer=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target.querySelector(".reel-video");if(!v)return;if(e.isIntersecting&&e.intersectionRatio>.75){pauseOthers(v);v.muted=true;v.play().then(()=>e.target.classList.add("playing")).catch(()=>{})}else{v.pause();e.target.classList.remove("playing")}}),{threshold:[.25,.75]});
 document.querySelectorAll(".reel-card").forEach(c=>observer.observe(c));
}
function pauseOthers(x){document.querySelectorAll(".reel-video").forEach(v=>{if(v!==x)v.pause()});document.querySelectorAll(".reel-card").forEach(c=>{if(c.querySelector(".reel-video")!==x)c.classList.remove("playing")})}

async function publishVideo(e){
 e.preventDefault();
 if(!me){goLogin();return}
 const file=$("#reelVideo").files[0];if(!file)return;
 if(file.size>MAX_VIDEO){alert("Please choose a video smaller than 50 MB.");return}
 const creator=$("#creatorName").value.trim(),caption=$("#reelCaption").value.trim();
 const id=crypto.randomUUID(),path=me.id+"/"+id+"-"+safeFile(file.name);
 const btn=e.target.querySelector("button[type=submit]");busy(btn,true,"Publishing…");
 try{
  const up=await sb.storage.from("reels").upload(path,file,{contentType:file.type,upsert:false});
  if(up.error)throw up.error;
  const {data:pub}=sb.storage.from("reels").getPublicUrl(path);
  const {error}=await sb.from("reels").insert({id,owner_id:me.id,type:"video",creator_name:creator,caption,video_path:path,video_url:pub.publicUrl});
  if(error){await sb.storage.from("reels").remove([path]);throw error}
  e.target.reset();$("#fileName").textContent="No video selected";$("#uploadModal").classList.remove("open");await loadFeed();
 }catch(err){console.error(err);alert("The Reel could not be published: "+(err.message||"Please try again."))}
 finally{busy(btn,false,"Publish Reel")}
}

async function publishTikTok(e){return publishExternal(e,"tiktok")}
async function publishYouTube(e){return publishExternal(e,"youtube")}
async function publishExternal(e,type){
 e.preventDefault();if(!me){goLogin();return}
 const url=(type==="tiktok"?$("#tiktokUrl"):$("#youtubeUrl")).value.trim(),caption=(type==="tiktok"?$("#tiktokCaption"):$("#youtubeCaption")).value.trim();
 const valid=type==="tiktok"?tiktokId(url):youtubeId(url);if(!valid){alert("Please enter a valid public "+(type==="tiktok"?"TikTok /video/":"YouTube video")+" URL.");return}
 const creator=type==="tiktok"?(url.match(/tiktok\.com\\/@([^/]+)/i)||[])[1]||"TikTok creator":"YouTube creator";
 const {error}=await sb.from("reels").insert({owner_id:me.id,type,creator_name:creator,caption,source_url:url});
 if(error){alert(error.message||"Could not add Reel.");return}
 e.target.reset();$("#"+(type==="tiktok"?"tiktokModal":"youtubeModal")).classList.remove("open");await loadFeed();
}

async function toggleLike(r,card){
 if(!me){requireLogin(()=>{});return}
 const btn=card.querySelector(".like-btn");
 try{
  if(r.liked){const {error}=await sb.from("reel_likes").delete().eq("reel_id",r.id).eq("user_id",me.id);if(error)throw error;r.liked=false;r.likes=Math.max(0,r.likes-1)}
  else{const {error}=await sb.from("reel_likes").insert({reel_id:r.id,user_id:me.id});if(error)throw error;r.liked=true;r.likes++}
  btn.classList.toggle("liked",r.liked);btn.innerHTML='<i class="fa-'+(r.liked?"solid":"regular")+' fa-heart"></i><span>'+r.likes+'</span>';
 }catch(e){console.error(e);alert("Could not update your like.")}
}
async function addComment(r,textValue){
 if(!me){requireLogin(()=>{});return}
 if(!textValue)return;
 const {data,error}=await sb.from("reel_comments").insert({reel_id:r.id,user_id:me.id,body:textValue}).select().single();
 if(error){alert(error.message||"Could not post comment.");return}
 r.comments.push(data);render();
}
async function shareReel(r){
 const url=r.type==="video"&&r.video_url?r.video_url:r.source_url||location.href;
 try{if(navigator.share)await navigator.share({title:"CHRISXCHANGE Reel",text:"@"+r.creator_name+" — "+(r.caption||""),url});else{await navigator.clipboard.writeText(url);alert("Link copied.")}}catch(e){}
}
function openDots(r,b){
 const m=$("#dotsMenu"),owner=me&&r.owner_id===me.id;
 m.innerHTML='<button data-a="share"><i class="fa-solid fa-share"></i> Share</button><button data-a="download"><i class="fa-solid fa-download"></i> '+(r.type==="video"?"Download":"Open original")+'</button><button data-a="copy"><i class="fa-solid fa-link"></i> Copy link</button>'+(owner?'<button class="danger" data-a="delete"><i class="fa-solid fa-trash"></i> Delete my Reel</button>':'<button data-a="report"><i class="fa-solid fa-flag"></i> Report</button>');
 const x=b.getBoundingClientRect();m.style.top=Math.min(innerHeight-220,Math.max(12,x.top-155))+"px";m.style.right="18px";m.classList.add("open");m.setAttribute("aria-hidden","false");
 m.querySelectorAll("button").forEach(btn=>btn.onclick=async()=>{const a=btn.dataset.a;if(a==="share")await shareReel(r);if(a==="copy"){await navigator.clipboard.writeText(r.type==="video"&&r.video_url?r.video_url:r.source_url||location.href);alert("Link copied.")}if(a==="download"){if(r.type==="video")downloadVideo(r);else window.open(r.source_url,"_blank","noopener")}if(a==="report")alert("Report received. Moderation will be connected to Supabase.");if(a==="delete"&&confirm("Delete this Reel?"))await deleteReel(r);closeDots()});
}
async function deleteReel(r){
 if(!me||r.owner_id!==me.id)return;
 if(r.video_path)await sb.storage.from("reels").remove([r.video_path]);
 const {error}=await sb.from("reels").delete().eq("id",r.id).eq("owner_id",me.id);
 if(error)alert(error.message||"Could not delete Reel.");else await loadFeed();
}
async function downloadVideo(r){
 if(!r.video_url)return;
 const a=document.createElement("a");a.href=r.video_url;a.target="_blank";a.rel="noopener";a.click();
}
function closeDots(){const m=$("#dotsMenu");m.classList.remove("open");m.setAttribute("aria-hidden","true")}
document.addEventListener("click",e=>{if(!e.target.closest(".dots-btn")&&!e.target.closest(".reel-dots-menu"))closeDots()});

function subscribe(){
 sb.channel("reels-live").on("postgres_changes",{event:"*",schema:"public",table:"reels"},()=>loadFeed()).on("postgres_changes",{event:"*",schema:"public",table:"reel_comments"},()=>loadFeed()).on("postgres_changes",{event:"*",schema:"public",table:"reel_likes"},()=>loadFeed()).subscribe();
}
function requireLogin(fn){if(me){fn();return}if(confirm("Please log in to CHRISXCHANGE to create, like or comment on Reels. Open login now?"))goLogin()}
function goLogin(){location.href=LOGIN_URL+"?next=reels.html"}
function showError(msg){const f=$("#reelsFeed");if(f)f.innerHTML='<div class="feed-error"><i class="fa-solid fa-triangle-exclamation"></i><h2>Reels connection issue</h2><p>'+esc(msg)+'</p><a href="'+LOGIN_URL+'">Log in</a></div>'}
function busy(b,on,label){if(!b)return;b.disabled=on;b.innerHTML=on?'<i class="fa-solid fa-spinner fa-spin"></i> '+label:'<i class="fa-solid fa-paper-plane"></i> '+label}
function safeFile(n){return String(n||"video.mp4").replace(/[^a-z0-9._-]/gi,"-").slice(-120)}
function tiktokId(u){const m=String(u).match(/tiktok\\.com\\/@[^/]+\\/video\\/(\\d+)/i);return m?m[1]:""}
function youtubeId(u){{const m=String(u).match(/(?:youtube\.com\\/(?:watch\\?v=|shorts\\/|embed\\/)|youtu\.be\\/)([A-Za-z0-9_-]{6,})/i);return m?m[1]:""}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function attr(v){return esc(v)}
function $(s){return document.querySelector(s)}
