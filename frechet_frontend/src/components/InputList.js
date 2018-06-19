import React, { Component } from 'react';
import './InputList.css';

import ReactList from 'react-list';
import NumericInput from 'react-numeric-input';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faMinus from '@fortawesome/fontawesome-free-solid/faMinus'
import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'

class InputList extends Component {

  randomPoint() {
    const [xRange, yRange] = this.props.inputRange;

    const x = xRange.min + Math.random()*(xRange.max - xRange.min);
    const y = yRange.min + Math.random()*(yRange.max - yRange.min);

    return {x: x, y: y};
  }

  renderPoint(index, key) {
    const step = 0.5;
    const percision = 2;
    const point = this.props.points[index];

    return (
      <div key={key}>
        {index}: (
        <NumericInput step={step} precision={percision} value={point.x} snap
          onChange={this.onValueChange(index, "x")}/> |
        <NumericInput step={step} precision={percision} value={point.y} snap
          onChange={this.onValueChange(index, "y")}/>
        )
        <FontAwesomeIcon icon={faMinus} onClick={this.onRemoveClick(index)} />
        <FontAwesomeIcon icon={faPlus} onClick={this.onAddClick(index)} />
      </div>
    );
  }

  onValueChange(index, coord) {
    return (valueAsNumber, valueAsString, input) => {
      var newPoints = this.props.points;
      newPoints[index][coord] = valueAsNumber;
      this.props.pointsChanged(newPoints);
    };
  }

  onRemoveClick(index) {
    return () => {
      var newPoints = this.props.points;
      if (newPoints.length > 2) {
        newPoints.splice(index, 1);
        this.props.pointsChanged(newPoints);
      }
    };
  }

  onAddClick(index) {
    return () => {
      const newPoint = this.randomPoint();

      let newPoints = this.props.points;
      newPoints.splice(index, 0, newPoint);

      this.props.pointsChanged(newPoints);
    };
  }

  onSelect() {
    this.props.select();
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
        </div>
      </div>
    );
  }
}

export default InputList;
