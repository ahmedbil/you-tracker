import React, { useState, useEffect } from 'react';


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

    function getMostTypeVideo(videoList, type) {
        console.log(videoList);
        let stat = ''
        switch (type) {
            case "like":
              stat = 'likeCount' 
              break;
            case "comment":
              stat = 'commentCount'
              break;
            case "view":
              stat = 'viewCount'
              break;
            case "favorite":
              stat = 'favoriteCount'
              break;
            default:
              stat = ''
          }
        let curMax = 0;
        let maxVideo = null;
        videoList.forEach((item) => {
            const curStat = item['statistics'][stat];
            if (curStat > curMax) {
                curMax = curStat;
                console.log("max");
                maxVideo = item;
            }
        });
        return maxVideo;
    }

    const getVideoDetails = async (videoUrl, authToken) => {
        const videoId = extractVideoId(videoUrl);
        const videoData = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyBD5uwgJHyCv9NYOfXkC2JoSGYdoLjK8FA`)
        .then(response => response.json());
        const channelId = videoData.items[0].snippet.channelId;
        const channelData = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=AIzaSyBD5uwgJHyCv9NYOfXkC2JoSGYdoLjK8FA`)
        .then(response => response.json());
        const playlistId = channelData['items'][0]['contentDetails']['relatedPlaylists']['uploads'];

        let nextPage = true;
        let videoIdList = [];
        let videoListReq = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=AIzaSyBD5uwgJHyCv9NYOfXkC2JoSGYdoLjK8FA`;

        while (nextPage) {
            const videoList = await fetch(videoListReq).then(response => response.json());
            let data = videoList['items'];
            data.forEach(video => {
                let videoId = video['contentDetails']['videoId'];
                if (!videoIdList.includes(videoId)) {
                    videoIdList.push(videoId);
                }
            });
            if ('nextPageToken' in videoList) {
                nextPage = true;
                videoListReq = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${videoList['nextPageToken']}&key=AIzaSyBD5uwgJHyCv9NYOfXkC2JoSGYdoLjK8FA`;

            } else {
                nextPage = false;
            }
        }

        let videosData = [];

        let videoListLength = videoIdList.length;

        for (let i = 0; i < videoListLength; i += 50) {
            const videoInfos = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIdList.slice(i, i+50)}&key=AIzaSyBD5uwgJHyCv9NYOfXkC2JoSGYdoLjK8FA`)
            .then(response => response.json());
            videosData = videosData.concat(videoInfos['items']);
        }

        setChannelDetails(channelData);
        setVideoDetails(videosData);
        setMostLikedVideo(getMostTypeVideo(videosData, "like"));
        setMostCommentedVideo(getMostTypeVideo(videosData, "comment"));
        setMostViewedVideo(getMostTypeVideo(videosData, "view"));
        setMostFavoriteVideo(getMostTypeVideo(videosData, "favorite"));       
    };

    

      useEffect(() => {
        getVideoDetails(url, auth);
      }, []);
    
    if (!videoDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div>
          {channelDetails['items'][0]['snippet']['title']}
        </div>
      );
}

export default YoutubeData;

