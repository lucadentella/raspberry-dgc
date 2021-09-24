const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone') 
const dayjs = require('dayjs')
dayjs.extend(utc)
dayjs.extend(timezone)

const RAPID_TEST_START_HOUR = "rapid_test_start_hours";
const RAPID_TEST_END_HOUR = "rapid_test_end_hours";
const MOLECULAR_TEST_START_HOUR = "molecular_test_start_hours";
const MOLECULAR_TEST_END_HOUR = "molecular_test_end_hours";

const DETECTED = "260373001";
const NOT_DETECTED = "260415000";

// https://ec.europa.eu/health/sites/default/files/ehealth/docs/digital-green-certificates_dt-specifications_en.pdf
const TYPE_RAPID = "LP217198-3"; 	// RAT, Rapid Antigen Test
const TYPE_MOLECULAR = "LP6464-4";	// NAAT, Nucleic Acid Amplification Test

const validateTest = function(settings, dcc) {
	
    var obj = dcc.payload.t[dcc.payload.t.length -1];
	var testType = obj.tt;
    var testResult = obj.tr;
	var dateTimeOfSampleCollection = obj.sc;
    var now = dayjs();
    
	// if result is Detected, green pass is not valid
	if(testResult == DETECTED) return {result: false, message: "Test result is Detected" };
	
	try {
		
		var odtDateTimeOfCollection = dayjs.tz(dateTimeOfSampleCollection, "UTC");
		var ldtDateTimeOfCollection = odtDateTimeOfCollection.tz(dayjs.tz.guess());
		
		var startDate;
		var endDate;
		
		// Rapid Test
		if(testType == TYPE_RAPID) {
			startDate = ldtDateTimeOfCollection.add(parseInt(getRapidTestStartHour(settings).value), 'hours')
			endDate = ldtDateTimeOfCollection.add(parseInt(getRapidTestEndHour(settings).value), 'hours')
		}
		
		// Molecular Test
		else if(testType == TYPE_MOLECULAR) {
			startDate = ldtDateTimeOfCollection.add(parseInt(getMolecularTestStartHour(settings).value), 'hours')
			endDate = ldtDateTimeOfCollection.add(parseInt(getMolecularTestEndHour(settings).value), 'hours')
		}
		
		// Unknown Test
		else return {result: false, message: "Unknown test type"};
		
		if(startDate.isAfter(now)) return {result: false, message: "Not valid yet"};
		if(now.isAfter(endDate)) return {result: false, message: "Expired"};
		return {result: true, message: "Valid"};

	// Exception
	} catch (e) {
		return {result: false, message: e.message};
	}
}


function getRapidTestStartHour(settings) {
	
    return settings.find(it => {
        return it.name == RAPID_TEST_START_HOUR
    })

}
function getRapidTestEndHour(settings) {
	
    return settings.find(it => {
        return it.name == RAPID_TEST_END_HOUR
    })
}

function getMolecularTestStartHour(settings) {
	
    return settings.find(it => {
        return it.name == MOLECULAR_TEST_START_HOUR
    })

}
function getMolecularTestEndHour(settings) {
	
    return settings.find(it => {
        return it.name == MOLECULAR_TEST_END_HOUR
    })
}

module.exports = {
	
	validateTest
}