class APIQuery {
	static getNearestDepartures(lat = 60.1836474999998, lon = 24.828072999999993, maxDistance = 150, maxResults=20) {
		return fetch(APIQuery.APIurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/graphql'
			},
			body: APIQuery.queries.nearestDepartures(lat, lon, maxDistance, maxResults)
		})
		.then((response) => response.json())
		.then((responseJson) => {
			if (responseJson.hasOwnProperty('errors')){
				throw new Error('HSL API returned object with errors content instead of data:\n' + JSON.stringify(responseJson, null, 2));
			}
			return responseJson.data;
		});
	}

	static getStopDepartures(stopCode = 'E2036', numberOfDepartures = 10) {
		return fetch(APIQuery.APIurl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/graphql'
			},
			body: APIQuery.queries.stopDepartures(stopCode, numberOfDepartures)
		})
		.then((response) => response.json())
		.then((responseJson) => {
			if (responseJson.hasOwnProperty('errors')){
				throw new Error('HSL API returned object with errors content instead of data\n:' + JSON.stringify(responseJson, null, 2));
			}
			return responseJson.data;
		});
	}

	static APIurl = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';
	static queryFields = {
		stoptimes: 'trip { route { shortName mode alerts { alertHeaderText alertDescriptionText } } } realtimeArrival realtimeDeparture realtime stopHeadsign serviceDay',
		stop: 'name code platformCode desc lat lon'
	};
	static queries = {
		nearestDepartures: (lat = 60.1836474999998, lon = 24.828072999999993, maxDistance = 150, maxResults=20) => {
			return '{ nearest (lat: ' + lat + ', lon: ' + lon + ', maxDistance: ' + maxDistance + ', maxResults: ' + maxResults + ', filterByPlaceTypes: DEPARTURE_ROW) { edges { node { place { ... on DepartureRow { stop { ' + APIQuery.queryFields.stop + ' } stoptimes { ' + APIQuery.queryFields.stoptimes + ' }}}}}}}';
		},
		stopDepartures: (stopCode = 'E2036', numberOfDepartures = 10) => {
			return '{ stops(name: "' + stopCode + '") { name gtfsId stoptimesWithoutPatterns(numberOfDepartures: ' + numberOfDepartures + ') { ' + APIQuery.queryFields.stoptimes + '}}}';
		}
	};
}

export default APIQuery;