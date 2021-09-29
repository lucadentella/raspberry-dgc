const fetch = require('node-fetch');
const cron = require('node-cron');
const http = require('http');
const url = require('url');
const { DCC } = require('dcc-utils');
const rs = require('jsrsasign');
const vaccination = require("./vaccination.js")
const test = require("./test.js")
const recovery = require("./recovery.js")

const port = 3000;

const urlUpdate = "https://get.dgc.gov.it/v1/dgc/signercertificate/update";
const urlStatus = "https://get.dgc.gov.it/v1/dgc/signercertificate/status";
const urlSettings = "https://get.dgc.gov.it/v1/dgc/settings";

const ADD_HOLDER_DETAILS = false;

let validKids;
let signerCertificates;
let settings;

const updateCertificates = (async () => {

	console.log("Updating signer certificates...");

	// get the list of valid KIDs
	response = await fetch(urlStatus);
	validKids = await response.json();
	
	console.log("Downloaded " + validKids.length + " valid KIDs" );
	
	// get the list of certificates
	signerCertificates = [];
	certificateDownloadedCount = 0;
	certificateAddedCount = 0;					  
	let headers = {};
	do {
		
		response = await fetch(urlUpdate, {
			headers,	   
		})
		
		headers = {'X-RESUME-TOKEN' : response.headers.get('X-RESUME-TOKEN')};
		const certificateKid = response.headers.get('X-KID');
		const certificate = await response.text();
		
		// a certificate has been downloaded
		if(certificate) {
			
			certificateDownloadedCount++;
			
			// the certificate is valid, add it to the list
			if(validKids.includes(certificateKid)) {
				certificateAddedCount++;
				signerCertificates.push("-----BEGIN CERTIFICATE-----\n" + certificate + "-----END CERTIFICATE-----");
			}
		}
	} while (response.status === 200);
	console.log("Downloaded " + certificateDownloadCount + " certificates, added " + certificateAddCount);
});

const updateSettings = (async () => {

	console.log("Updating settings...");

	response = await fetch(urlSettings);
	settings = await response.json();
	
	console.log("Done");
});

const main = (async () => {

	await updateCertificates();
	await updateSettings();

	const server = http.createServer();
	server.on('request', async (req, res) => {
		
		// set CORS header to allow browser clients
		res.setHeader('Access-Control-Allow-Origin', '*');
		
		const dgc = url.parse(req.url, true).query.dgc;
		
		if(dgc === undefined) {
			res.statusCode = 400;
			res.setHeader('Content-Type', 'text/plain');
			res.end("Invalid DGC");
		}
		else {
			
			// init DCC library
			let dcc;
			try {
				dcc = await DCC.fromRaw(dgc);
			
			// error when decoding DGC
			} catch (e) {
			
				res.statusCode = 400;
				res.setHeader('Content-Type', 'text/plain');
				res.end("INVALID: " + e.message);
				return;		 
			}
			
			// check DGC signature
			let signatureVerified = false;
			for(let certificate of signerCertificates) {
							
				try {
					const verifier = rs.KEYUTIL.getKey(certificate).getPublicKeyXYHex();
					signatureVerified = await dcc.checkSignature(verifier);
				} catch {}
				if(signatureVerified) break;
			}
			
			// no signer certificate found
			if(!signatureVerified) {
			
				res.statusCode = 400;
				res.setHeader('Content-Type', 'text/plain');
				res.end("INVALID: signature");
				return;					
			}
			
			// check DGC content
			let validate;
			
			// 1. vaccination
			if(dcc.payload.v) validate = vaccination.validateVaccination(settings, dcc);
			
			// 2. test
			if(dcc.payload.t) validate = test.validateTest(settings, dcc);
			
			// 3. recovery
			if(dcc.payload.r) validate = recovery.validateRecovery(settings, dcc);
			
			// Add holder details if required
			let response;
			if(ADD_HOLDER_DETAILS) {
				
				let surname = dcc.payload.nam.fn;
				let forename = dcc.payload.nam.gn;
				let dob = dcc.payload.dob;
				response = validate.message + " - " + surname + " " + forename + " (" + dob + ")";
			} else response = validate.message;
						
			if(validate.result) res.statusCode = 200;
			else res.statusCode = 400;
			res.setHeader('Content-Type', 'text/plain');
			res.end(response);				
		}
	});

	server.listen(port, () => {
	  console.log("validatorServer running");
	});
});

main();