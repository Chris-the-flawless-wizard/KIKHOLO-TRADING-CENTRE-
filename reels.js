/* CHRISXCHANGE REELS — direct TikTok embeds only */
const TIKTOK_POSTS = [
  {url:"https://www.tiktok.com/@scout2015/video/6718335390845095173",creator:"scout2015",caption:"Classic TikTok example — direct embed."},
  {url:"https://www.tiktok.com/@tiktoksmallbusiness_uki/video/7475456532713393415",creator:"tiktoksmallbusiness_uki",caption:"Small business tips, played direct from TikTok."},
  {url:"https://www.tiktok.com/@todayshow/video/7169249014679096622",creator:"todayshow",caption:"Five tips to help a small business stand out, direct from TikTok."},
  {url:"https://www.tiktok.com/@sebraenacional/video/7473931406591151415",creator:"sebraenacional",caption:"How to sell in marketplaces, direct from TikTok."},
  {url:"https://www.tiktok.com/@channel44tv/video/7486906094963395846",creator:"channel44tv",caption:"I started with 5,000 Ugandan Shillings — direct from TikTok."}
];

function tiktokId(u){
  const m = String(u).match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  return m ? m[1] : "";
}

function esc(v){
  return String(v ?? "").replace(/[&<>"']/g, function(m){
    return {"&":"&","<":"<",">":">",'"':""","'":"&#039;"}[m];
  });
}

function renderTikToks(){
  const feed = document.getElementById("reelsFeed");
  const empty = document.getElementById("emptyReels");
  if (!feed) return;
  feed.innerHTML = "";
  TIKTOK_POSTS.forEach(function(post){
    const id = tiktokId(post.url);
    if (!id) return;
    const card = document.createElement("article");
    card.className = "reel-card";
    const iframeSrc = "https://www.tiktok.com/player/v1/" + id + "?autoplay=1&loop=1&music_info=1&description=1&rel=0&controls=1";
    card.innerHTML = '<div class="reel-media embed-media">' +
      '<iframe class="tiktok-frame" src="' + iframeSrc + '" title="TikTok video" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>' +
      '</div>' +
      '<div class="reel-bottom"><div class="creator-line"><span class="avatar tiktok-avatar"><i class="fa-brands fa-tiktok"></i></span><strong>@' + esc(post.creator) + '</strong></div><p>' + esc(post.caption) + '</p></div>' +
      '<div class="reel-discovery-link"><a href="' + esc(post.url) + '" target="_blank" rel="noopener">Watch on TikTok <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div>';
    feed.appendChild(card);
  });
  if (empty) empty.style.display = feed.children.length ? "none" : "grid";
}

document.addEventListener("DOMContentLoaded", function(){
  renderTikToks();
  const openUpload = document.getElementById("openUpload");
  if (openUpload) openUpload.addEventListener("click", function(){ alert("Log in to upload your own reels."); });
});
