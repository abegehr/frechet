import React, { Component } from 'react';
import './Results.css';
import Plot from 'react-plotly.js';

function round(num) {
  return Math.round(num*100)/100;
}

class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {
        show_l_lines: true,
        show_contours: true,
        show_critical_events: true,
        show_cell_borders: true,
        show_traversals: true
      }
    };

    this.toggleSetting = this.toggleSetting.bind(this);
  }

  toggleSetting = (event) => {
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
    // constants and settings
    const max_p = this.props.data.lengths.p;
    const max_q = this.props.data.lengths.q;
    const bounds_l = this.props.data.bounds_l;
    const delta_epsilon = bounds_l[1] - bounds_l[0];
    const contour_lines = 10;
    const contour_size = delta_epsilon/contour_lines;

    /*
    // scale plot to fit data
    const main_margin_ver = main_margin.b + main_margin.t;
    const main_margin_hor = main_margin.l + main_margin.r;
    const max_width = this.props.maxSize.width - main_margin_hor;
    const max_height = this.props.maxSize.height - main_margin_ver;

    let main_width = main_margin_ver +
        Math.min(max_width, max_width*(max_p/max_q));
    let main_height = main_margin_hor +
        Math.min(max_height, max_height*(max_q/max_p));
    */


    // main
    const main_data = [];
    const main_shapes = [];

    // heatmap and contours
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
      line: {
        smoothing: 0
      },
      hoverinfo: "x+y+z"
    };
    if (!this.state.settings.show_contours) {
      heatmap_data.type = 'heatmap';
    }

    // traversal
    const traversals_data = [];
    this.props.data.traversals.forEach((traversal, i) => {
      traversals_data.push({
        x: traversal.x,
        y: traversal.y,
        mode: 'lines',
        line: {
          color: 'rgba(255, 0, 0, 1)',
          width: 4,
          dash: 'line'
        },
        hoverinfo: 'name+text',
        name: "#"+i,
        text: traversal.z.map(z => {return "ε = "+round(z)})
      });
    });

    // cell borders
    const borders = [];
    // vertical
    this.props.data.borders[0].forEach((b) => {
      borders.push({
        type: 'line',
        x0: b,
        y0: 0,
        x1: b,
        y1: max_q,
        line: {
          color: 'rgba(255, 255, 255, 0.4)',
          width: 2
        }
      });
    });
    this.props.data.borders[1].forEach((b) => {
      // horizontal
      borders.push({
        type: 'line',
        x0: 0,
        y0: b,
        x1: max_p,
        y1: b,
        line: {
          color: 'rgba(255, 255, 255, 0.4)',
          width: 2
        }
      });
    });

    // l-lines
    const l_lines = [];
    this.props.data.l_lines.forEach((l) => {
      l_lines.push({
        x: l[0],
        y: l[1],
        mode: 'lines',
        hoverinfo: 'skip',
        line: {
          color: 'rgba(34, 167, 31, 1)',
          width: 2,
          dash: 'dots'
        }
      });
    });

    // critical events
    const critical_events = [];
    this.props.data.critical_events.forEach((c) => {
      critical_events.push({
        x: c[0],
        y: c[1],
        mode: 'lines+markers',
        marker: {
          color: 'rgba(0, 0, 255, 1)',
          size: 10
        },
        line: {
          color: 'rgba(0, 0, 255, 1)',
          width: 2,
          dash: 'dash'
        },
        hoverinfo: 'text',
        text: 'ε = ' + round(c[2])
      });
    });

    // traversals cross section
    const traversals_cs_data = [];
    this.props.data.traversals.forEach((traversal) => {
      traversals_cs_data.push({
        x: traversal.t,
        y: traversal.z,
        mode: 'lines'
      });
    });

    // main 3d
    const main3d_data = []
    const surface_data = {
      x: this.props.data.heatmap[0][0],
      y: this.props.data.heatmap[1].map((ys, i) => {return ys[0]}),
      z: this.props.data.heatmap[2],
      type: 'surface'
    };
    main3d_data.push(surface_data);

    // add data and shapes
    main_data.push(heatmap_data);
    if (this.state.settings.show_l_lines) {
      main_data.push(...l_lines);
    }
    if (this.state.settings.show_cell_borders) {
      main_shapes.push(...borders);
    }
    if (this.state.settings.show_critical_events) {
      main_data.push(...critical_events);
    }
    if (this.state.settings.show_traversals) {
      main_data.push(...traversals_data);
    }

    // layouts
    const width = this.props.width;
    const main_layout = {
      shapes: main_shapes,
      autosize: true,
      margin: {
        l: 40,
        r: 0,
        t: 20,
        b: 40
      },
      xaxis: {
        nticks: 10,
        domain: [0, max_p],
        title: "Path P"
      },
      yaxis: {
        scaleanchor: "x",
        domain: [0, max_q],
        title: "Path Q"
      },
      width: width,
      height: (2/3)*width,
      hovermode: 'closest',
      showlegend: false
    };
    const main3d_layout = {
      autosize: true,
      scene:{
        aspectmode: "manual",
        aspectratio: {
          x: 1, y: max_q/max_p, z: delta_epsilon/max_p,
        },
        xaxis: {
          nticks: 10,
          range: [0, max_p],
          title: "Path P"
        },
        yaxis: {
          nticks: 10,
          range: [0, max_q],
          title: "Path Q"
        },
        zaxis: {
          nticks: 10,
          range: [bounds_l[0], bounds_l[1]],
          title: "ε"
        },
        camera: {
          center: {x: 0, y: 0, z: 0},
          eye: {x: -0.5, y: -1.5, z: 0.1},
          up: {x: 0, y: 0, z: 1}
        }
      },
      width: width,
      height: (2/3)*width
    };
    const traversals_cs_layout = {
      title: 'Traversal Cross Section',
      autosize: true,
      margin: {
        l: 40,
        r: 0,
        t: 40,
        b: 40
      },
      xaxis: {
        nticks: 10,
        title: "time"
      },
      yaxis: {
        domain: bounds_l,
        title: "ε"
      },
      width: width,
      height: (1/3)*width,
      showlegend: true
    };

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
          <br />
          <label className="show_contours">
            show contours
            <input
              name="show_contours"
              type="checkbox"
              checked={this.state.settings.show_contours}
              onChange={this.toggleSetting} />
          </label>
          <br />
          <label className="show_critical_events">
            show critical events
            <input
              name="show_critical_events"
              type="checkbox"
              checked={this.state.settings.show_critical_events}
              onChange={this.toggleSetting} />
          </label>
          <br />
          <label className="show_cell_borders">
            show cell borders
            <input
              name="show_cell_borders"
              type="checkbox"
              checked={this.state.settings.show_cell_borders}
              onChange={this.toggleSetting} />
          </label>
          <br />
          <label className="show_traversals">
            show traversals
            <input
              name="show_traversals"
              type="checkbox"
              checked={this.state.settings.show_traversals}
              onChange={this.toggleSetting} />
          </label>
        </div>
        <Plot
          className="main"
          data={ [...main_data] }
          layout={ main_layout }
        />
        <br />
        <Plot
          className="main3d"
          data={ [...main3d_data] }
          layout={ main3d_layout }
        />
        <Plot
          className="traversal-cs"
          data={ [...traversals_cs_data] }
          layout={ traversals_cs_layout }
        />
      </div>
    );
  }
}

export default Results;
