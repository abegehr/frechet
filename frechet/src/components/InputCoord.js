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
    prev = d
    d = points[1]
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
    super(props)
    this.createChart = this.createChart.bind(this)
  }
  //TODO create and update chart on correct react function calls
  // how to disable react dom on svg, where d3 dom is enabled?
  componentDidMount() {
    this.createChart()
  }
  componentDidUpdate() {
    this.createChart()
  }

  createChart() {
    const coords_p = this.props.data.p;
    const coords_q = this.props.data.q;

    var outerWidth = this.props.size.width;
    var outerHeight = this.props.size.height;
    const margin = { left: 5, top: 5, right: 5, bottom: 5 };
    var innerWidth  = outerWidth  - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top  - margin.bottom;

    const xRange = {
      min: d3.min([0, d3.min(coords_p, function(d) { return d.x }), d3.min(coords_q, function(d) { return d.x })]),
      max: d3.max([10, d3.max(coords_p, function(d) { return d.x }), d3.max(coords_q, function(d) { return d.x })])
    };
    const yRange = {
      min: d3.min([0, d3.min(coords_p, function(d) { return d.y }), d3.min(coords_q, function(d) { return d.y })]),
      max: d3.max([10, d3.max(coords_p, function(d) { return d.y }), d3.min(coords_q, function(d) { return d.y })])
    };

    console.log("xRange: " + JSON.stringify(xRange));
    console.log("yRange: " + JSON.stringify(yRange));

    const xColumn = "x";
    const yColumn = "y";

    const svg = d3.select(this.svg);

    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

    var path_p = g.append("path")
      .attr("class", "path p");
    var path_q = g.append("path")
      .attr("class", "path q");

    var xScale = d3.scaleLinear()
      .domain([xRange.min, xRange.max])
      .range([0, innerWidth]);
    var yScale = d3.scaleLinear()
      .domain([yRange.min, yRange.max])
      .range([innerHeight, 0]);

    var xAxis = d3.axisTop(xScale);
    var yAxis = d3.axisRight(yScale);
    var xGrid = d3.axisTop(xScale).tickFormat("").tickSize(innerHeight);
    var yGrid = d3.axisRight(yScale).tickFormat("").tickSize(innerWidth);

    svg.on("click", () => {
        var coords = d3.mouse(d3.event.target);
        var newPoint = {
          x: precisionRound(xScale.invert(coords[0]), 2),
          y: precisionRound(yScale.invert(coords[1]), 2)
        };
        console.log("clicked: "+ JSON.stringify(newPoint));
        this.props.data.p.push(newPoint);

        this.createChart();
      });

    var line = d3.line()
      .x(function(d) { return xScale(d[xColumn]); })
      .y(function(d) { return yScale(d[yColumn]); });

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);
    xGridG.call(xGrid);
    yGridG.call(yGrid);

    // d3 render START
    //Bind data
    var points_p = g.selectAll(".point.p").data(coords_p);
    var points_q = g.selectAll(".point.q").data(coords_q);

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
