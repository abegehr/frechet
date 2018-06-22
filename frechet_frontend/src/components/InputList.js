import React, { Component } from 'react';
import './InputList.css';

import ReactList from 'react-list';
import NumericInput from 'react-numeric-input';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import removeIcon from '@fortawesome/fontawesome-free-solid/faMinusSquare'
import addIcon from '@fortawesome/fontawesome-free-solid/faPlusSquare'

console.log("NumericInput.style: ", NumericInput.style);
//NumericInput.style.wrap.minWidth = 6+"em";
//NumericInput.style.wrap.maxWidth = 18+"em";
NumericInput.style.input.width = 8+"em";

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
      <div className="inputPoint" key={key}>
        <span style={{textTransform: "uppercase"}}>{this.props.id}</span>
        <sub>{index}</sub>(
        <NumericInput step={step} precision={percision} value={point.x} snap
          onChange={this.onValueChange(index, "x")}/>
        <NumericInput step={step} precision={percision} value={point.y} snap
          onChange={this.onValueChange(index, "y")}/>
        )
        <i className="iconButton add" onClick={this.onRemoveClick(index)}>
          <FontAwesomeIcon icon={removeIcon} />
        </i>
        <i className="iconButton remove" onClick={this.onAddClick(index)}>
          <FontAwesomeIcon icon={addIcon} />
        </i>
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
      newPoints.splice(index+1, 0, newPoint);

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
      <div className={classes} onClick={this.onSelect.bind(this)}
        style={{backgroundColor: this.props.style.backgroundColor}}>
        <p>{this.props.label}</p>
        <div style={{overflow: 'auto'}}>
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
