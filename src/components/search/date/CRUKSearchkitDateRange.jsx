import React from 'react';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';
import {
  QueryAccessor,
  SearchkitComponent,
  SearchkitComponentProps,
  ReactComponentType,
  renderComponent
} from 'searchkit';
import MobileDetect from 'mobile-detect';
import {
  CRUKSearchkitDateRangeAccessor
} from './CRUKSearchkitDateRangeAccessor';

const isUndefined = require('lodash/isUndefined');

class CRUKSearchkitDateRange extends SearchkitComponent {
  accessor:CRUKSearchkitDateRangeAccessor

  static propTypes = {
    startDate: React.PropTypes.object,
    endDate: React.PropTypes.object,
    numberOfMonths: React.PropTypes.number,
    initialVisibleMonth: React.PropTypes.func,
    onDatesChange: React.PropTypes.func,
    onFocusChange: React.PropTypes.func,
    focusedInput: React.PropTypes.bool,
    displayFormat: React.PropTypes.string,
    showClearDates: React.PropTypes.bool,
    field: React.PropTypes.string,
    id: React.PropTypes.string,
    ...SearchkitComponent.propTypes
  }

  constructor(props) {
    const startDate = (props.startDate) ? props.startDate : null
    const endDate = (props.endDate) ? props.endDate : null
    super(props)

    this.state = {
      focusedInput: null,
      startDate: startDate,
      endDate: endDate,
      initialVisibleMonth: () => moment()
    }

    this.noArgs = true

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.updateParentState = this.updateParentState.bind(this);
  }

  onDatesChange({ startDate, endDate }) {

    this.setState({ startDate: startDate, endDate: endDate }, () => {
      this.updateAccessorState(startDate, endDate);
    })

    this.noArgs = false
  }

  updateAccessorState(startDate, endDate) {
    if (startDate && endDate) {
      this.accessor.state = this.accessor.state.setValue({
        min: startDate.format("YYYY-MM-DD"),
        max: endDate.format("YYYY-MM-DD")
      })
      this.searchkit.performSearch()
    } else if (!startDate && !endDate) {
      this.accessor.state = this.accessor.state.clear()
      this.searchkit.performSearch()
    }

  }

  updateParentState(startDate, endDate) {
    this.setState({
      startDate: (startDate) ? moment(startDate) : startDate,
      endDate: (endDate) ? moment(endDate) : endDate,
    })
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput })
  }

  defineAccessor() {
    const { id, title, field, startDate, endDate,
      interval, showHistogram } = this.props
    const updateParentState = this.updateParentState
    return new CRUKSearchkitDateRangeAccessor(id,{
      id, startDate, endDate, title, field, interval, updateParentState
    })
  }

  render() {
    const argState = this.accessor.getQueryObject();
    let { focusedInput, startDate, endDate, initialVisibleMonth } = this.state;
    /**
     * These functions can return null so check for bool true.
     */
    const md = new MobileDetect(window.navigator.userAgent);
    const isMobile = md.mobile() || md.phone();
    const numberOfMonths = isMobile ? 1 : 2;

    if (this.noArgs && argState[this.props.id] !== undefined && Object.keys(argState[this.props.id]).length > 0) {
      if (typeof argState[this.props.id].min !== undefined) {
        startDate =  moment(argState[this.props.id].min)
        initialVisibleMonth = () => startDate
      }
      endDate = (typeof argState[this.props.id].max !== undefined) ? moment(argState[this.props.id].max) : null
    }

    return (
      <div className={focusedInput ? 'cr-daterange-wrapper cr-daterange-wrapper--focused' : 'cr-daterange-wrapper'}>
        <DateRangePicker
          {...this.props}
          onDatesChange={this.onDatesChange}
          onFocusChange={this.onFocusChange}
          focusedInput={focusedInput}
          startDate={startDate}
          endDate={endDate}
          initialVisibleMonth={initialVisibleMonth}
          displayFormat="DD/MM/YYYY"
          numberOfMonths={numberOfMonths}
        />
      </div>
    )
  }
}

CRUKSearchkitDateRange.defaultProps = {
  isOutsideRange: () => false
}

export default CRUKSearchkitDateRange;
