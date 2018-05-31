import React, { Component } from 'react';
import './ResultHeatmap.css';
import Plot from 'react-plotly.js';

class ResultHeatmap extends Component {
  constructor(props){
    super(props);
  }

  render() {
    console.log("this.props.data.heatmap: ", this.props.data.heatmap);

    var max_p = this.props.data.length['p'];
    var max_q = this.props.data.length['q'];
    console.log("max_p: ", max_p);
    console.log("max_q: ", max_q);

    var bounds_l = this.props.data.bounds_l;
    var contour_size = (bounds_l[1] - bounds_l[0])/10;

    var heatmap_data = {
      x: this.props.data.heatmap[0][0],
      y: this.props.data.heatmap[1].map((ys, i) => {return ys[0]}),
      z: this.props.data.heatmap[2],
      type: 'contour',
      autocontour: false,
      contours: {
        start: bounds_l[0],
        end: bounds_l[1],
        size: contour_size
      }
    };

    var traversals_data = [];
    this.props.data.traversals.forEach((traversal) => {
      var traversal_data = {
        x: traversal['traversal-3d'][0],
        y: traversal['traversal-3d'][1],
        mode: 'lines'
      };
      traversals_data.push(traversal_data);
    });

    var borders = [];
    this.props.data.borders[0].forEach((b) => {
      var border_v = {
        type: 'line',
        x0: b,
        y0: 0,
        x1: b,
        y1: max_q,
        line: {
          color: 'rgba(255, 255, 255, 0.4)',
          width: 2
        }
      };
      borders.push(border_v);
    });
    this.props.data.borders[1].forEach((b) => {
      var border_h = {
        type: 'line',
        x0: 0,
        y0: b,
        x1: max_p,
        y1: b,
        line: {
          color: 'rgba(255, 255, 255, 0.4)',
          width: 2
        }
      };
      borders.push(border_h);
    });

    var l_lines = [];
    this.props.data.l_lines.forEach((l) => {
      l_lines.push({
        type: 'line',
        x0: l[0][0],
        y0: l[1][0],
        x1: l[0][1],
        y1: l[1][1],
        line: {
          color: 'rgba(30, 120, 255, 0.4)',
          width: 2
        }
      })
    });

    var layout = {
      width: this.props.maxsize.width,
      height: this.props.maxsize.height,
      title: 'Heatmap',
      shapes: [...borders, ...l_lines]

    };

    return (
      <Plot
        data={ [heatmap_data, ...traversals_data] }
        layout={ layout }
      />
    );
  }
}

export default ResultHeatmap;
