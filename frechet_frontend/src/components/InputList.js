import React, { Component } from 'react';
import './InputList.css';

import NumericInput from 'react-numeric-input';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import removeIcon from '@fortawesome/fontawesome-free-solid/faMinusSquare'
import addIcon from '@fortawesome/fontawesome-free-solid/faPlusSquare'

//NumericInput.style.wrap.minWidth = 6+"em";
//NumericInput.style.wrap.maxWidth = 18+"em";
NumericInput.style.input.width = 8+"em";

class InputList extends Component {

  randomPoint = () => {
    const [xRange, yRange] = this.props.inputRange;

    const x = xRange.min + Math.random()*(xRange.max - xRange.min);
    const y = yRange.min + Math.random()*(yRange.max - yRange.min);

    return {x: x, y: y};
  }

  renderPoints = () => {
    const step = 0.5;
    const percision = 2;

    return this.props.points.map((point, index) => {
      return (
        <div key={index}>
          <div className="inputPoint">
            <span style={{textTransform: "uppercase"}}>
              {this.props.id}<sub>{index}</sub> </span>
            (
            <NumericInput step={step} precision={percision} value={point.x} snap
              onChange={this.onValueChange(index, "x")}/>
            <NumericInput step={step} precision={percision} value={point.y} snap
              onChange={this.onValueChange(index, "y")}/>
            )
            <span> </span>
            <i className="iconButton add" onClick={this.onRemoveClick(index)}>
              <FontAwesomeIcon icon={removeIcon} />
            </i>
            <span> </span>
            <i className="iconButton remove" onClick={this.onAddClick(index)}>
              <FontAwesomeIcon icon={addIcon} />
            </i>
          </div>
        </div>
      );
    });
  }

  onValueChange = (index, coord) => {
    return (valueAsNumber, valueAsString, input) => {
      var newPoints = this.props.points;
      newPoints[index][coord] = valueAsNumber;
      this.props.pointsChanged(newPoints);
    };
  }

  onRemoveClick = (index) => {
    return () => {
      var newPoints = this.props.points;
      if (newPoints.length > 2) {
        newPoints.splice(index, 1);
        this.props.pointsChanged(newPoints);
      }
    };
  }

  onAddClick = (index) => {
    return () => {
      const newPoint = this.randomPoint();

      let newPoints = this.props.points;
      newPoints.splice(index+1, 0, newPoint);

      this.props.pointsChanged(newPoints);
    };
  }

  onSelect = () => {
    this.props.select();
  }

  render() {
    let classes = "container";
    classes += " "+this.props.id;
    if (this.props.selected) {
      classes += " selected";
    }

    return (
      <div className={classes} onClick={this.onSelect}
        style={this.props.style}>
        <div className="label">{this.props.label}</div>
        <div className="scroll-hull">
          <div className="scroll">
            {this.renderPoints()}
          </div>
        </div>
      </div>
    );
  }
}

export default InputList;
