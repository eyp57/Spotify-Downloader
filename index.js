const express = require("express");
const app = express();
const querystring = require("querystring");
require("dotenv").config();
const {OAUTH_TOKEN} = process.env;
const request = require("request");
const bodyParser = require("body-parser")
const yt = require("youtube-search-without-api-key");
const ytdl = require('ytdl-core');
const { createWriteStream } = require("fs");

app.listen(80, () => console.log("Port 80 listening."));
app.use(bodyParser());
app.get('/track', function(req, res) {
    res.send(`
    <form method="post">
<input type="text" name="url" id="url"></input>
<button type="submit">İndir</button>
    <form>
    `)
});
app.post('/track', async function(req, res) {
    const url = req.body.url;
    const trackID = getTrackID(url);
    const api = await fetch('https://api.spotify.com/v1/tracks/' + trackID, {
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + OAUTH_TOKEN
        }
    }).then(res => res.json());
    const artists = api['album']['artists'].map((artist) => artist['name']).join(", ");
    const track = api['album']['name'];
    const ytVideos = await yt.search(artists + " - " + track);
    const vidURL = ytVideos[0].url;
    ytdl(vidURL, { filter: 'audioonly'}).pipe(createWriteStream("./songs/" + ytVideos[0].title + ".mp3"))
    res.redirect("/track")
})

function getTrackID(url) {
    let id = url.split("/")[url.split('/').length - 1].split("?")[0];
    return id;
}