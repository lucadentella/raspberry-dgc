const dayjs = require('dayjs')

const VACCINE_START_DAY_NOT_COMPLETE = "vaccine_start_day_not_complete";
const VACCINE_END_DAY_NOT_COMPLETE = "vaccine_end_day_not_complete";
const VACCINE_START_DAY_COMPLETE = "vaccine_start_day_complete";
const VACCINE_END_DAY_COMPLETE = "vaccine_end_day_complete";

const validateRecovery = function(settings, dcc) {
	
    var obj = dcc.payload.r[dcc.payload.r.length -1];
    var certificateValidFrom = obj.df;
    var certificateValidUntil = obj.du;
    var now = dayjs();
	
	var startDate = dayjs(certificateValidFrom);
	var endDate = dayjs(certificateValidUntil);
	
	if(startDate.isAfter(now)) return {result: false, message: "Not valid yet"};
	if(now.isAfter(endDate)) return {result: false, message: "Expired"};
	return {result: true, message: "Valid"};
}

module.exports = {
	
	validateRecovery
}