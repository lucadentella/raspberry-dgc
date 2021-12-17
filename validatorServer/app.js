const {Service} = require('verificac19-sdk');
const {Certificate} = require('verificac19-sdk');
const {Validator} = require('verificac19-sdk');
const http = require('http');
const url = require('url');

const version = "1.0.0";
const port = 3000;

const ADD_HOLDER_DETAILS = true;
const ADD_DETAILED_MESSAGE = true;

const main = (async () => {

	process.stdout.write("validatorServer " + version + "\n\n");
	
	process.stdout.write("ADD_HOLDER_DETAILS: ");
	if(ADD_HOLDER_DETAILS) process.stdout.write(" enabled\n");
	else process.stdout.write(" disabled\n");
	process.stdout.write("ADD_DETAILED_MESSAGE: ");
	if(ADD_DETAILED_MESSAGE) process.stdout.write(" enabled\n");
	else process.stdout.write(" disabled\n");
	
	process.stdout.write("Updating keys, settings and blacklist...");
	await Service.updateAll();
	process.stdout.write(" done!\n");

	const server = http.createServer();
	server.on('request', async (req, res) => {
		
		process.stdout.write("Processing new request... ");
		
		// set CORS header to allow browser clients
		res.setHeader('Access-Control-Allow-Origin', '*');
		
		const dgc = url.parse(req.url, true).query.dgc;
		
		if(dgc === undefined) {
			res.statusCode = 400;
			res.setHeader('Content-Type', 'text/plain');
			res.end("Invalid DGC");
			process.stdout.write("Invalid DGC\n");
		}
		else {
			
			// load DGC
			let dcc;
			try {
				dcc = await Certificate.fromRaw(dgc);
			
			// error when decoding DGC
			} catch (e) {
			
				res.statusCode = 400;
				res.setHeader('Content-Type', 'text/plain');
				res.end("INVALID: " + e.message);
				return;		 
			}

			// validate DGC
			const validationResult = await Validator.validate(dcc);
			
			// add detailed message if required
			let result = validationResult.code;
			if(ADD_DETAILED_MESSAGE) result += ": " + validationResult.message;

			// Add holder details if required
			let response;
			if(ADD_HOLDER_DETAILS) {
				
				let person = (validationResult.person !== null) ? validationResult.person : "n/a";
				let dob = (validationResult.date_of_birth !== null) ? validationResult.date_of_birth : "n/a";
				response = result + " - " + person + " (" + dob + ")";
			} 
			else response = result;
						
			if(validationResult.code == "VALID") res.statusCode = 200;
			else res.statusCode = 400;
			res.setHeader('Content-Type', 'text/plain');
			res.end(response);

			process.stdout.write(validationResult.code + "\n");
		}
	});

	server.listen(port, () => {
	  process.stdout.write("\nvalidatorServer ready for requests...\n");
	});
});

main();