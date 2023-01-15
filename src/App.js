import logo from './logo.svg';
import './App.css';

let url;

const chrome = window.chrome;

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var activeTab = tabs[0];
  url = activeTab.url;
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {url}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
