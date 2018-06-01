import React, { Component } from 'react';

import InputCoord from './components/InputCoord'
import InputList from './components/InputList'
import Results from './components/Results'

import './App.css';

const frechet_api_url = 'http://127.0.0.1:5000'

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
      showResults: false,
      result: {}
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

    fetch(frechet_api_url, {
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
