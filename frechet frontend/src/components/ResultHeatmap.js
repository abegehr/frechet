import React, { Component } from 'react';
import './ResultHeatmap.css';
import Plot from 'react-plotly.js';

class ResultHeatmap extends Component {
  constructor(props){
    super(props);
  }

  render() {
    console.log("this.props.data.heatmap: ", this.props.data.heatmap);

    return (
      <Plot
        data={[
          {
            x: this.props.data.heatmap[0][0],
            y: this.props.data.heatmap[1].map((ys, i) => {return ys[0]}),
            z: this.props.data.heatmap[2],
            type: 'heatmap'
          },
        ]}
        layout={ {width: this.props.maxsize.width, height: this.props.maxsize.height, title: 'Heatmap'} }
      />
    );
  }
}

export default ResultHeatmap;
