
(async function() { // wrap everything within async; sorry for not using type="module" :3
    console.log("Hi, developer!");

    let feeddata = await fetch("/feed")
    feeddata = await feeddata.json()
    console.log(feeddata)
    writeToBody(feeddata)
})()



function writeToBody(feeddata) {
    let vidCont = document.getElementById("videos-container");
    vidCont.innerHTML = "" // reset it, we've fetched everything
    for (item of feeddata) {

        // craft a HTML thing for the video elements

        let craftedHTML = `
        

        <div class="video-cont">
            <a href="/view?vid=${item.videoId}" class="video-link">
                <img src="https://i.ytimg.com/vi/${item.videoId}/hq720.jpg" alt="${item.title}" class="video-thumbnail">
                <div class="video-info">
                    <h3 class="video-title">${item.title}</h3>
                    <p class="video-author">${item.author}</p>
                    <p class="video-views">${item.viewCount} views</p>
                </div>
            </a>
        </div>

        `

        vidCont.innerHTML += craftedHTML.trim();
    }
}

document.getElementById("search-input").addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // IDK if I need this but I see it everywhere
        const value = event.target.value;
        
        try {
            const response = await fetch(`/search?term=${encodeURIComponent(value)}`);
            const feeddata = await response.json();
            writeToBody(feeddata)
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    }
});
