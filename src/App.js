import './App.scss';
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

  return (
    <div className="body">
      <div class="container">
      <header>
          <h1>
              <img src={logo} alt="Extension logo"/>
              Youtracker
          </h1>
          <div class="extension-btns">
            <button id="toggle-mode-btn" onClick={switchMode}>
              <img id="mode-img" src={light} alt="Light mode icon"/>
            </button>
          </div>
      </header>
      <div class="main-content">
        <p>{url}</p>
      </div>
      <footer>
          <p>Copyright © 2023 Youtracker</p>
      </footer>
      </div>
  </div>

  );
}

export default App;
