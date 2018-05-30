import React, { Component } from 'react';

import InputCoord from './components/InputCoord'
import InputList from './components/InputList'

import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
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
      },
      selectedPath: "p",
    };

  }

  dataChanged(newData) {
    this.setState({data: newData});
  }

  pathChanged(path) {
    return (points) => {
      var newData = this.state.data;
      newData[path] = points;
      this.setState({data: newData});
    }
  }

  selectPath(path) {
    this.setState({selectedPath: path});
  }

  go() {
    console.log("Go! ", this.state.data);
  }

  render() {
    return (
      <div className="App">
        <h1>Lexicographic Fréchet Matchings</h1>

        {/* Input */}
        <InputCoord data={this.state.data}
          dataChanged={this.dataChanged.bind(this)}
          size={{ width: 500, height: 500 }}
          selectedPath={this.state.selectedPath}/>
        <InputList id="p" label="Path P"
          points={this.state.data.p}
          pointsChanged={this.pathChanged("p")}
          selected={this.state.selectedPath === "p"}
          select={() => {this.selectPath("p")}}
          maxHeight={400} />
        <InputList id="q" label="Path Q"
          points={this.state.data.q}
          pointsChanged={this.pathChanged("q")}
          selected={this.state.selectedPath === "q"}
          select={() => {this.selectPath("q")}}
          maxHeight={400} />

        {/* Action */}
        <button onClick={this.go.bind(this)}>Go!</button>

        {/* Result */}


      </div>
    );
  }
}

export default App;
