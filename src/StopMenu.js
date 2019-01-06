import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CSList, CSValidatorChanger } from 'chillisalmon';

import APIQuery from './APIQuery.js';

import '../style/StopMenu.css';

class StopMenu extends Component {
	constructor(props) {
		super(props);;
		this.state = {
			data: {
				loading: 'Waiting for StopMenu data from HSL API.'
			}
		};
	}

	sendQuery() {
		APIQuery.getNearestStops(this.props.lat, this.props.lon, this.props.maxDistance)
			.then((responseJson) => {
				this.setState({
					data: responseJson
				});
			})
			.catch((error) => {
				this.setState({data: {error: error.toString()}});
			});
	}

	componentDidMount() {
		this.sendQuery();
	}
	
	getStopsArray() {
		if (this.state.data.nearest === undefined) return [];
		
		var stops = this.state.data.nearest.edges
			.map(i => i.node.place)
			.reduce((r, i) => {
				var stop = r.find(j => j.name === i.name);
				if (stop === undefined) {
					r.push({name: i.name, codes: [i.code]});
				} else {
					stop.codes.push(i.code)
				}
				return r;
			}, [])
		return stops;
	}

	render() {
		var stopsArray = this.getStopsArray();

		return (
			<CSValidatorChanger error={this.state.data.error} loading={this.state.data.loading}>
				<ul className='StopMenu'>
					{stopsArray.map((stop, i) => (
						<li className='StopName' key={stop.name}>
							{stop.name}
							<ul>
								{stop.codes.map(code => <li  className='StopCode' key={code}>{code}</li>)}
							</ul>
						</li>
					))}
				</ul>
			</CSValidatorChanger>
		);
	}
}

StopMenu.defaultProps = {
	lat: 0,
	lon: 0,
	maxDistance: 1000,
};

StopMenu.propTypes = {
	lat: PropTypes.number,
	lon: PropTypes.number,
	maxDistance: PropTypes.number,
};

export default StopMenu;
