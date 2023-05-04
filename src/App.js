import './App.scss';
import React, { useState, useEffect } from 'react';
import YoutubeData from './YoutubeData';

import logo from './images/youtracker-logo.png'
import light from './images/brightness.png'
import dark from './images/moon.png'
let url;

const chrome = window.chrome;

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var activeTab = tabs[0];
  url = activeTab.url;
});



function App() {
  let isLightMode = true;
  const clientId = '401793669826-2kv6ep06vpta6it2utj141dmtab9e8vk.apps.googleusercontent.com';
  const scope = 'https://www.googleapis.com/auth/youtube';
  let auth_token = "";

  const [isSignedIn, setIsSignedIn] = useState(false);


  function switchMode() {
    const modeImg = document.getElementById("mode-img");
    if (isLightMode) {
      document.body.classList.add("dark-mode");
      modeImg.src = dark;
    } else {
      document.body.classList.remove("dark-mode");
      modeImg.src = light;
    }
    isLightMode = !isLightMode;
  }

  useEffect(() => {
    chrome.identity.getAuthToken({interactive: true }, (token) => {
      console.log("hello" + Math.floor(Math.random() * 7));
      auth_token = token;
      console.log(auth_token);
      if (auth_token) {
        setIsSignedIn(true);
      }
    })
  }, []);

  if (!isSignedIn) {
    return(
      <div className="body">
      <div class="container">
      <header>
          <h1>
              <img class="image-logo" src={logo} alt="Extension logo"/>
              Youtracker
          </h1>
          <div class="extension-btns">
            <button id="toggle-mode-btn" onClick={switchMode}>
              <img id="mode-img" class="image-mode" src={light} alt="Light mode icon"/>
            </button>
          </div>
      </header>
      <div class="main-content">
        <div>Loading...</div>
      </div>
      <footer>
          <p>Copyright © 2023 Youtracker</p>
      </footer>
      </div>
  </div>
    );
  }

  return (
    <div className="body">
      <div class="container">
      <header>
          <h1>
              <img class="image-logo" src={logo} alt="Extension logo"/>
              Youtracker
          </h1>
          <div class="extension-btns">
            <button id="toggle-mode-btn" onClick={switchMode}>
              <img id="mode-img" class="image-mode" src={light} alt="Light mode icon"/>
            </button>
          </div>
      </header>
      <div class="main-content">
        <YoutubeData auth = {auth_token} url = {url}/>
      </div>
      <footer>
          <p>Copyright © 2023 Youtracker</p>
      </footer>
      </div>
  </div>

  );
}

export default App;
