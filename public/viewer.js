const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const vidID = urlParams.get('vid')

fetch("/videoData?id=" + vidID)
.then(data => data.json())
.then(data => {


document.getElementById("vidContainer").innerHTML = `
<iframe class="vidiframe" src="https://www.youtube-nocookie.com/embed/${vidID}?autoplay=1"></iframe>

<div class="dataContainer">
    <h2 id="name">${data.title}</h2>
    <hr>
    <p id="description">${data.description}</p>
</div>

`.trim()


    // panel data
    document.getElementById("panel-views").innerText = `${data.views}` // data.views contains " views" already
    document.getElementById("panel-likes").innerText = `${data.likes} likes`
    document.getElementById("panel-upload-date").innerText = new Date(data.uploadDate).toLocaleDateString()
    document.getElementById("panel-subs").innerText = `${data.subs}`

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        const videoFrame = document.querySelector('.vidiframe');
        if (videoFrame) {
            if (!document.fullscreenElement) {
                videoFrame.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    });

    /*
    
    Some videos aren't allowed to be embedded. :(

    To fix this, we'll stream the raw file directly.

    */
    document.getElementById('raw-load-btn').addEventListener('click', () => {
        window.open("//youtube.com/watch?v=" + vidID, "blank")
    });

    document.getElementById('download-btn').addEventListener('click', () => {
        window.open("//cobalt.tools/", "blank")
    });

    for (vid of data.relatedArray) {
    document.getElementById("more").innerHTML += `
        <a href="/view?vid=${vid.itemid}" class="more-video-item">
            <img src="https://i.ytimg.com/vi/${vid.itemid}/hq720.jpg" alt="${vid.itemtitle}" class="more-video-thumbnail">
            <div class="more-video-info">
                <p class="more-video-title">${vid.itemtitle}</p>
                <p class="more-video-upload">${vid.itemupload}</p>
            </div>
        </a>
    `.trim();
}


})
.catch(error => {
    console.error('Error fetching video data:', error);
    document.getElementById("name").innerText = "Error loading video data"
    document.getElementById("description").innerText = "Unable to fetch video information"
});

document.addEventListener('keydown', (event) => {
    if (event.key == "f") {
        const videoFrame = document.querySelector('.vidiframe');
        if (videoFrame) {
            if (!document.fullscreenElement) {
                videoFrame.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    }
  });