import React, { Component } from 'react';
import './Results.css';
import Plot from 'react-plotly.js';

class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {
        show_l_lines: true,
        show_contours: true,
        show_critical_events: true,
        show_cell_borders: true
      }
    };

    this.toggleSetting = this.toggleSetting.bind(this);
  }

  toggleSetting(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    console.log("this: ", this);
    console.log("this.state: ", this.state);

    var newSettings = this.state.settings;
    newSettings[name] = value;

    this.setState({
      settings: newSettings
    });
  }

  render() {
    console.log("this.props.data.heatmap: ", this.props.data.heatmap);

    var max_p = this.props.data.lengths.p;
    var max_q = this.props.data.lengths.q;

    var bounds_l = this.props.data.bounds_l;
    var contour_size = (bounds_l[1] - bounds_l[0])/10;

    // heatmap
    const heatmap_data = {
      x: this.props.data.heatmap[0][0],
      y: this.props.data.heatmap[1].map((ys, i) => {return ys[0]}),
      z: this.props.data.heatmap[2],
      type: 'contour',
      autocontour: false,
      contours: {
        start: bounds_l[0],
        end: bounds_l[1],
        size: contour_size
      },
      line:{
        smoothing: 0
      }
    };

    var traversals_data = [];
    this.props.data.traversals.forEach((traversal) => {
      var traversal_data = {
        x: traversal.x,
        y: traversal.y,
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
          color: 'rgba(0, 0, 0, 0.4)',
          width: 2
        }
      })
    });

    var heatmap_margin = {
      l: 80,
      r: 80,
      t: 100,
      b: 80
    };
    var heatmap_width = heatmap_margin.l + heatmap_margin.r + Math.min(this.props.maxSize.width,
      this.props.maxSize.width*(max_p/max_q));
    var heatmap_height = heatmap_margin.t + heatmap_margin.b + Math.min(this.props.maxSize.height,
      this.props.maxSize.height*(max_q/max_p));
    var heatmap_shapes = [];
    if (this.state.settings.show_l_lines) {
      heatmap_shapes.push(...l_lines);
    }
    if (this.state.settings.show_cell_borders) {
      heatmap_shapes.push(...borders);
    }
    var heatmap_layout = {
      title: 'Heatmap',
      shapes: heatmap_shapes,
      autosize: true,
      margin: heatmap_margin,
      xaxis: {
        nticks: 10,
        domain: [0, max_p],
        title: "path P"
      },
      yaxis: {
        scaleanchor: "x",
        domain: [0, max_q],
        title: "path Q"
      },
      width: heatmap_width,
      height: heatmap_height
    };

    // traversals cross section
    var traversals_cross_section_data = [];
    this.props.data.traversals.forEach((traversal) => {
      var traversal_cross_section_data = {
        x: traversal.t,
        y: traversal.z,
        mode: 'lines'
      };
      traversals_cross_section_data.push(traversal_cross_section_data);
    });
    console.log("traversals_cross_section_data: ", traversals_cross_section_data)

    return (
      <div className="results">
        <div className="settings">
          <label className="show_l_lines">
            show l-lines
            <input
              name="show_l_lines"
              type="checkbox"
              checked={this.state.settings.show_l_lines}
              onChange={this.toggleSetting} />
          </label>
          <label className="show_contours">
            show contours
            <input
              name="show_contours"
              type="checkbox"
              checked={this.state.settings.show_contours}
              onChange={this.toggleSetting} />
          </label>
          <label className="show_critical_events">
            show critical events
            <input
              name="show_critical_events"
              type="checkbox"
              checked={this.state.settings.show_critical_events}
              onChange={this.toggleSetting} />
          </label>
          <label className="show_cell_borders">
            show cell borders
            <input
              name="show_cell_borders"
              type="checkbox"
              checked={this.state.settings.show_cell_borders}
              onChange={this.toggleSetting} />
          </label>
        </div>
        <Plot
          className="heatmap"
          data={ [heatmap_data, ...traversals_data] }
          layout={ heatmap_layout }
        />
        <br />
        <Plot
          className="traversal-cross-section"
          data={ [...traversals_cross_section_data] }
          layout={ {} }
        />
      </div>
    );
  }
}

export default Results;
