import React, { Component } from 'react';
import URLSearchParams from 'url-search-params';

import InputCoord from './components/InputCoord';
import InputList from './components/InputList';
import Results from './components/Results';

import './App.css';

const frechet_server_url = process.env.REACT_APP_FRECHET_SERVER_URL;

const default_data = {
  p: [
    {x: 3, y: 4}
  ],
  q: [
    {x: 3, y: 6}
  ]
};

function getDataFromURLParams() {
  let params = new URLSearchParams(window.location.search);

  let data = default_data;

  if (params.has("p")) {
    let p = parsePoints(params.get("p"));
    if (p.length >= 1) {
      data.p = p;
    }
  }
  if (params.has("q")) {
    let q = parsePoints(params.get("q"));
    if (q.length >= 1) {
      data.q = q;
    }
  }

  return data;
}

function parsePoints(string) {
  let points = [];
  string.slice(1, -1).split(")(").forEach((str_point) => {
    let coords = str_point.split("_");
    if (coords.length === 2) {
      let x = parseFloat(coords[0]);
      let y = parseFloat(coords[1]);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({x: x, y: y});
      }
    }
  });
  return points;
}

function writeDataToURLParams(data) {
  let params = new URLSearchParams(window.location.search);

  // generate param strings
  params.set('p', stringifyPoints(data.p));
  params.set('q', stringifyPoints(data.q));

  // set window url
  let new_url = decodeURI(`${window.location.pathname}?${params}`);
  window.history.replaceState({}, '', new_url);
}

function stringifyPoints(points) {
  let string = "(";
  points.forEach(point => {
    string += point.x + "_" + point.y + ")(";
  });
  string = string.slice(0, -1);
  return string;
}


class App extends Component {
  constructor(props) {
    super(props);

    // get data from url and write data to url
    let data = getDataFromURLParams();
    writeDataToURLParams(data);

    this.state = {
      data: data,
      selectedPath: "p",
      showResults: false,
      result: {}
    };
  }

  calculateInputRange = () => {
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
  };

  dataChanged = (newData) => {
    this.setState({data: newData});
    // write to url params
    writeDataToURLParams(newData);
  };

  pathChanged = (path) => {
    return (points) => {
      // update data
      let newData = this.state.data;
      newData[path] = points;
      // set state
      this.dataChanged(newData);
    }
  };

  selectPath = (path) => {
    this.setState({selectedPath: path});
  };

  go = () => {
    console.log("Run with data:", this.state.data);

    if (this.state.data.p.length < 2 || this.state.data.p.length < 2) {
      this.setState({showResults: false});
      alert("Please input at least two points per path.");
    }

    fetch(frechet_server_url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.data)
    }).then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    }).then((result) => {
      console.log("Results: ", result);
      this.setState({error: "", showResults: true, result: result});

      // scroll to results
      window.scrollTo({
        top: 1000,
        left: 0,
        behavior: 'smooth'
      });
    }).catch((error) => {
      console.log("An error occured: "+error+"\nPlease send a quick email to a.begehr@fu-berlin.de");
      const send_email = window.confirm("An error occured.\n"+error+"\nPlease send a quick email to a.begehr@fu-berlin.de");
      if (send_email) {
        window.location.href = "mailto:a.begehr@fu-berlin.de?subject=FréchetWebappError&body="+encodeURI(error);
      }
    });
  };

  resetInput = () => {
    // reload page without parameters (to allow browser back)
    window.location = window.location.pathname;
  };

  resetResults = () => {
    // hide results
    this.setState({showResults: false});
  };

  render() {
    const width = this.props.width;
    const inputRange = this.calculateInputRange();

    let results;
    if (this.state.showResults) {
      results = (
        <div className="results">
          <Results data={this.state.result}
            width={width} />
          <br />
          <div className="button reset" onClick={this.resetResults}>
            Clear Results
          </div>
        </div>
      );
    }

    return (
      <div className="App"
        style={{width: width}}>

        <div className="header">
          <a href="" className="heading">Lexicographic Fréchet Matchings</a>
        </div>

        {/* Input */}
        <div className="input">
          <InputCoord data={this.state.data}
            pathsColor={{p: "DarkSlateBlue", q: "Green"}}
            dataChanged={this.dataChanged}
            size={{ width: (2/3)*width, height: (2/3)*width }}
            selectedPath={this.state.selectedPath}
            inputRange={inputRange} />
          <div className="input_lists"
            style={{width: (1/3)*width, height: (2/3)*width}}>
            <InputList id="p" label="Path P"
              style={{
                backgroundColor: "DarkSlateBlue",
                width: (1/3)*width,
                height: (1/3)*width
              }}
              points={this.state.data.p}
              pointsChanged={this.pathChanged("p")}
              selected={this.state.selectedPath === "p"}
              select={() => {this.selectPath("p")}}
              inputRange={inputRange} />
            <InputList id="q" label="Path Q"
              style={{
                backgroundColor: "Green",
                width: (1/3)*width,
                height: (1/3)*width
              }}
              points={this.state.data.q}
              pointsChanged={this.pathChanged("q")}
              selected={this.state.selectedPath === "q"}
              select={() => {this.selectPath("q")}}
              inputRange={inputRange} />
          </div>
        </div>
        <div className="buttons">
          <div className="button clear" onClick={this.resetInput}>
            Clear
          </div>
          <div className="button go" onClick={this.go}>
            Run!
          </div>
        </div>

        {/* Result */}
        {results}

        <br />

      </div>
    );
  }
}

export default App;
