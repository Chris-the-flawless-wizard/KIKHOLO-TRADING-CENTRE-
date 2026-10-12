/* CHRISXCHANGE REELS — direct TikTok embeds only */
const SUPABASE_URL="https://wopjohlkjhqymhjjxqgi.supabase.co";
const SUPABASE_KEY="sb_publishable_ZAngJWvWaTYJWUF8JZWSZQ_tGh4lDwD";
const LOGIN_URL="index%20html/login.html";
const MAX_VIDEO=50*1024*1024;

// Direct TikTok videos — played from TikTok’s official player (https://www.tiktok.com/player/v1/VIDEO_ID)
const TIKTOK_POSTS=[
  {url:"https://www.tiktok.com/@scout2015/video/6718335390845095173",creator:"scout2015",caption:"Classic TikTok example — direct embed."},
  {url:"https://www.tiktok.com/@tiktoksmallbusiness_uki/video/7475456532713393415",creator:"tiktoksmallbusiness_uki",caption:"Small business tips, played direct from TikTok."},
  {url:"https://www.tiktok.com/@todayshow/video/7169249014679096622",creator:"todayshow",caption:"Five tips to help a small business stand out, direct from TikTok."},
  {url:"https://www.tiktok.com/@sebraenacional/video/7473931406591151415",creator:"sebraenacional",caption:"How to sell in marketplaces, direct from TikTok."},
  {url:"https://www.tiktok.com/@channel44tv/video/7486906094963395846",creator:"channel44tv",caption:"I started with 5,000 Ugandan Shillings — direct from TikTok."}
];

let sb=null,me=null,reels=[],observer=null;

document.addEventListener("DOMContentLoaded",async()=>{
  setupUI();
  // Show TikTok embeds immediately
  reels=[];
  render();
  if(!window.supabase){
    console.warn("Supabase not loaded — showing TikTok embeds only");
    return;
  }
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  try{
    const {data}=await sb.auth.getSession();
    me=data?.session?.user||null;
  }catch(e){console.warn("Auth check failed",e)}
  loadFeed().catch(e=>console.warn("Feed load failed",e));
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
 if(!sb)return;
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
  console.warn("Could not load user reels — TikTok embeds remain visible",e);
 }
}

function render(){
 const feed=$("#reelsFeed"),empty=$("#emptyReels");
 if(!feed)return;
 feed.innerHTML="";
 // Only direct TikTok embeds + any user-added TikTok reels
 const directTikToks=TIKTOK_POSTS.filter(x=>x&&x.url).map((x,i)=>({id:"tiktok-direct-"+i,type:"tiktok",discovery:true,platform:"tiktok",owner_id:null,source_url:x.url,creator_name:x.creator||"TikTok creator",caption:x.caption||"Direct from TikTok."}));
 const userTikToks=reels.filter(r=>r.type==="tiktok");
 const items=[...directTikToks,...userTikToks];
 if(!items.length){empty.style.display="grid";return}
 empty.style.display="none";
 items.forEach((r)=>{const card=document.createElement("article");card.className="reel-card";card.dataset.id=r.id;card.innerHTML=discoveryMarkup(r);feed.appendChild(card);setupDiscovery(card,r);});
 observeCards();
}

function tiktokMarkup(r){
 const id=tiktokId(r.source_url||"");
 if(!id)return '<div class="video-unavailable"><i class="fa-brands fa-tiktok"></i><span>Invalid TikTok link</span></div>';
 // Official TikTok Embed Player — plays direct from TikTok
 return '<iframe class="tiktok-frame" src="https://www.tiktok.com/player/v1/'+encodeURIComponent(id)+'?autoplay=1&loop=1&music_info=1&description=1&rel=0&controls=1" title="TikTok video" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
}

function discoveryMarkup(r){
 return '<div class="reel-media embed-media">'+tiktokMarkup(r)+'</div><div class="reel-bottom"><div class="creator-line"><span class="avatar tiktok-avatar"><i class="fa-brands fa-tiktok"></i></span><strong>@'+esc(r.creator_name)+'</strong></div><p>'+esc(r.caption)+'</p></div><div class="reel-discovery-link"><a href="'+attr(r.source_url)+'" target="_blank" rel="noopener">Watch on TikTok <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div>';
}

function setupDiscovery(card,r){card.querySelectorAll("a").forEach(a=>a.addEventListener("click",e=>e.stopPropagation()))}
function observeCards(){
 observer?.disconnect();
 observer=new IntersectionObserver(es=>es.forEach(e=>{
   // TikTok iframes handle their own playback; no custom video control needed
 }),{threshold:[.25,.75]});
 document.querySelectorAll(".reel-card").forEach(c=>observer.observe(c));
}

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
 const creator=type==="tiktok"?(url.match(/tiktok\.com\/@([^/]+)/i)||[])[1]||"TikTok creator":"YouTube creator";
 const {error}=await sb.from("reels").insert({owner_id:me.id,type,creator_name:creator,caption,source_url:url});
 if(error){alert(error.message||"Could not add Reel.");return}
 e.target.reset();$("#"+(type==="tiktok"?"tiktokModal":"youtubeModal")).classList.remove("open");await loadFeed();
}

async function toggleLike(r,card){/* kept for compatibility */}
async function addComment(r,textValue){/* kept for compatibility */}
async function shareReel(r){
 const url=r.source_url||location.href;
 try{if(navigator.share)await navigator.share({title:"CHRISXCHANGE Reel",text:"@"+r.creator_name+" — "+(r.caption||""),url});else{await navigator.clipboard.writeText(url);alert("Link copied.")}}catch(e){}
}
function openDots(r,b){/* simplified */}
async function deleteReel(r){/* simplified */}
function closeDots(){}
function subscribe(){
 if(!sb)return;
 sb.channel("reels-live").on("postgres_changes",{event:"*",schema:"public",table:"reels"},()=>loadFeed()).subscribe();
}
function requireLogin(fn){if(me){fn();return}if(confirm("Please log in to CHRISXCHANGE to add Reels. Open login now?"))goLogin()}
function goLogin(){location.href=LOGIN_URL+"?next=reels.html"}
function busy(b,on,label){if(!b)return;b.disabled=on;b.innerHTML=on?'<i class="fa-solid fa-spinner fa-spin"></i> '+label:'<i class="fa-solid fa-paper-plane"></i> '+label}
function safeFile(n){return String(n||"video.mp4").replace(/[^a-z0-9._-]/gi,"-").slice(-120)}
function tiktokId(u){const m=String(u).match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);return m?m[1]:""}
function youtubeId(u){const m=String(u).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);return m?m[1]:""}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&","<":"<",">":">",'"':""","'":"&#039;"}[m]))}
function attr(v){return esc(v)}
function $(s){return document.querySelector(s)}
