import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import InputCoord from './components/InputCoord'

class App extends Component {
  render() {
    var data = {
      p: [
        {x: 1, y: 1},
        {x: 4, y: 3},
        {x: 5, y: 2},
        {x: 6, y: 4},
        {x: 2, y: 8},
      ],
      q: [
        {x: 2, y: 1},
        {x: 5, y: 1},
        {x: 6, y: 2},
        {x: 2, y: 6},
        {x: 5, y: 7},
      ]
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>

        <InputCoord data={data} size={{ width: 500, height: 500 }} />

      </div>
    );
  }
}

export default App;
