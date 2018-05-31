import React, { Component } from 'react';
import './ResultHeatmap.css';
import Plot from 'react-plotly.js';

class ResultHeatmap extends Component {
  constructor(props){
    super(props);
    this.createChart = this.createChart.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.calculateRanges = this.calculateRanges.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }
  componentDidUpdate() {
    this.updateChart();
  }

  createChart() {
    var data = this.props.data;
    var sizequotient_width = data.length.p / data.length.q;
    var sizequotient_height = data.length.q / data.length.p;

    // settings
    var max_width = this.props.maxsize.width;
    var max_height = this.props.maxsize.height;
    var outerWidth = Math.min(max_width, sizequotient_width*max_width);
    var outerHeight = Math.min(max_height, sizequotient_height*max_height);
    const margin = { left: 5, top: 5, right: 5, bottom: 5 };
    var innerWidth  = outerWidth - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top  - margin.bottom;

    console.log("innerWidth: ", innerWidth);
    console.log("innerHeight: ", innerHeight);

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

  }

  calculateRanges() {
    const newXRange = {
      min: 0,
      max: this.props.data.length.p
    };
    const newYRange = {
      min: 0,
      max: this.props.data.length.q
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

    // helper
    const xScale = this.state.xScale;
    const yScale = this.state.yScale;



    // d3 render START
    //Bind data
    const svg = d3.select(this.svg);
    var g = svg.select("g");

    //Enter

    //Update

    //Exit

    // d3 render END
  }

  render() {
    return (
      <svg ref={svg => this.svg = svg}
        width={this.props.maxsize.width} height={this.props.maxsize.height}>
      </svg>
    );
  }
}

export default ResultHeatmap;
