import { call, put, select, takeEvery } from 'redux-saga/effects'
import { StateType, LocationType } from './reducer';
import { QueryTypeT, PositionParameters, sendQuery } from '../ApiUtils';

const getLocationAndType = (state: StateType): {type: string, location: LocationType} => ({type: state.view.type, location: state.location});

const getNearestQueryStr = (location: LocationType) : string => {
	if (location.position === undefined) return '';

	const getPositionParameter = (key: keyof PositionParameters): string => `${key}=${location.position[key]}`
	return `?${Object.keys(location.position).map(getPositionParameter).join('&')}&follow=${location.follow}`;
}

const getStopsQueryStr = (location: LocationType) : string => {
	if (location.stopCodes === undefined) return '';

	return `?code=${location.stopCodes.join(',')}`;
}

const generatePath = (type: QueryTypeT, location: LocationType): {path: string, query: string} => {
	switch(type) {
		case 'nearestBikes':
			return {path: '/bikes', query: getNearestQueryStr(location)};
		case 'nearestDepartures':
			return {path: '/nearby', query: getNearestQueryStr(location)};
		case 'nearestStops':
			return {path: '/menu', query: getNearestQueryStr(location)};
		case 'stopDepartures':
			return {path: '/stop', query: getStopsQueryStr(location)};
	}
}

function* updateHash() {
	const {type, location} = yield select(getLocationAndType);
	const {path, query} = generatePath(type, location);

	const baseurl = window.location.href.match(/[^#]+/)[0];
	window.history.replaceState(null, document.title, `${baseurl}#${path}${query}`);

	if (type !== 'stopDepartures' && !query) {
		yield put({type: 'GET_LOCATION'});
	}
}

const getUserLocation = () => new Promise((resolve, reject) => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(resolve, reject);
	} else {
		reject('Geolocation is not supported or allowed by this browser.');
	}
});

function* getLocation() {
	const { latitude: lat, longitude: lon } = (yield call(getUserLocation)).coords;

	yield put({type: 'NEW_LOCATION', metadata: {
		follow: true,
		position: {
			lat: Math.round(lat * 1e6) / 1e6,
			lon: Math.round(lon * 1e6) / 1e6,
			maxDistance: 1500,
			maxResults: 30,
		}
	}});
}

function* getData() {
	const {type, location} = yield select(getLocationAndType);
	
	let parameters;
	if (type === 'stopDepartures') {
		parameters = location.stopCodes.map((i: string): object => ({stopCode: i}));
	} else {
		parameters = location.position
	}
	try {
		const data = yield call(sendQuery, type, parameters);
		yield put({type: 'NEW_DATA', metadata: {type, data}});
	} catch(e) {
		yield put({type: 'NEW_Data', metadata: {type, data: [], error: e.toString}});
	}
}

export function* saga() {
	yield takeEvery("HASH_CHANGE", updateHash);
	
	yield takeEvery("GET_LOCATION", getLocation);

	yield takeEvery("NEW_LOCATION", getData);
	yield takeEvery("HASH_CHANGE", getData);
}
