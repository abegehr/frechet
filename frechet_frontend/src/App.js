import React, { Component } from 'react';

import InputPoints from './components/InputPoints';
import Results from './components/Results';

import './App.css';

const frechet_server_url = process.env.REACT_APP_FRECHET_SERVER_URL;

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showResults: false,
      result: {}
    };
  }

  go = (data) => {
    console.log("Run with data:", data);

    if (data.p.length < 2 || data.p.length < 2) {
      this.setState({showResults: false});
      alert("Please input at least two points per path.");
      return;
    }

    fetch(frechet_server_url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
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
        const body = window.location.href + "\n" + error;
        window.location.href = "mailto:a.begehr@fu-berlin.de?subject=FréchetWebappError&body="+encodeURI(body);
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

    let results;
    if (this.state.showResults) {
      results = (
        <div className="results">
          <Results data={this.state.result}
            width={width} />
        </div>
      );
    }

    return (
      <div className="App"
        style={{width: width}}>

        <div className="header">
          <a href="#" className="heading">Lexicographic Fréchet Matchings</a>
        </div>

        {/* Input */}
        <InputPoints width={width}
          go={this.go}/>

        <div className="buttons">
          <div className="button clear" onClick={this.resetInput}>
            Clear Input
          </div>
          <div className="button reset" onClick={this.resetResults}>
            Clear Results
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
