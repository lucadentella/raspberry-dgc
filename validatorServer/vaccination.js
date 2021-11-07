const dayjs = require('dayjs')

const VACCINE_START_DAY_NOT_COMPLETE = "vaccine_start_day_not_complete";
const VACCINE_END_DAY_NOT_COMPLETE = "vaccine_end_day_not_complete";
const VACCINE_START_DAY_COMPLETE = "vaccine_start_day_complete";
const VACCINE_END_DAY_COMPLETE = "vaccine_end_day_complete";

const validateVaccination = function(settings, dcc, blacklist) {
	
    var obj = dcc.payload.v[dcc.payload.v.length -1];
    var vaccineType = obj.mp;
    var doseNumber = obj.dn;
    var dateOfVaccination = obj.dt;
    var totalSeriesOfDoses = obj.sd;
	var certificateIdentifier = obj.ci;
	var countryOfVaccination = obj.co;
    var now = dayjs();
	
	// Check if certificate identifier is defined and not in blacklist
	if(certificateIdentifier == "" || certificateIdentifier === undefined) return {result: false, message: "Certificate Identifier not defined"};
	if(blacklist.includes(certificateIdentifier)) return {result: false, message: "Certificate in blacklist"};
	
	// Check if vaccine is present in setting list
    var vaccineEndDayComplete = getVaccineEndDayComplete(settings, vaccineType);
	if(vaccineEndDayComplete === null) return {result: false, message: "Vaccine settings not found" };
	
	// Check if Sputnik-V was administered in San Marino
	if(vaccineType == "Sputnik-V" && countryOfVaccination != "SM") return {result: false, message: "Not valid" };

	try {
		
		// First dose
		if(doseNumber < totalSeriesOfDoses) {
			
			var startDate = dayjs(dateOfVaccination).add(parseInt(getVaccineStartDayNotComplete(settings, vaccineType).value), 'days');
			var endDate = dayjs(dateOfVaccination).add(parseInt(getVaccineEndDayNotComplete(settings, vaccineType).value), 'days');
			
			if(startDate.isAfter(now)) return {result: false, message: "Not valid yet"};
			if(now.isAfter(endDate)) return {result: false, message: "Expired"};
			return {result: true, message: "Partially valid"};
		}
		
		// Cycle completed
		if(doseNumber >= totalSeriesOfDoses) {
			var startDate = dayjs(dateOfVaccination).add(parseInt(getVaccineStartDayComplete(settings, vaccineType).value), 'days');
			var endDate = dayjs(dateOfVaccination).add(parseInt(getVaccineEndDayComplete(settings, vaccineType).value), 'days');
			if(startDate.isAfter(now)) return {result: false, message: "Not valid yet"};
			if(now.isAfter(endDate)) return {result: false, message: "Expired"};
			return {result: true, message: "Valid"};
		}
		
		// Data error
		return {result: false, message: "Invalid data"};

	// Exception
	} catch (e) {
		return {result: false, message: e.message};
	}
}

function getVaccineStartDayNotComplete(settings, vaccineType){
    
	return settings.find(it => {
        return it.name == VACCINE_START_DAY_NOT_COMPLETE && it.type == vaccineType
    })
}
function getVaccineEndDayNotComplete(settings, vaccineType){
    
	return settings.find(it => {
        return it.name == VACCINE_END_DAY_NOT_COMPLETE && it.type == vaccineType
    })
}

function getVaccineStartDayComplete(settings, vaccineType){
    
	return settings.find(it => {
        return it.name == VACCINE_START_DAY_COMPLETE && it.type == vaccineType
    })
}

function getVaccineEndDayComplete(settings, vaccineType) {
	
	return settings.find(it => {
		return it.name == VACCINE_END_DAY_COMPLETE && it.type == vaccineType
	})
}

module.exports = {
	
	validateVaccination
}
