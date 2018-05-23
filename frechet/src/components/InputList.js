import React, { Component } from 'react';
import './InputList.css';

import ReactList from 'react-list';
import NumericInput from 'react-numeric-input';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faMinus from '@fortawesome/fontawesome-free-solid/faMinus'


class InputList extends Component {
  constructor(props){
    super(props);
    console.log("props: ", this.props);
  }

  renderP(index, key) {
    return this.renderPoint(index, key, this.props.data.p[index], "p")
  }

  renderQ(index, key) {
    return this.renderPoint(index, key, this.props.data.q[index], "q")
  }

  renderPoint(index, key, point, path) {
    return (
      <div key={key}>
        {index}: (
        <NumericInput step={0.5} precision={2} value={point.x} snap onChange={this.onValueChange(index, key, path, "x")}/> |
        <NumericInput step={0.5} precision={2} value={point.y} snap onChange={this.onValueChange(index, key, path, "y")}/>
        )
        <FontAwesomeIcon icon={faMinus} onClick={this.onRemoveClick(index, key, path)} />
      </div>
    );
  }

  onValueChange(index, key, path, coord) {
    return (valueAsNumber, valueAsString, input) => {
      var newData = this.props.data;
      newData[path][index][coord] = valueAsNumber;
      this.props.dataChanged(newData);
    };
  }

  onRemoveClick(index, key, path) {
    return () => {
      var newData = this.props.data;
      if (newData[path].length > 2) {
        newData[path].splice(index, 1);
        this.props.dataChanged(newData);
      }
    };
  }

  render() {
  console.log("props: ", this.props);
    return (
      <div>
        <p>Path P</p>
        <div style={{overflow: 'auto', maxHeight: 400}}>
          <ReactList
            itemRenderer={this.renderP.bind(this)}
            length={this.props.data.p.length}
            type='uniform'
            />
        </div>
        <p>Path Q</p>
        <div style={{overflow: 'auto', maxHeight: 400}}>
          <ReactList
            itemRenderer={this.renderQ.bind(this)}
            length={this.props.data.q.length}
            type='uniform'
          />
        </div>
      </div>
    );
  }
}

export default InputList;
