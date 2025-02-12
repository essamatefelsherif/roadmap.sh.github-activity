/**
 * @module  github-activity
 * @desc    A simple command line interface (CLI) utility to fetch the recent activities of a GitHub user and display it in the terminal.
 * @version 1.0.0
 * @author  Essam A. El-Sherif
 */

/* Import node.js core modules */
import fs                from 'node:fs';
import https             from 'node:https';
import os                from 'node:os';
import path              from 'node:path';
import process           from 'node:process';
import { fileURLToPath } from 'node:url';

/* Import from local modules */
import { parseCmdLine, getError } from './gh-act.cmd.js';
import { cmdOptions }             from './gh-act.cmd.js';
import { githubUser }             from './gh-act.cmd.js';
import { GitHubEvent }            from './gh-event.js';

/* Emulate commonJS __filename and __dirname constants */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @const {boolean} testMode - Run the program in test mode. */
const testMode = 'GH_ACT_TEST' in process.env;

/** @var {string} authToken - Authorization token required in test mode. */
let authToken = '';

/**
 *     function main
 * function processCmd(test)
 * function requestAPI(endpoint, etag)
 * function logRequestHeaders(res)
 * function logResponse(res)
 * function output(githubUserEvents)
 *
 * @func Main
 * @desc The application entry point function
 */
(() => {

	const authTokenFile = path.join(__dirname, '../', cmdOptions.authTokenFile);

	// read the authorization token if exists
	try{
		authToken = fs.readFileSync(authTokenFile, 'utf8');
	}
	catch(e){}

	// run the CLI in test mode
	if('GH_ACT_TEST' in process.env){
		if(!authToken){
			process.stderr.write(`${getError(8)}\n`);
			process.exit(1);
		}
		else
		if(process.env['GH_ACT_TEST'] === 'parse'){
			parseCmdLine();
			process.stdout.write(JSON.stringify(cmdOptions));
		}
		else
		if(process.env['GH_ACT_TEST'] === 'fetchUser'){
			parseCmdLine();

			try{
				fs.mkdirSync(cmdOptions.cacheDir);
			}
			catch(e){}

			processCmd('fetchUser');
		}
		else
		if(process.env['GH_ACT_TEST'] === 'fetchAct'){
			parseCmdLine();

			try{
				fs.mkdirSync(cmdOptions.cacheDir);
			}
			catch(e){}

			processCmd('fetchAct');
		}
	}
	// run the CLI in normal mode
	else{
		parseCmdLine();

		try{
			fs.mkdirSync(cmdOptions.cacheDir);
		}
		catch(e){}

		processCmd().then(githubUserEvents => {
			output(githubUserEvents);
		});
	}
})('Main Function');

/**
 * function main
 *     function processCmd(test)
 * function requestAPI(endpoint, etag)
 * function logRequestHeaders(res)
 * function logResponse(res)
 * function output(githubUserEvents)
 *
 * @func  processCmd
 * @async
 * @param {string} test - Test descriptor.
 * @desc  Command processer function.
 */
async function processCmd(test){

	const githubUserObjFile = path.join(cmdOptions.cacheDir, githubUser + '.user.json');
	const githubUserEventsFile =  path.join(cmdOptions.cacheDir, githubUser + '.events.json');

	let githubUserObj = null, githubUserEvents = null;

	// Retreive User JSON
	try{
		let res = fs.readFileSync(githubUserObjFile, 'utf8');
		let cacheUserObj = JSON.parse(res);

		try{
			githubUserObj = await requestAPI(`https://api.github.com/orgs/${githubUser}`, cacheUserObj.etag);

			if(githubUserObj.url){
				fs.writeFileSync(githubUserObjFile, JSON.stringify(githubUserObj, null, 0));
			}
			else{
				githubUserObj = cacheUserObj;
			}

			(test === 'fetchUser') && process.stdout.write(githubUserObj.url);
			(test === 'fetchUser') && process.exit(0);

			if(cmdOptions.user){
				('etag' in githubUserObj) && delete githubUserObj.etag;
				console.log(githubUserObj);
				process.exit(0);
			}
		}
		catch(e){
			try{
				githubUserObj = await requestAPI(`https://api.github.com/users/${githubUser}`, cacheUserObj.etag);

				if(githubUserObj.url){
					fs.writeFileSync(githubUserObjFile, JSON.stringify(githubUserObj, null, 0));
				}
				else{
					githubUserObj = cacheUserObj;
				}

				(test === 'fetchUser') && process.stdout.write(githubUserObj.url);
				(test === 'fetchUser') && process.exit(0);

				if(cmdOptions.user){
					('etag' in githubUserObj) && delete githubUserObj.etag;
					console.log(githubUserObj);
					process.exit(0);
				}
			}
			catch(e){
				fs.unlinkSync(githubUserObjFile);

				process.stderr.write(`${getError(3).replace('_', githubUser)}\n`);
				process.exit(1);
			}
		}
	}
	catch(e){
		try{
			githubUserObj = await requestAPI(`https://api.github.com/orgs/${githubUser}`);
			fs.writeFileSync(githubUserObjFile, JSON.stringify(githubUserObj, null, 0));

			(test === 'fetchUser') && process.stdout.write(githubUserObj.url);
			(test === 'fetchUser') && process.exit(0);

			if(cmdOptions.user){
				('etag' in githubUserObj) && delete githubUserObj.etag;
				console.log(githubUserObj);
				process.exit(0);
			}
		}
		catch(e){
			try{
				githubUserObj = await requestAPI(`https://api.github.com/users/${githubUser}`);
				fs.writeFileSync(githubUserObjFile, JSON.stringify(githubUserObj, null, 0));

				(test === 'fetchUser') && process.stdout.write(githubUserObj.url);
				(test === 'fetchUser') && process.exit(0);

				if(cmdOptions.user){
					('etag' in githubUserObj) && delete githubUserObj.etag;
					console.log(githubUserObj);
					process.exit(0);
				}
			}
			catch(e){
				process.stderr.write(`${getError(3).replace('_', githubUser)}\n`);
				process.exit(1);
			}
		}
	}

	// Retreive User Events JSON
	try{
		let res = fs.readFileSync(githubUserEventsFile, 'utf8');
		let cacheUserEvents = JSON.parse(res);

		try{
			let etag = cacheUserEvents.length ? cacheUserEvents[cacheUserEvents.length - 1].etag : undefined;
			githubUserEvents = await requestAPI(`${githubUserObj.events_url.replace(/\{.*\}/g, '')}`, etag);

			if(Array.isArray(githubUserEvents)){
				fs.writeFileSync(githubUserEventsFile, JSON.stringify(githubUserEvents, null, 0));
			}
			else{
				githubUserEvents = cacheUserEvents;
			}

			(test === 'fetchAct') && process.stdout.write(Object.prototype.toString.call(githubUserEvents));
			(test === 'fetchAct') && process.exit(0);
		}
		catch(e){
			fs.unlinkSync(githubUserEventsFile);

			process.stderr.write(`${getError(7).replace('_', githubUser)}\n`);
			process.exit(1);
		}
	}
	catch(e){
		try{
			githubUserEvents = await requestAPI(`${githubUserObj.events_url.replace(/\{.*\}/g, '')}`);
			fs.writeFileSync(githubUserEventsFile, JSON.stringify(githubUserEvents, null, 0));

			(test === 'fetchAct') && process.stdout.write(Object.prototype.toString.call(githubUserEvents));
			(test === 'fetchAct') && process.exit(0);
		}
		catch(e){
			process.stderr.write(`${getError(7).replace('_', githubUser)}\n`);
			process.exit(1);
		}
	}

	return Promise.resolve(githubUserEvents);
}

/**
 * function main
 * function processCmd(test)
 *     function requestAPI(endpoint, etag)
 * function logRequestHeaders(res)
 * function logResponse(res)
 * function output(githubUserEvents)
 *
 * @func   requestAPI
 * @param  {string} endpoint - GitHub endpoint url.
 * @param  {string} etag - Etag header used to make conditional request.
 * @return {Promise} Promise object that will fulfill upon processing the request.
 * @desc   Call to GitHub Rest API.
 */
function requestAPI(endpoint, etag){

	return new Promise((resolve, reject) => {

		const reqOpt = {};
		const req = https.request(endpoint, reqOpt);

		req.setHeader('User-Agent', cmdOptions.userAgent);
		req.setHeader('X-GitHub-Api-Version', cmdOptions.apiVersion);
		authToken && req.setHeader('Authorization', `token ${authToken}`);

		etag && req.setHeader('If-None-Match', `"${etag}"`);

		req.on('response', (res) => { resolve(res) });
		req.end();

	})
	.then((res) => new Promise((resolve, reject) => {

		cmdOptions.debug && logRequestHeaders(res);

		let etag = res.headers.etag;
		etag = etag && etag.replace(/[^a-fA-F0-9]/g, '');

		let resBody = '';
		res.on('data', (chunk) => { resBody += chunk });
		res.on('end', () => {

			res.resBody = resBody;
			cmdOptions.debug && logResponse(res);

			resBody = resBody ? JSON.parse(resBody) : {};

			if(etag){
				if(Array.isArray(resBody))
					resBody.push({'etag': etag});
				else
				if(typeof resBody === 'object')
					resBody.etag = etag;
			}

			if(res.statusCode >= 200 && res.statusCode < 400)
				resolve(resBody);
			else
				reject(resBody);
		});
	}));
}

/**
 * function main
 * function processCmd(test)
 * function requestAPI(endpoint, etag)
 *     function logRequestHeaders(res)
 * function logResponse(res)
 * function output(githubUserEvents)
 *
 * @func   logRequestHeaders
 * @param  {object} res - The response object.
 * @desc   Log request headers to stderr.
 */
function logRequestHeaders(res){

	if(res.req._header){
		const headers = res.req._header.split('\r\n');
		headers.forEach((e) => e && !testMode && console.error(`> ${e}`));
		!testMode && console.error('> ');
	}
	else{
		!testMode && console.error(`> HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}`);

		const headers = res.req.getHeaders();
		for(let headerName of res.req.getRawHeaderNames())
			!testMode && console.error(`> ${headerName}: ${headers[headerName.toLowerCase()]}`);

		!testMode && console.error('> ');
	}

	!testMode && console.error();
}

/**
 * function main
 * function processCmd(test)
 * function requestAPI(endpoint, etag)
 * function logRequestHeaders(res)
 *     function logResponse(res)
 * function output(githubUserEvents)
 *
 * @func   logResponse
 * @param  {object} res - The response object.
 * @desc   Log response headers and body to stderr.
 */
function logResponse(res){

	!testMode && console.error(`< HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}`);

	for(let i = 0; i < res.rawHeaders.length; i += 2)
		!testMode && console.error(`< ${res.rawHeaders[i]}: ${res.rawHeaders[i+1]}`)

	!testMode && console.error('< ');
	!testMode && console.error(res.resBody);
	!testMode && console.error();
}

/**
 * function main
 * function processCmd(test)
 * function requestAPI(endpoint, etag)
 * function logRequestHeaders(res)
 * function logResponse(res)
 *     function output(githubUserEvents)
 *
 * @func  output
 * @param {Array} githubUserEvents - Output GitHub user events.
 * @desc  Display output in terminal.
 */
function output(githubUserEvents){

	if('etag' in githubUserEvents[githubUserEvents.length - 1])
		githubUserEvents.pop();

	// cmdOptions.type !== ''
	if(cmdOptions.type){
		githubUserEvents = githubUserEvents.filter(event => event.type === cmdOptions.type);
	}

	if(cmdOptions.output === 'j'){
		console.log(githubUserEvents);
	}
	else
	if(cmdOptions.output === 'b'){
		let maxTypeLength = 5, maxRepoLength = 10, maxDateLength = 20;

		githubUserEvents.forEach(event => {
			maxTypeLength = Math.max(event.type.length, maxTypeLength);
			maxRepoLength = Math.max(event.repo.name.length, maxRepoLength);
		});

		console.log(`${'Event'.padEnd(maxTypeLength)}    ${'Created at'.padEnd(maxDateLength)}    Repository`);
		console.log(`${'='.repeat(maxTypeLength)}    ${'='.repeat(maxDateLength)}    ${'='.repeat(maxRepoLength)}`);

		githubUserEvents.forEach(event => { console.log(`${event.type.padEnd(maxTypeLength)}    ${event.created_at}    ${event.repo.name}`); });
	}
	else
	if(cmdOptions.output === 'c'){
		githubUserEvents.forEach(event => { console.log(`${event.type},${event.created_at},${event.repo.name}`); });
	}
	else
	if(cmdOptions.output === 'v'){
		if(githubUserEvents.length === 0){
			console.log('no user activities found');
		}
		else{
			githubUserEvents.forEach(event => { console.log(new GitHubEvent(event).phrase) });
		}
	}
}
