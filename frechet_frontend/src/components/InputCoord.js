import React, { Component } from 'react';
import './InputCoord.css';
import * as d3 from 'd3';


function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function rotate_point(points, d, i) {
  if (points.length <= 1) {
    return "";
  }

  let prev;
  if (i > 0) {
    prev = points[i-1];
  } else {
    prev = d;
    d = points[1];
  }
  const dx = d.x - prev.x;
  const dy = d.y - prev.y;

  const rad = Math.atan2(dy,dx);
  const deg = -rad * 180 / Math.PI;
  return "rotate(" + deg + ")";
}

class InputCoord extends Component {
  constructor(props){
    super(props);
    this.createChart = this.createChart.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.updateAxis = this.updateAxis.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }
  componentDidUpdate() {
    this.updateChart();
  }

  createChart() {

    // settings
    var outerWidth = this.props.size.width;
    var outerHeight = this.props.size.height;
    const margin = { left: 5, top: 5, right: 5, bottom: 5 };
    var innerWidth  = outerWidth  - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top  - margin.bottom;
    this.setState({innerWidth: innerWidth, innerHeight: innerHeight});

    // Range
    const ranges = this.props.inputRange;
    const xRange = ranges[0];
    const yRange = ranges[1];
    // Scale
    var xScale = d3.scaleLinear()
      .domain([xRange.min, xRange.max])
      .range([0, innerWidth]);
    var yScale = d3.scaleLinear()
      .domain([yRange.min, yRange.max])
      .range([innerHeight, 0]);
    this.setState({xScale: xScale, yScale: yScale});

    // svg
    const svg = d3.select(this.svg);
    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Axis
    var xAxisG = g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + innerHeight + ")");
    var yAxisG = g.append("g")
      .attr("class", "y axis");
    var xGridG = g.append("g")
      .attr("class", "x grid")
      .attr("transform", "translate(0," + innerHeight + ")");
    var yGridG = g.append("g")
      .attr("class", "y grid");

    var xAxis = d3.axisTop(xScale);
    var yAxis = d3.axisRight(yScale);
    var xGrid = d3.axisTop(xScale).tickFormat("").tickSize(innerHeight);
    var yGrid = d3.axisRight(yScale).tickFormat("").tickSize(innerWidth);

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);
    xGridG.call(xGrid);
    yGridG.call(yGrid);

    // Paths
    g.append("path")
      .attr("class", "path p")
      .style('stroke', this.props.pathsColor.p);
    g.append("path")
      .attr("class", "path q")
      .style('stroke', this.props.pathsColor.q);

    // add points on click
    svg.on("click", () => {
        var coords = d3.mouse(d3.event.target);
        var newPoint = {
          x: precisionRound(xScale.invert(coords[0]), 2),
          y: precisionRound(yScale.invert(coords[1]), 2)
        };

        var newData = this.props.data;
        if (newData[this.props.selectedPath]) {
          newData[this.props.selectedPath].push(newPoint);
        }
        this.props.dataChanged(newData);
      });
  }

  updateAxis() {

    // scales
    const xScale = this.state.xScale;
    const yScale = this.state.yScale;

    const newRanges = this.props.inputRange;
    const newXRange = newRanges[0];
    const newYRange = newRanges[1];

    //xAxis
    const xDomain = xScale.domain();
    if (newXRange.min !== xDomain[0] || newXRange.max !== xDomain[1]) {
      xScale.domain([newXRange.min, newXRange.max]);
    }
    //yAxis
    const yDomain = yScale.domain();
    if (newYRange.min !== yDomain[0] || newYRange.max !== yDomain[1]) {
      yScale.domain([newYRange.min, newYRange.max]);
    }

    //bind data
    const svg = d3.select(this.svg);
    const g = svg.select("g");

    // Axis
    const xAxisG = g.select(".x.axis");
    const yAxisG = g.select(".y.axis");
    const xGridG = g.select(".x.grid");
    const yGridG = g.select(".y.grid");

    const xAxis = d3.axisTop(xScale);
    const yAxis = d3.axisRight(yScale);
    const xGrid = d3.axisTop(xScale).tickFormat("").tickSize(this.state.innerHeight);
    const yGrid = d3.axisRight(yScale).tickFormat("").tickSize(this.state.innerWidth);

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);
    xGridG.call(xGrid);
    yGridG.call(yGrid);
  }

  updateChart() {
    // data
    const coords_p = this.props.data.p;
    const coords_q = this.props.data.q;

    // axis
    this.updateAxis();

    // helper
    const xScale = this.state.xScale;
    const yScale = this.state.yScale;
    const line = d3.line()
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); });



    // d3 render START
    //Bind data
    const svg = d3.select(this.svg);
    const g = svg.select("g");
    const points_p = g.selectAll(".point.p").data(coords_p, function(d, i){ return i; });
    const points_q = g.selectAll(".point.q").data(coords_q, function(d, i){ return i; });
    const path_p = g.select(".path.p");
    const path_q = g.select(".path.q");

    path_p.attr("d", line(coords_p));
    path_q.attr("d", line(coords_q));

    //Enter
    const points_p_enter = points_p.enter().append("path")
      .attr("class", "point p")
      .attr("d", "M-10 -10 L0 0 L-10 10")
      .style('stroke', this.props.pathsColor.p);
    const points_q_enter = points_q.enter().append("path")
      .attr("class", "point q")
      .attr("d", "M-10 -10 L0 0 L-10 10")
      .style('stroke', this.props.pathsColor.q);

    //Update
    const rotate_p = (d, i) => { return rotate_point(coords_p, d, i); };
    const rotate_q = (d, i) => { return rotate_point(coords_q, d, i); };
    points_p.merge(points_p_enter)
      .attr("transform", function(d, i) {
        let translate = "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"
        translate += " " + rotate_p(d, i)
        return translate
      });
    points_q.merge(points_q_enter)
      .attr("transform", function(d, i) {
        let translate = "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"
        translate += " " + rotate_q(d, i)
        return translate
      });

    //Exit
    points_p.exit().remove();
    points_q.exit().remove();
    // d3 render END
  }

  render() {
    return (
      <svg ref={svg => this.svg = svg}
        width={this.props.size.width} height={this.props.size.height}>
      </svg>
    );
  }
}

export default InputCoord;
