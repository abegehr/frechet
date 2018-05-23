import React, { Component } from 'react';
import './InputCoord.css';
import * as d3 from 'd3';


function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function rotate_point(points, d, i) {
  var prev;
  if (i > 0) {
    prev = points[i-1];
  } else {
    prev = d;
    d = points[1];
  }
  prev = i>0? points[i-1] : points[1];
  var dx = d.x - prev.x;
  var dy = d.y - prev.y;

  var rad = Math.atan2(dy,dx);
  var deg = -rad * 180 / Math.PI;
  return "rotate(" + deg + ")";
}

class InputCoord extends Component {
  constructor(props){
    super(props);
    this.createChart = this.createChart.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.updateAxis = this.updateAxis.bind(this);
    this.calculateRanges = this.calculateRanges.bind(this);
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
    const ranges = this.calculateRanges();
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
      .attr("class", "path p");
    g.append("path")
      .attr("class", "path q");

    // add points on click
    svg.on("click", () => {
        var coords = d3.mouse(d3.event.target);
        var newPoint = {
          x: precisionRound(xScale.invert(coords[0]), 2),
          y: precisionRound(yScale.invert(coords[1]), 2)
        };
        console.log("clicked: "+ JSON.stringify(newPoint));

        var newData = this.props.data;
        newData.p.push(newPoint); //TODO: update selected path

        this.props.dataChanged(newData);
      });
  }

  calculateRanges() {
    // data
    const coords_p = this.props.data.p;
    const coords_q = this.props.data.q;

    var xMin = d3.min([d3.min(coords_p, function(d) { return d.x }),
      d3.min(coords_q, function(d) { return d.x })]);
    var xMax = d3.max([d3.max(coords_p, function(d) { return d.x }),
      d3.max(coords_q, function(d) { return d.x })]);
    var yMin = d3.min([d3.min(coords_p, function(d) { return d.y }),
      d3.min(coords_q, function(d) { return d.y })]);
    var yMax = d3.max([d3.max(coords_p, function(d) { return d.y }),
      d3.max(coords_q, function(d) { return d.y })]);

    var dx = Math.abs(xMax-xMin);
    var dy = Math.abs(yMax-yMin);
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
    const newXRange = {
      min: d3.min([0, xMin-dx*padding]),
      max: d3.max([10, xMax+dx*padding])
    };
    const newYRange = {
      min: d3.min([0, yMin-dy*padding]),
      max: d3.max([10, yMax+dy*padding])
    };
    return [newXRange, newYRange];
  }

  updateAxis() {

    // scales
    var xScale = this.state.xScale;
    var yScale = this.state.yScale;

    const newRanges = this.calculateRanges();
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
    var g = svg.select("g");

    // Axis
    var xAxisG = g.select(".x.axis");
    var yAxisG = g.select(".y.axis");
    var xGridG = g.select(".x.grid");
    var yGridG = g.select(".y.grid");

    var xAxis = d3.axisTop(xScale);
    var yAxis = d3.axisRight(yScale);
    var xGrid = d3.axisTop(xScale).tickFormat("").tickSize(this.state.innerHeight);
    var yGrid = d3.axisRight(yScale).tickFormat("").tickSize(this.state.innerWidth);

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
    var line = d3.line()
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); });



    // d3 render START
    //Bind data
    const svg = d3.select(this.svg);
    var g = svg.select("g");
    var points_p = g.selectAll(".point.p").data(coords_p, function(d, i){ return i; });
    var points_q = g.selectAll(".point.q").data(coords_q, function(d, i){ return i; });
    var path_p = g.select(".path.p");
    var path_q = g.select(".path.q");

    path_p.attr("d", line(coords_p));
    path_q.attr("d", line(coords_q));

    //Enter
    var points_p_enter = points_p.enter().append("path")
      .attr("class", "point p")
      .attr("d", "M-20 -20 L0 0 L-20 20");
    var points_q_enter = points_q.enter().append("path")
      .attr("class", "point q")
      .attr("d", "M-20 -20 L0 0 L-20 20");

    //Update
    var rotate_p = (d, i) => { return rotate_point(coords_p, d, i); };
    var rotate_q = (d, i) => { return rotate_point(coords_q, d, i); };
    points_p.merge(points_p_enter)
      .attr("transform", function(d, i) {
        var translate = "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"
        translate += " " + rotate_p(d, i)
        return translate
      });
    points_q.merge(points_q_enter)
      .attr("transform", function(d, i) {
        var translate = "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"
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
