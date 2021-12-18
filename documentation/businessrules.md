# Business Rules :mag_right:

The validatorServer included in this project applies **italian** business rules.

To make this project compliant with italian law, the [Official SDK](https://github.com/italia/verificac19-sdk) is now used.

Validation is performed by SDK, using the `Validator` object:

    let validationResult;
    if(scanMode == "2G") validationResult = await Validator.validate(dcc, Validator.mode.SUPER_DGP); 
    else validationResult = await Validator.validate(dcc); 
	
If you want to change the server behavior, you have to replace the code with your country's specific rules.

## Rules API :information_source:
 
Some countries publish the **rules**, not the parameters.

The Italian SDK is based on [dcc-utils] library, that is a more generic library to decode and validate DGCs.

The dcc-utils library does support the rule format defined by the EU, check [the example](https://github.com/ministero-salute/dcc-utils/blob/master/examples/check_rules_from_api.js) provided. 
