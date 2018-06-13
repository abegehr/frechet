import React, { Component } from 'react';
import './InputList.css';

import ReactList from 'react-list';
import NumericInput from 'react-numeric-input';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faMinus from '@fortawesome/fontawesome-free-solid/faMinus'


class InputList extends Component {

  renderPoint(index, key) {
    const step = 0.5;
    const percision = 2;
    const point = this.props.points[index];

    return (
      <div key={key}>
        {index}: (
        <NumericInput step={step} precision={percision} value={point.x} snap onChange={this.onValueChange(index, key, "x")}/> |
        <NumericInput step={step} precision={percision} value={point.y} snap onChange={this.onValueChange(index, key, "y")}/>
        )
        <FontAwesomeIcon icon={faMinus} onClick={this.onRemoveClick(index, key)} />
      </div>
    );
  }

  onValueChange(index, key, coord) {
    return (valueAsNumber, valueAsString, input) => {
      var newPoints = this.props.points;
      newPoints[index][coord] = valueAsNumber;
      this.props.pointsChanged(newPoints);
    };
  }

  onRemoveClick(index, key) {
    return () => {
      var newPoints = this.props.points;
      if (newPoints.length > 2) {
        newPoints.splice(index, 1);
        this.props.pointsChanged(newPoints);
      }
    };
  }

  onSelect() {
    this.props.select();
  }

  addPoint() {
    var newPoint = {x: 0, y: 0};

    var newPoints = this.props.points;
    newPoints.push(newPoint);

    this.props.pointsChanged(newPoints);
  }

  render() {
    var classes = "inputlist";
    classes += " "+this.props.id;
    if (this.props.selected) {
      classes += " selected";
    }

    return (
      <div className={classes}>
        <p onClick={this.onSelect.bind(this)}>{this.props.label}</p>
        <div style={{overflow: 'auto', maxHeight: this.props.maxHeight}}>
          <ReactList
            itemRenderer={this.renderPoint.bind(this)}
            length={this.props.points.length}
            type='uniform'
            />
          <button onClick={this.addPoint.bind(this)}>
            add point
          </button>
        </div>
      </div>
    );
  }
}

export default InputList;
