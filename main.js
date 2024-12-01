// here's my attempt at making stuff easily understandable for other people reading
const express = require("express");
const app = express();
const fs = require("fs");
const { Client } = require("youtubei");
const youtube = new Client();

// cache a working Invidious instance
let cacheInv;

// make assets all public
app.use(express.static("public"))

// body parser
app.use(express.json())

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
})


let lastFeedRequest = 0; // this is to fix some issues with invidious bounces because of requests going out TOO FAST! 
const DEBOUNCE_TIME = 500;

app.get("/feed", async (req, res) => {
    const now = Date.now();
    if (now - lastFeedRequest < DEBOUNCE_TIME) {
        console.log("TOO MANY REQUESTS")
        return res.status(429).json({ error: "Too many requests. Please wait a moment." });
    }
    lastFeedRequest = now;

    try {
        if (!cacheInv) {
            // this shouldn't theoretically be an issue
            return res.status(500).json({ error: "No valid Invidious instance available." });
        }
        let feedURL = cacheInv + "/api/v1/trending";
        const rawFeedResp = await fetch(feedURL);
        if (!rawFeedResp.ok) {
            throw new Error(`Failed to fetch feed: ${rawFeedResp.statusText}`);
        }
        const feedData = await rawFeedResp.text();
        res.json(JSON.parse(feedData));
    } catch (error) {
        console.error("Error in /feed:", error);
        res.status(500).json({ error: "Failed to fetch feed data." });
    }
});

app.get("/videoData", async (req, res) => {
    try {
    const video = await youtube.getVideo(req.query.id);

    let nextArr = []
    for (item of video.related.items) {
        const itemid = item.id;
        const itemtitle = item.title;
        const itemupload = item.uploadDate;

        nextArr.push({itemid: itemid, itemtitle: itemtitle, itemupload: itemupload})
    }

    res.json({
        likes: video.likeCount,
        description: video.description,
        views: video.viewCount,
        uploadDate: video.uploadDate,
        title: video.title,
        subs: video.channel.subscriberCount,
        commentData: null,
        relatedArray: nextArr
    })
} catch {
    res.json({
        likes: "Error",
        description: "Error",
        views: "Error",
        uploadDate: "Error",
        title: "Error",
        subs: "Error",
        commentData: "Error",
        relatedArray: "Error"
    })
}
})

app.get("/videoStream", async (req, res) => {


})

app.get("/search", async (req, res) => {
    try {
    let term = decodeURIComponent(req.query.term)
    const videos = await youtube.search(term, {
        type: "video",
    });
    
    let itemsArr = []
    for (item of videos.items) {
        itemsArr.push({
            videoId: item.id,
            title: item.title,
            author: item.channel.name,
            viewCount: item.viewCount
        })
    }

    res.send(itemsArr)
} catch {
    res.send([])
}
})

app.get("/view", (req, res) => {
    res.sendFile(__dirname + "/public/viewer.html")
})

let PORT = process.argv[2] || 8080

app.listen(PORT, async () => {
    await getInstance();
    console.log("HS-YT listening on PORT " + PORT)
});

async function getInstance() {
    let instanceList = fs.readFileSync("instance_list.txt", "utf-8");
    instanceList = instanceList.split("\n");

    for (const instance of instanceList) {
        try {
            const response = await fetch(instance + "/api/v1/stats");
            const data = await response.json();

            if (data.metadata && data.metadata.lastChannelRefreshedAt) {
                console.log("Found good URL! Adding to cache.");
                cacheInv = instance;
                break;
            }
        } catch (error) {
            console.log("Got bad URL.");
        }
    }
}