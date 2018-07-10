import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import Slider from 'rc-slider';

import './Results.css';
import 'rc-slider/assets/index.css';

function roundTo(num, size) {
  return Math.round(num*size)/size;
}

function round(num) {
  return roundTo(num, 100);
}

function color(i) {
  const colors = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf'   // blue-teal
  ];
  return colors[i%10];
}

class Results extends Component {
  constructor(props) {
    super(props);

    let freespace_epsilon = 0;
    if (props.data.traversals.length > 0) {
      freespace_epsilon = props.data.traversals[0].epsilon[0];
    }

    this.state = {
      settings: {
        show_l_lines: true,
        show_contours: true,
        show_critical_events: true,
        show_cell_borders: true,
        show_traversals: true,
        show_freespace: false
      },
      freespace_epsilon: freespace_epsilon
    };

    this.toggleSetting = this.toggleSetting.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let new_freespace_epsilon = 0;
    if (nextProps.data.traversals.length > 0) {
      new_freespace_epsilon = nextProps.data.traversals[0].epsilon[0];
    }
    if (this.state.freespace_epsilon !== new_freespace_epsilon) {
      this.setState({freespace_epsilon: new_freespace_epsilon});
    }
  }

  toggleSetting = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    var newSettings = this.state.settings;
    newSettings[name] = value;

    this.setState({
      settings: newSettings
    });
  }

  change_freespace_epsilon = (epsilon) => {
    this.setState({freespace_epsilon: epsilon});
  }

  render() {
    // constants and settings
    const max_p = this.props.data.lengths.p;
    const max_q = this.props.data.lengths.q;
    const bounds_l = this.props.data.bounds_l;
    const delta_epsilon = bounds_l[1] - bounds_l[0];
    const contour_lines = 10;
    const contour_size = delta_epsilon/contour_lines;
    // slider
    let frechet_epsilon = 0;
    if (this.props.data.traversals.length > 0) {
      frechet_epsilon = this.props.data.traversals[0].epsilon[0];
    }
    const slider_ticks = 1000;
    const slider_step = delta_epsilon/slider_ticks;
    const slider_marks = {};
    slider_marks[frechet_epsilon] = {
      label: "ε: "+frechet_epsilon,
      style: {color: 'white'}
    };
    const frechet_round = (eps) => {return roundTo(eps, 1e6)};

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
      line: {
        smoothing: 0
      },
      hoverinfo: "x+y+z"
    };
    if (this.state.settings.show_freespace) {
      const epsilon = this.state.freespace_epsilon;
      heatmap_data.contours = {
        start: epsilon,
        end: epsilon,
        size: 0
      };
    } else {
      if (!this.state.settings.show_contours) {
        heatmap_data.type = 'heatmap';
      }
      heatmap_data.contours = {
        start: bounds_l[0],
        end: bounds_l[1],
        size: contour_size
      };
    }

    // traversal
    const traversals_data = [];
    this.props.data.traversals.forEach((traversal, i) => {
      // traversals
      traversals_data.push({
        x: traversal.x,
        y: traversal.y,
        mode: 'lines',
        line: {
          color: 'rgba(255, 0, 0, 1)',
          width: 4,
          dash: 'line'
        },
        hoverinfo: 'name+text+x+y',
        name: "#"+i,
        text: traversal.z.map(z => {return "ε: "+round(z)})
      });
      // epsilon points
      const epsilon_points = traversal.epsilon_points;
      traversals_data.push({
        x: epsilon_points[0],
        y: epsilon_points[1],
        mode: 'markers',
        marker: {
          color: 'rgba(181, 0, 0, 1)',
          size: 10,
          line: {
            color: 'rgb(232, 214, 90)',
            width: 1
          }
        },
        hoverinfo: 'name+text+x+y',
        name: "#"+i,
        text: 'Fréchet Distance: ' + frechet_round(epsilon_points[2][0])
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
      const label = 'ε: ' + round(c[2]);
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
        hoverinfo: 'text+x+y',
        text: label
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

    // traversal 3d
    const traversals3d_data = [];
    this.props.data.traversals.forEach((traversal, i) => {
      // traversals
      traversals3d_data.push({
        type: 'scatter3d',
        x: traversal.x,
        y: traversal.y,
        z: traversal.z.map((z, i) => {return z+delta_epsilon/100}),
        mode: 'lines',
        line: {
          color: 'rgba(255, 0, 0, 1)',
          width: 8,
          dash: 'line'
        },
        hoverinfo: 'name+text+x+y',
        name: "#"+i,
        text: traversal.z.map(z => {return "ε: "+round(z)})
      });
      // epsilon points
      const epsilon_points = traversal.epsilon_points;
      traversals3d_data.push({
        type: 'scatter3d',
        x: epsilon_points[0],
        y: epsilon_points[1],
        z: epsilon_points[2],
        mode: 'markers',
        marker: {
          color: 'rgba(181, 0, 0, 1)',
          size: 6,
          line: {
            color: 'rgb(232, 214, 90)',
            width: 1
          }
        },
        hoverinfo: 'name+text+x+y',
        name: "#"+i,
        text: epsilon_points[2].map((eps) => {
          return 'Fréchet Distance: ' + frechet_round(eps);
        })
      });
    });

    // critical events 3d
    const critical_events_3d = [];
    this.props.data.critical_events.forEach((c) => {
      const label = 'ε: ' + round(c[2]);
      critical_events_3d.push({
        type: 'scatter3d',
        x: c[0],
        y: c[1],
        z: [c[2], c[2]],
        mode: 'lines+markers',
        marker: {
          color: 'rgba(0, 0, 255, 1)',
          size: 4
        },
        line: {
          color: 'rgba(0, 0, 255, 1)',
          width: 2,
          dash: 'dash'
        },
        hoverinfo: 'text+x+y',
        text: [label, label]
      });
    });

    // traversals cross section
    const traversals_cs_data = [];
    this.props.data.traversals.forEach((traversal, i) => {
      // normal cross section
      traversals_cs_data.push({
        x: traversal.t,
        y: traversal.z,
        mode: 'lines',
        hoverinfo: 'name+x+y',
        name: "#"+i,
        line: {color: color(i)}
      });
      // cross section added up to the left
      traversals_cs_data.push({
        x: traversal.profile[0],
        y: traversal.profile[1],
        mode: 'lines',
        hoverinfo: 'name+x+y',
        name: "#"+i+" profile",
        line: {
          shape: 'linear',
          dash: 'dash',
          color:  color(i)
        }
      });
    });

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
      main3d_data.push(...critical_events_3d);
    }
    if (this.state.settings.show_traversals) {
      main_data.push(...traversals_data);
      main3d_data.push(...traversals3d_data);
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
      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 0
      },
      scene: {
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
          eye: {x: -0.5, y: -2, z: 0.5},
          up: {x: 0, y: 0, z: 1}
        }
      },
      width: width,
      height: (2/3)*width,
      showlegend: false
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
        <div className="bar settings">
          <label className="item setting show_l_lines">
            <input
              name="show_l_lines"
              type="checkbox"
              checked={this.state.settings.show_l_lines}
              onChange={this.toggleSetting} /> show l-lines
          </label>
          <label className="item setting show_contours">
            <input
              name="show_contours"
              type="checkbox"
              checked={this.state.settings.show_contours}
              onChange={this.toggleSetting} /> show contours
          </label>
          <label className="item setting show_critical_events">
            <input
              name="show_critical_events"
              type="checkbox"
              checked={this.state.settings.show_critical_events}
              onChange={this.toggleSetting} /> show critical events
          </label>
          <label className="item setting show_cell_borders">
            <input
              name="show_cell_borders"
              type="checkbox"
              checked={this.state.settings.show_cell_borders}
              onChange={this.toggleSetting} /> show cell borders
          </label>
          <label className="item setting show_traversals">
            <input
              name="show_traversals"
              type="checkbox"
              checked={this.state.settings.show_traversals}
              onChange={this.toggleSetting} /> show traversals
          </label>
        </div>

        <div className="bar freespace-setting">
          <label className="show_freespace" style={{flexGrow: 1}}>
            <input
              name="show_freespace"
              type="checkbox"
              checked={this.state.settings.show_freespace}
              onChange={this.toggleSetting} />
            show freespace: {this.state.freespace_epsilon}
          </label>
          <div className="slider" style={{flexGrow: 6, marginRight: 20}}>
            <Slider
              min={bounds_l[0]} max={bounds_l[1]}
              step={slider_step}
              marks={slider_marks}
              defaultValue={frechet_epsilon}
              included={true}
              disabled={!this.state.settings.show_freespace}
              onAfterChange={this.change_freespace_epsilon}
              />
          </div>
        </div>

        <div className="plots">
          <Plot
            className="plot main"
            data={ [...main_data] }
            layout={ main_layout }
          />
          <Plot
            className="plot main3d"
            data={ [...main3d_data] }
            layout={ main3d_layout }
          />
          <Plot
            className="plot traversal-cs"
            data={ [...traversals_cs_data] }
            layout={ traversals_cs_layout }
          />
        </div>
      </div>
    );
  }
}

export default Results;
