import React from 'react'
import { connect } from 'react-redux'
import TimeAgo from 'timeago-react'
import Widget from '../components/Widget'
import { triggerPump } from '../actions'
import './Stats.css'

/**
 * Functional component representing the stats widget, i.e. the widget
 * containing information about the latest event dates and the option to trigger
 * the pump manually. Event dates are shown relatively if they're available,
 * otherwise a default message is shown.
 *
 * @param {object} props - Standard React props, destructured to only get the
 *                         isLoggedIn, name, timestamps, isFetching props.
 *
 * @return {string} - HTML markup for the component.
 */
const Stats = ({ dispatch, isLoggedIn, name, timestamps, isFetching, pumpState }) => (
  <Widget title={name || 'Your Flower'} isLoading={isFetching}>
    <ul className="stats-list unstyled-list">
      <li>
        <span data-icon="loupe" />
        <h3 className="stats-heading">
          Last measurement
        </h3>
        {(timestamps.measurement && <TimeAgo datetime={timestamps.measurement.get('measurementTimestamp')} />) || 'a while ago'}
      </li>
      <li>
        <span data-icon="drop" />
        <h3 className="stats-heading">
          Last automatic watering
        </h3>
        <span className="circle circle-automatic"></span>{(timestamps.automatic && <TimeAgo datetime={timestamps.automatic.get('eventTimestamp')} />) || 'a while ago'}
      </li>
      <li>
      <span data-icon="hand" />
        <h3 className="stats-heading">
          Last manual watering
        </h3>
        <span className="circle circle-manual"></span>{(timestamps.manual && <TimeAgo datetime={timestamps.manual.get('eventTimestamp')} />) || 'a while ago'}
      </li>
    </ul>
    <button data-button="block secondary" disabled={!isLoggedIn || pumpState !== 0} onClick={() => dispatch(triggerPump())}>
      {pumpState === 0 ? 'Start pump manually' : pumpState === 1 ? `Checking ${name || 'your flower'}…` : pumpState === 2 ? 'Watering…' : 'Seeping in…'}
    </button>
  </Widget>
)

Stats.propTypes = {
  dispatch: React.PropTypes.function,
  isLoggedIn: React.PropTypes.bool,
  pumpState: React.PropTypes.number,
  name: React.PropTypes.string,
  timestamps: React.PropTypes.shape({
    measurement: React.PropTypes.object,
    automatic: React.PropTypes.object,
    manual: React.PropTypes.object
  }),
  isFetching: React.PropTypes.bool
}

/**
 * Map Redux state to React props for the Login component.
 *
 * @param {object} state - The Redux state, injected by the <code>connect</code>
 *                         function.
 */
const mapStateToProps = state => ({
  isLoggedIn: !!state.auth.jwt,
  pumpState: state.pump.pumpState,
  name: state.settings.data.get('name'),
  timestamps: {
    measurement: state.history.measurements.last(),
    automatic: state.history.events.filter(e => e.get('eventType') === 'automatic').last(),
    manual: state.history.events.filter(e => e.get('eventType') === 'manual').last()
  },
  isFetching: state.settings.isFetching || state.history.isFetching
})

export default connect(mapStateToProps)(Stats)
