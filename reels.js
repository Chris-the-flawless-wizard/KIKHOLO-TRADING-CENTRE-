/* CHRISXCHANGE Reels - browser prototype */
const REELS_KEY = "chrisxchange-reels-v1";
let reels = [];
const objectUrls = new Map();

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("uploadModal");
  const form = document.getElementById("reelForm");
  const videoInput = document.getElementById("reelVideo");
  const fileName = document.getElementById("fileName");

  const open = () => { modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); };
  const close = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); };

  document.getElementById("openUpload")?.addEventListener("click", open);
  document.getElementById("emptyUpload")?.addEventListener("click", open);
  document.getElementById("closeUpload")?.addEventListener("click", close);
  modal?.addEventListener("click", e => { if(e.target === modal) close(); });

  videoInput?.addEventListener("change", () => {
    fileName.textContent = videoInput.files[0] ? videoInput.files[0].name : "No video selected";
  });

  form?.addEventListener("submit", e => {
    e.preventDefault();
    const file = videoInput.files[0];
    if(!file) return;
    if(file.size > 50 * 1024 * 1024){
      alert("Please choose a video smaller than 50 MB.");
      return;
    }

    const reel = {
      id: Date.now().toString(),
      creator: document.getElementById("creatorName").value.trim(),
      caption: document.getElementById("reelCaption").value.trim(),
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };

    // Store the selected video in IndexedDB so it can be replayed in this browser.
    saveVideo(reel.id, file).then(() => {
      reels.unshift(reel);
      persistMetadata();
      renderReels();
      form.reset();
      fileName.textContent = "No video selected";
      close();
    }).catch(() => alert("The video could not be saved on this device."));
  });

  document.getElementById("refreshReels")?.addEventListener("click", renderReels);
  reels = JSON.parse(localStorage.getItem(REELS_KEY) || "[]");
  renderReels();
});

function dbOpen(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open("chrisxchange-reels-db",1);
    req.onupgradeneeded=()=>req.result.createObjectStore("videos");
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function saveVideo(id,file){
  const db=await dbOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction("videos","readwrite");
    tx.objectStore("videos").put(file,id);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}
async function getVideo(id){
  const db=await dbOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction("videos","readonly");
    const req=tx.objectStore("videos").get(id);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
function persistMetadata(){localStorage.setItem(REELS_KEY,JSON.stringify(reels));}

async function renderReels(){
  const feed=document.getElementById("reelsFeed");
  const empty=document.getElementById("emptyReels");
  const count=document.getElementById("reelCount");
  feed.innerHTML="";
  count.textContent=reels.length + (reels.length===1 ? " reel" : " reels");
  empty.style.display=reels.length ? "none" : "block";

  for(const reel of reels){
    const card=document.createElement("article");
    card.className="reel-card";
    card.dataset.id=reel.id;
    card.innerHTML=`
      <div class="reel-video-wrap">
        <video class="reel-video" playsinline loop preload="metadata"></video>
        <button class="reel-play" aria-label="Play reel"><i class="fa-solid fa-play"></i></button>
        <div class="reel-overlay">
          <div class="creator"><span class="creator-avatar"><i class="fa-solid fa-user"></i></span><span>${escapeHtml(reel.creator)}</span></div>
          <p class="reel-caption">${escapeHtml(reel.caption)}</p>
        </div>
      </div>
      <div class="reel-actions">
        <button class="reel-action like-btn"><i class="fa-regular fa-heart"></i><span>${reel.likes}</span></button>
        <button class="reel-action comment-btn"><i class="fa-regular fa-comment"></i><span>${reel.comments.length}</span></button>
        <button class="reel-action share-btn"><i class="fa-solid fa-share"></i><span>Share</span></button>
      </div>
      <div class="comments">
        <div class="comment-list">${reel.comments.map(c=>`<div class="comment-item"><strong>${escapeHtml(c.name)}:</strong> ${escapeHtml(c.text)}</div>`).join("")}</div>
        <form class="comment-form"><input maxlength="120" placeholder="Write a comment..." required><button type="submit"><i class="fa-solid fa-paper-plane"></i></button></form>
      </div>`;

    feed.appendChild(card);

    const video=card.querySelector(".reel-video");
    try{
      const file=await getVideo(reel.id);
      if(file) video.src=objectUrls.set(reel.id,URL.createObjectURL(file)) && objectUrls.get(reel.id);
    }catch(e){}

    const play=card.querySelector(".reel-play");
    play.onclick=()=>toggleVideo(video,card);
    video.onclick=()=>toggleVideo(video,card);

    card.querySelector(".like-btn").onclick=()=>{
      reel.likes += 1;
      persistMetadata();
      card.querySelector(".like-btn").classList.add("liked");
      card.querySelector(".like-btn i").className="fa-solid fa-heart";
      card.querySelector(".like-btn span").textContent=reel.likes;
    };

    card.querySelector(".comment-btn").onclick=()=>card.querySelector(".comments").classList.toggle("open");

    card.querySelector(".share-btn").onclick=async()=>{
      const shareData={title:"CHRISXCHANGE Reel",text:reel.creator+": "+reel.caption,url:location.href};
      try{
        if(navigator.share) await navigator.share(shareData);
        else {await navigator.clipboard.writeText(location.href); alert("Reel link copied to your clipboard.");}
      }catch(e){}
    };

    card.querySelector(".comment-form").onsubmit=e=>{
      e.preventDefault();
      const input=e.target.querySelector("input");
      reel.comments.push({name:"You",text:input.value.trim()});
      persistMetadata();
      renderReels();
    };
  }
}
function toggleVideo(video,card){
  if(video.paused){
    document.querySelectorAll(".reel-video").forEach(v=>{if(v!==video)v.pause();});
    document.querySelectorAll(".reel-video-wrap").forEach(w=>w.classList.remove("playing"));
    video.play().catch(()=>{});
    card.querySelector(".reel-video-wrap").classList.add("playing");
  }else{
    video.pause();
    card.querySelector(".reel-video-wrap").classList.remove("playing");
  }
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
