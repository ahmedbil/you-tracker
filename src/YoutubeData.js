import React, { useState, useEffect } from 'react';
import { BeatLoader } from "react-spinners";
import { MDBCardTitle, MDBBtn, MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBTypography, MDBIcon } from 'mdb-react-ui-kit';
import './App.scss';




function YoutubeData({url, auth}) {
    const [videoDetails, setVideoDetails] = useState(null);
    const [channelDetails, setChannelDetails] = useState(null);
    const [mostLikedVideo, setMostLikedVideo] = useState(null);
    const [mostCommentedVideo, setMostCommentedVideo] = useState(null);
    const [mostViewedVideo, setMostViewedVideo] = useState(null);
    const [mostFavoriteVideo, setMostFavoriteVideo] = useState(null);

   
    function extractVideoId(videoUrl) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = videoUrl.match(regExp);
        
        if (match && match[2].length === 11) {
            return match[2];
        } else {
            return null;
        }
    }

    function getMostTypeVideo(videoList) {
        let curLikeMax = 0;
        let curCommentMax = 0;
        let curViewMax = 0;
        let curFavoriteMax = 0;

        let mostViewResult = {
            'maxLikeVideo' : null,
            'maxCommentVideo' : null,
            'maxViewVideo' : null,
            'maxFavoriteVideo' : null
        }

        videoList.forEach((item) => {
            const curLikeStat = item['statistics']['likeCount'];
            const curCommentStat = item['statistics']['commentCount'];
            const curViewStat = item['statistics']['viewCount'];
            const curFavoriteStat = item['statistics']['favoriteCount'];
            if (curLikeStat >= curLikeMax) {
                curLikeMax = curLikeStat;
                mostViewResult['maxLikeVideo'] = item;
            }
            if (curCommentStat >= curCommentMax) {
                curCommentMax = curCommentStat;
                mostViewResult['maxCommentVideo'] = item;
            }
            if (curViewStat >= curViewMax) {
                curViewMax = curViewStat;
                mostViewResult['maxViewVideo'] = item;
            }
            if (curFavoriteStat >= curFavoriteMax) {
                curFavoriteMax = curFavoriteStat;
                mostViewResult['maxFavoriteVideo'] = item;
            }
        });

        return mostViewResult;
    }

    const getVideoDetails = async (videoUrl, authToken) => {
        const videoId = extractVideoId(videoUrl);
        const videoData = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyBD5uwgJHyCv9NYOfXkC2JoSGYdoLjK8FA`)
        .then(response => response.json());
        const channelId = videoData.items[0].snippet.channelId;

        const cacheKey = channelId;

        // Check if the response is already cached
        let cachedResponse = localStorage.getItem(cacheKey);
      
        // Return the cached response if available
        if (cachedResponse) {
          let { timestamp, data } = JSON.parse(cachedResponse);
          const age = Date.now() - timestamp;
            // Check if the cached response has expired 
            if (age >= 600000) {
            localStorage.removeItem(cacheKey);
            } else {
                console.log(data);
                setChannelDetails(data.channelData);
                setVideoDetails(data.videosData);
                setMostLikedVideo(data.mostVideoStats['maxLikeVideo']);
                setMostCommentedVideo(data.mostVideoStats['maxCommentVideo']);
                setMostViewedVideo(data.mostVideoStats['maxViewVideo']);
                setMostFavoriteVideo(data.mostVideoStats['maxFavoriteVideo']);
                return;
            }
        }

        let data = {};
    
        const channelData = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=AIzaSyBD5uwgJHyCv9NYOfXkC2JoSGYdoLjK8FA`)
        .then(response => response.json());
        const playlistId = channelData['items'][0]['contentDetails']['relatedPlaylists']['uploads'];

        let nextPage = true;
        let videoIdList = [];
        let videosData = [];
        let videoListReq = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=AIzaSyBD5uwgJHyCv9NYOfXkC2JoSGYdoLjK8FA`;

        while (nextPage) {
            const videoList = await fetch(videoListReq).then(response => response.json());
            let data = videoList['items'];
            let curVideoIdList = [];
            data.forEach(video => {
                let videoId = video['contentDetails']['videoId'];
                if (!videoIdList.includes(videoId)) {
                    videoIdList.push(videoId);
                    curVideoIdList.push(videoId)
                }
            });

            const videoInfos = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${curVideoIdList}&key=AIzaSyBD5uwgJHyCv9NYOfXkC2JoSGYdoLjK8FA`)
            .then(response => response.json());

            videosData = videosData.concat(videoInfos['items']);

            if ('nextPageToken' in videoList) {
                nextPage = true;
                videoListReq = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${videoList['nextPageToken']}&key=AIzaSyBD5uwgJHyCv9NYOfXkC2JoSGYdoLjK8FA`;

            } else {
                nextPage = false;
            }
        }
        const mostVideoStats = getMostTypeVideo(videosData);

        data['channelData'] = channelData;
        data['videosData'] = videosData;
        data['mostVideoStats'] = mostVideoStats;

        const timestamp = Date.now();
        const cacheData = { timestamp, data };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));

        setChannelDetails(channelData);
        setVideoDetails(videosData);
        setMostLikedVideo(mostVideoStats['maxLikeVideo']);
        setMostCommentedVideo(mostVideoStats['maxCommentVideo']);
        setMostViewedVideo(mostVideoStats['maxViewVideo']);
        setMostFavoriteVideo(mostVideoStats['maxFavoriteVideo']);    
    };

    

      useEffect(() => {
        getVideoDetails(url, auth);
      }, []);
    
    if (!videoDetails) {
        return(
            <div class="body">
                <div className="loader">
                <BeatLoader color={(document.body.classList.contains("dark-mode") === true)? "#fff" : "#000"} loading={!videoDetails} />
                </div>
            </div>
        );
    }
    return (
        <div class="body">
            <hr className="mt-0 mb-4" />
            <div class="card">
                <div class="card-title">
                    <h2>Most Liked Video</h2>
                </div>
            <img src={mostLikedVideo['snippet']['thumbnails']['high']['url']} alt="Placeholder Image"/>
            <div class="card-info">
                <h2>{mostLikedVideo['snippet']['title']}</h2>
                <a href="https://www.youtube.com" class="card-button">Watch</a>
            </div>
            </div>
            <div class="card">
                <div class="card-title">
                    <h2>Most Commented Video</h2>
                </div>
            <img src={mostCommentedVideo['snippet']['thumbnails']['high']['url']} alt="Placeholder Image"/>
            <div class="card-info">
                <h2>{mostCommentedVideo['snippet']['title']}</h2>
                <a href="https://www.youtube.com" class="card-button">Watch</a>
            </div>
            </div>
            <div class="card">
                <div class="card-title">
                    <h2>Most Viewed Video</h2>
                </div>
            <img src={mostViewedVideo['snippet']['thumbnails']['high']['url']} alt="Placeholder Image"/>
            <div class="card-info">
                <h2>{mostViewedVideo['snippet']['title']}</h2>
                <a href="https://www.youtube.com" class="card-button">Watch</a>
            </div>
            </div>
            <div class="card">
                <div class="card-title">
                    <h2>Most Favorite Video</h2>
                </div>
            <img src={mostFavoriteVideo['snippet']['thumbnails']['high']['url']} alt="Placeholder Image"/>
            <div class="card-info">
                <h2>{mostFavoriteVideo['snippet']['title']}</h2>
                <a href="https://www.youtube.com" class="card-button">Watch</a>
            </div>
            </div>
        </div>
      );
}

//<p>{mostLikedVideo['snippet']['description']}</p>

export default YoutubeData;

/*<img src={channelDetails['items'][0]['snippet']['thumbnails']['default']['url']}
                href={"www.youtube.com/" + channelDetails['items'][0]['snippet']['customUrl']}/>
            <h3>{channelDetails['items'][0]['snippet']['title']}</h3>
            <h4>Videos Posted: {channelDetails['items'][0]['statistics']['videoCount']}</h4>
            <h4>Total Views: {channelDetails['items'][0]['statistics']['viewCount']}</h4>
            <h4>Subscribers : {(channelDetails['items'][0]['statistics']['hiddenSubscriberCount'] === false)? channelDetails['items'][0]['statistics']['subscriberCount'] : "Hidden"}</h4>
            <h3> Most Liked Video:</h3>*/



            /*<MDBCard>
            <MDBCardImage src={mostLikedVideo['snippet']['thumbnails']['default']['url']} position='top' alt='...' />
            <MDBCardBody>
                <MDBCardTitle>{mostLikedVideo['snippet']['title']}</MDBCardTitle>
                <MDBCardText>
                {mostLikedVideo['snippet']['description']}
                </MDBCardText>
                <MDBBtn href='#'>Watch</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            <h3> Most Commented Video:</h3>
            <MDBCard>
            <MDBCardImage src={mostCommentedVideo['snippet']['thumbnails']['default']['url']} position='top' alt='...' />
            <MDBCardBody tag="section">
                <MDBCardTitle>{mostCommentedVideo['snippet']['title']}</MDBCardTitle>
                <MDBCardText>
                {mostCommentedVideo['snippet']['description']}
                </MDBCardText>
                <MDBBtn href='#'>Watch</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            <h3> Most Viewed Video:</h3>
            <MDBCard>
            <MDBCardImage src={mostViewedVideo['snippet']['thumbnails']['default']['url']} position='top' alt='...' />
            <MDBCardBody>
                <MDBCardTitle>{mostViewedVideo['snippet']['title']}</MDBCardTitle>
                <MDBCardText>
                {mostViewedVideo['snippet']['description']}
                </MDBCardText>
                <MDBBtn href='#'>Watch</MDBBtn>
            </MDBCardBody>
            </MDBCard>
            <h3> Most Favorite Video:</h3>
            <MDBCard>
            <MDBCardImage src={mostFavoriteVideo['snippet']['thumbnails']['default']['url']} position='top' alt='...' />
            <MDBCardBody>
                <MDBCardTitle>{mostFavoriteVideo['snippet']['title']}</MDBCardTitle>
                <MDBCardText>
                {mostFavoriteVideo['snippet']['description']}
                </MDBCardText>
                <MDBBtn href='#'>Watch</MDBBtn>
            </MDBCardBody>
            </MDBCard>*/