# Business Rules :mag_right:

The validatorServer included in this project applies **italian** business rules.

Depending on the content of the green code, 3 checks are performed (in [app.js](https://github.com/lucadentella/raspberry-dgc/tree/main/validatorServer/app.js)):

    // 1. vaccination
    if(dcc.payload.v) validate = vaccination.validateVaccination(settings, dcc);
    
    // 2. test
    if(dcc.payload.t) validate = test.validateTest(settings, dcc);
    
    // 3. recovery
    if(dcc.payload.r) validate = recovery.validateRecovery(settings, dcc);
	
The *validate* functions are defined in specific js files, included in the main program:

    const vaccination = require("./vaccination.js")
    const test = require("./test.js")
    const recovery = require("./recovery.js")
	
The parameters used to apply the business rules are downloaded from the italian Ministry of Health website in JSON format:

	const urlSettings = "https://get.dgc.gov.it/v1/dgc/settings";
	
The name of each parameter is defined as constant:

	const VACCINE_START_DAY_NOT_COMPLETE = "vaccine_start_day_not_complete";
	const VACCINE_END_DAY_NOT_COMPLETE = "vaccine_end_day_not_complete";
	
Depending on the format used by the single European country, it may therefore be necessary to:

 - change the URL
 - change the name of the parameters
 
Some countries publish the **rules**, not the parameters.
The dcc-utils library does support the rule format defined by the EU, check [the example](https://github.com/ministero-salute/dcc-utils/blob/master/examples/check_rules_from_api.js) provided. 

