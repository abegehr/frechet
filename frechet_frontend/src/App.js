import React, { Component } from 'react';

import InputCoord from './components/InputCoord'
import InputList from './components/InputList'
import Results from './components/Results'

import './App.css';

const frechet_server_url = process.env.REACT_APP_FRECHET_SERVER_URL

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        p: [
          {x: 0, y: 0},
          {x: 6, y: 0},
          {x: 0, y: 0},
        ],
        q: [
          {x: 1, y: -1},
          {x: 1, y: 5},
          {x: 1, y: -1},
        ]
      },
      selectedPath: "p",
      showResults: false,
      result: {}
    };

  }

  calculateInputRange() {
    // data
    const coords_p = this.state.data.p;
    const coords_q = this.state.data.q;

    let xMin = Math.min(Math.min(...coords_p.map(p => {return p.x})),
      Math.min(...coords_q.map(p => {return p.x})));
    let xMax = Math.max(Math.max(...coords_p.map(q => {return q.x})),
      Math.max(...coords_q.map(q => {return q.x})));
    let yMin = Math.min(Math.min(...coords_p.map(p => {return p.y})),
      Math.min(...coords_q.map(p => {return p.y})));
    let yMax = Math.max(Math.max(...coords_p.map(q => {return q.y})),
      Math.max(...coords_q.map(q => {return q.y})));

    let dx = Math.abs(xMax-xMin);
    let dy = Math.abs(yMax-yMin);
    if (dx > dy) {
      const dxy = dx - dy;
      yMin -= 0.5*dxy;
      yMax += 0.5*dxy;
      dy = dx;
    } else if (dy > dx) {
      const dyx = dy - dx;
      xMin -= 0.5*dyx;
      xMax += 0.5*dyx;
      dx = dy;
    }

    const padding = 0.05;
    const xRange = {
      min: Math.min(0, xMin-dx*padding),
      max: Math.max(10, xMax+dx*padding)
    };
    const yRange = {
      min: Math.min(0, yMin-dy*padding),
      max: Math.max(10, yMax+dy*padding)
    };
    return [xRange, yRange];
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

    fetch(frechet_server_url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.data)
    }).then((response) => {
      return response.json();
    }).then((result) => {
      console.log("result: ", result);
      this.setState({showResults: true, result: result});
    });
  }

  render() {
    var results;
    if (this.state.showResults) {
      results = (
        <Results data={this.state.result}
          maxSize={{width: 1400, height: 1000}} />
      );
    }

    const inputRange = this.calculateInputRange();

    return (
      <div className="App">
        <h1>Lexicographic Fréchet Matchings</h1>

        {/* Input */}
        <InputCoord data={this.state.data}
          dataChanged={this.dataChanged.bind(this)}
          size={{ width: 500, height: 500 }}
          selectedPath={this.state.selectedPath}
          inputRange={inputRange} />
        <InputList id="p" label="Path P"
          points={this.state.data.p}
          pointsChanged={this.pathChanged("p")}
          selected={this.state.selectedPath === "p"}
          select={() => {this.selectPath("p")}}
          maxHeight={400}
          inputRange={inputRange} />
        <InputList id="q" label="Path Q"
          points={this.state.data.q}
          pointsChanged={this.pathChanged("q")}
          selected={this.state.selectedPath === "q"}
          select={() => {this.selectPath("q")}}
          maxHeight={400}
          inputRange={inputRange} />
        <br />

        {/* Action */}
        <button onClick={this.go.bind(this)}>Go!</button>
        <br />

        {/* Result */}
        {results}

        <br />
        <br />
        <br />

      </div>
    );
  }
}

export default App;
