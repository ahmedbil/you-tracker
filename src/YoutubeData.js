import React, { useState, useEffect } from 'react';
import { BeatLoader } from "react-spinners";
import './App.scss';

const chrome = window.chrome;





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
            const curLikeStat = parseInt(item['statistics']['likeCount']);
            const curCommentStat = parseInt(item['statistics']['commentCount']);
            const curViewStat = parseInt(item['statistics']['viewCount']);
            const curFavoriteStat = parseInt(item['statistics']['favoriteCount']);
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
    function playVideo(id) {
        chrome.tabs.create({ url: 'https://www.youtube.com/watch?v=' + id });
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
            if (age >= 1800000) {
            localStorage.removeItem(cacheKey);
            } else {
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
        data['videosData'] = {'valid': true};
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

    function formatNumber(num) {
        if (num >= 1000000000) {
          return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + ' B';
        }
        if (num >= 1000000) {
          return (num / 1000000).toFixed(1).replace(/\.0$/, '') + ' M';
        }
        if (num >= 1000) {
          return (num / 1000).toFixed(1).replace(/\.0$/, '') + ' K';
        }
        return num;
      }

    

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
            <div class="profile-card">
            <div class="profile-image-container">
                <img src={channelDetails['items'][0]['snippet']['thumbnails']['high']['url']} alt="Profile Image" class="profile-image"/>
            </div>
            <h2 class="profile-name">{channelDetails['items'][0]['snippet']['title']}</h2>
            <div class="profile-stats">
                <div class="profile-stat">
                <span class="stat-value">{(channelDetails['items'][0]['statistics']['hiddenSubscriberCount'] === false)? formatNumber(channelDetails['items'][0]['statistics']['subscriberCount']) : "Hidden"}</span>
                <span class="stat-label">Subscribers</span>
                </div>
                <div class="profile-stat">
                <span class="stat-value">{formatNumber(channelDetails['items'][0]['statistics']['videoCount'])}</span>
                <span class="stat-label">Videos</span>
                </div>
                <div class="profile-stat">
                <span class="stat-value">{formatNumber(channelDetails['items'][0]['statistics']['viewCount'])}</span>
                <span class="stat-label">Views</span>
                </div>
            </div>
            </div>


            {
                (mostLikedVideo != null)?
                <div class="card">
                    <div class="card-title">
                        <h2>Most Liked Video</h2>
                    </div>
                <img src={mostLikedVideo['snippet']['thumbnails']['high']['url']} alt="Placeholder Image"/>
                <div class="card-info">
                    <h2>{mostLikedVideo['snippet']['title']}</h2>
                    <button class="card-button" id={mostLikedVideo['id']} onClick={(event) => {playVideo(event.target.id)}}>Watch</button>
                </div>
                </div>
                :
                <div></div>
            }
            
            <div class="card">
                <div class="card-title">
                    <h2>Most Commented Video</h2>
                </div>
            <img src={mostCommentedVideo['snippet']['thumbnails']['high']['url']} alt="Placeholder Image"/>
            <div class="card-info">
                <h2>{mostCommentedVideo['snippet']['title']}</h2>
                <button class="card-button" id={mostCommentedVideo['id']} onClick={(event) => {playVideo(event.target.id)}}>Watch</button>
            </div>
            </div>
            <div class="card">
                <div class="card-title">
                    <h2>Most Viewed Video</h2>
                </div>
            <img src={mostViewedVideo['snippet']['thumbnails']['high']['url']} alt="Placeholder Image"/>
            <div class="card-info">
                <h2>{mostViewedVideo['snippet']['title']}</h2>
                <button class="card-button" id={mostViewedVideo['id']} onClick={(event) => {playVideo(event.target.id)}}>Watch</button>
            </div>
            </div>
            <div class="card">
                <div class="card-title">
                    <h2>Most Favorite Video</h2>
                </div>
            <img src={mostFavoriteVideo['snippet']['thumbnails']['high']['url']} alt="Placeholder Image"/>
            <div class="card-info">
                <h2>{mostFavoriteVideo['snippet']['title']}</h2>
                <button class="card-button" id={mostFavoriteVideo['id']} onClick={(event) => {playVideo(event.target.id)}}>Watch</button>
            </div>
            </div>
        </div>
      );
}

export default YoutubeData;