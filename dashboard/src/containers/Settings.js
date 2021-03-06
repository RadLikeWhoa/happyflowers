import React from 'react'
import IPropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import { Link } from 'react-router'
import Header from '../containers/Header'
import Widget from '../components/Widget'
import { fetchSettings, submitSettings } from '../actions'

/**
 * Class representing the settings screen of the application.
 *
 * @extends React.Component
 */
class Settings extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    jwt: React.PropTypes.string,
    settings: IPropTypes.map.isRequired,
    isFetching: React.PropTypes.bool,
    isSubmitting: React.PropTypes.bool,
    socket: React.PropTypes.object
  }

  constructor(props) {
    super(props)

    // The state contains values and validity for all settings fields. They all
    // consist of an immutable Map.

    this.state = {
      pristine: true,
      name: Map({
        value: '',
        valid: false
      }),
      upper: Map({
        value: 0,
        valid: false
      }),
      lower: Map({
        value: 0,
        valid: false
      }),
      interval: Map({
        value: 0,
        valid: false
      })
    }

    this.submitForm = this.submitForm.bind(this)
    this.handleTextChange = this.handleTextChange.bind(this)
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchSettings())
  }

  componentWillReceiveProps({ settings, isSubmitting, isErroneous }) {

    // Don't change the state if there are no settings to display.

    if (settings.isEmpty() || isSubmitting || isErroneous) {
      return
    }

    // The new state is built based on the settings Map, passed through the
    // props. All values are considered to be valid and the form is considered
    // pristine.

    this.setState({
      pristine: true,
      name: Map({
        value: settings.get('name'),
        valid: true
      }),
      upper: Map({
        value: settings.get('upper'),
        valid: true
      }),
      lower: Map({
        value: settings.get('lower'),
        valid: true
      }),
      interval: Map({
        value: settings.get('interval'),
        valid: true
      })
    })
  }

  /**
   * Attempt to save the edited settings.
   *
   * @param {object} event - Submit event from the settings form. Used to
   *                         prevent the default behaviour in favour of AJAX
   *                         functionality.
   */
  submitForm(event) {
    event.preventDefault()

    // Exit early if the form is still pristine or any of the required fields
    // are invalid.

    if (this.state.pristine || !this.state.name.get('valid') || !this.state.upper.get('valid') || !this.state.lower.get('valid') || !this.state.interval.get('valid')) {
      return
    }

    // Create a FormData object used to submit all required data along with the
    // request.

    const data = {
      name: this.state.name.get('value'),
      upper: this.state.upper.get('value'),
      lower: this.state.lower.get('value'),
      interval: this.state.interval.get('value'),
      token: this.props.jwt
    }

    // Inform the user about the response, showing confirmation or error if the
    // request was successful or erroneous, respectively.

    this.props.dispatch(submitSettings(data, this.props.socket))
  }

  /**
   * Handle change in the value of any input fields.
   *
   * @param {string} key - The key of the field for which the state should be
   *                       updated.
   * @param {string} value - The new value that is to be stored for the field.
   * @param {boolean} valid - A boolean that determines whether the value of the
   *                          field is valid. It is up to the caller to
   *                          determine the logic behind the validation.
   */
  handleTextChange(key, value, valid) {
    this.setState({
      pristine: false,
      [key]: Map({ value, valid })
    })
  }

  render() {
    const { name, upper, lower, interval } = this.state

    return (
      <main className="site">
        <Header />
        <div className="wrap">
          <Widget title="Settings"
                  isLoading={this.props.isFetching}>
            <form className="settings">
              <div data-grid>
                <div data-col="L1-4">
                  <label htmlFor="name"
                         className="spaced">
                    Name
                  </label>
                </div>
                <div data-col="L3-4">
                  <input id="name"
                         type="text"
                         className={`text-input full-width spaced ${!name.get('valid') ? 'is-invalid' : ''}`}
                         value={name.get('value')}
                         onChange={ev => this.handleTextChange('name', ev.target.value, ev.target.value.length > 0)} />
                </div>
                <hr className="separator" />
                <div data-col="L1-4">
                  <label htmlFor="upper"
                         className="spaced">
                    Upper limit
                  </label>
                </div>
                <div data-col="L3-4">
                  <input id="upper"
                         type="number"
                         className={`text-input full-width spaced ${!upper.get('valid') ? 'is-invalid' : ''}`}
                         value={upper.get('value')}
                         min="0"
                         max="100"
                         onChange={ev => this.handleTextChange('upper', +ev.target.value, +ev.target.value % 1 === 0 && +ev.target.value > 0 && +ev.target.value <= 100 && +ev.target.value > lower.get('value'))} />
                  <p>
                    The upper limit determines at which percentage of soil moisture watering should be disabled. Manual watering automatically stops at this level if it is not manually stopped. A number between 0 and 100 is expected. Make sure the number is greater than the lower level.
                  </p>
                </div>
                <div data-col="L1-4">
                  <label htmlFor="lower"
                         className="spaced">
                    Lower limit
                  </label>
                </div>
                <div data-col="L3-4">
                  <input id="lower"
                         type="number"
                         className={`text-input full-width spaced ${!lower.get('valid') ? 'is-invalid' : ''}`}
                         value={lower.get('value')}
                         min="0"
                         max="100"
                         onChange={ev => this.handleTextChange('lower', +ev.target.value, +ev.target.value % 1 === 0 && +ev.target.value >= 0 && +ev.target.value < 100 && +ev.target.value < upper.get('value'))} />
                  <p>
                    The lower limit determines over which percentage of soil moisture the plant should always be kept. Automatic watering will always attempt to keep the moisture above this level. A number between 0 and 100 is expected. Make sure the number is smaller than the upper level.
                  </p>
                </div>
                <hr className="separator" />
                <div data-col="L1-4">
                  <label htmlFor="interval"
                         className="spaced">
                    Measurement Interval
                  </label>
                </div>
                <div data-col="L3-4">
                  <input id="interval"
                         type="number"
                         className={`text-input full-width spaced ${!interval.get('valid') ? 'is-invalid' : ''}`}
                         value={interval.get('value')}
                         min="0"
                         onChange={ev => this.handleTextChange('interval', +ev.target.value, +ev.target.value % 1 === 0 && +ev.target.value > 0)} />
                  <p>
                    The measurement interval determines the regularity at which the soil moisture percentage is measured. An interval of 60 minutes or more is recommended to ensure optimal performance. A number greater than 0 is expected.
                  </p>
                </div>
              </div>
              <div data-grid>
                <div data-col="1-2">
                  <Link to="/dashboard"
                        data-button="secondary block" >
                    {this.state.pristine ? 'Go back' : 'Cancel'}
                  </Link>
                </div>
                <div data-col="1-2">
                  <input type="submit"
                         data-button="block"
                         disabled={!name.get('valid') || !upper.get('valid') || !lower.get('valid') || !interval.get('valid') || this.state.pristine || this.props.isSubmitting}
                         value={this.props.isSubmitting ? 'Saving…' : 'Save'}
                         onClick={this.submitForm} />
                </div>
              </div>
            </form>
          </Widget>
        </div>
      </main>
    )
  }
}

const mapStateToProps = state => ({
  jwt: state.auth.jwt,
  settings: state.settings.data,
  isFetching: state.settings.isFetching,
  isSubmitting: state.settings.isSubmitting,
  isErroneous: state.settings.isErroneous
})

export default connect(mapStateToProps)(Settings)
