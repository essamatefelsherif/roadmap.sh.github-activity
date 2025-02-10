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

/* Emulate commonJS __filename and __dirname constants */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @var {string} authToken - Authorization token. */
let authToken = '';

/** @const {Array} githubUserAct - The GitHub user activities. */
let githubUserAct = null;

/**
 *     function main
 * function processCmd(test)
 * function requestAPI(endpoint, etag)
 * function logRequestHeaders(res)
 * function logResponse(res)
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

		processCmd().then((userAct) => {
			console.log(userAct);
		});
	}
})('Main Function');

/**
 * function main
 *     function processCmd(test)
 * function requestAPI(endpoint, etag)
 * function logRequestHeaders(res)
 * function logResponse(res)
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
		}
		catch(e){
			try{
				githubUserObj = await requestAPI(`https://api.github.com/users/${githubUser}`);
				fs.writeFileSync(githubUserObjFile, JSON.stringify(githubUserObj, null, 0));

				(test === 'fetchUser') && process.stdout.write(githubUserObj.url);
				(test === 'fetchUser') && process.exit(0);
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
 *
 * @func   logRequestHeaders
 * @param  {object} res - The response object.
 * @desc   Log request headers to stderr.
 */
function logRequestHeaders(res){

	if(res.req._header){
		const headers = res.req._header.split('\r\n');
		headers.forEach((e) => e && !('GH_ACT_TEST' in process.env) && console.error(`> ${e}`));
		!('GH_ACT_TEST' in process.env) && console.error('> ');
	}
	else{
		!('GH_ACT_TEST' in process.env) && console.error(`> HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}`);

		const headers = res.req.getHeaders();
		for(let headerName of res.req.getRawHeaderNames())
			!('GH_ACT_TEST' in process.env) && console.error(`> ${headerName}: ${headers[headerName.toLowerCase()]}`);

		!('GH_ACT_TEST' in process.env) && console.error('> ');
	}

	!('GH_ACT_TEST' in process.env) && console.error();
}

/**
 * function main
 * function processCmd(test)
 * function requestAPI(endpoint, etag)
 * function logRequestHeaders(res)
 *     function logResponse(res)
 *
 * @func   logResponse
 * @param  {object} res - The response object.
 * @desc   Log response headers and body to stderr.
 */
function logResponse(res){

	!('GH_ACT_TEST' in process.env) && console.error(`< HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}`);

	for(let i = 0; i < res.rawHeaders.length; i += 2)
		!('GH_ACT_TEST' in process.env) && console.error(`< ${res.rawHeaders[i]}: ${res.rawHeaders[i+1]}`)

	!('GH_ACT_TEST' in process.env) && console.error('< ');
	!('GH_ACT_TEST' in process.env) && console.error(res.resBody);
	!('GH_ACT_TEST' in process.env) && console.error();
}

/*
  {
    id: '46138566569',
    type: 'PullRequestEvent',
    actor: {
      id: 41898282,
      login: 'github-actions[bot]',
      display_login: 'github-actions',
      gravatar_id: '',
      url: 'https://api.github.com/users/github-actions[bot]',
      avatar_url: 'https://avatars.githubusercontent.com/u/41898282?'
    },
    repo: {
      id: 309733671,
      name: 'mongodb/mongodb-atlas-kubernetes',
      url: 'https://api.github.com/repos/mongodb/mongodb-atlas-kubernetes'
    },
    payload: { action: 'opened', number: 2083, pull_request: [Object] },
    public: true,
    created_at: '2025-02-02T00:24:58Z',
    org: {
      id: 45120,
      login: 'mongodb',
      gravatar_id: '',
      url: 'https://api.github.com/orgs/mongodb',
      avatar_url: 'https://avatars.githubusercontent.com/u/45120?'
    }
  },

*/

/*
PullRequestReviewEvent   2025-02-02T15:21:48Z    mongodb/mongodb-atlas-cli
PullRequestEvent         2025-02-02T15:20:48Z    mongodb/mongodb-atlas-cli
ForkEvent                2025-02-02T15:15:23Z    mongodb/mongodb-atlas-cli
ForkEvent                2025-02-02T15:14:08Z    mongodb/mongodb-atlas-cli
PullRequestEvent         2025-02-02T13:43:47Z    mongodb/mongo-hibernate
PushEvent                2025-02-02T13:28:00Z    mongodb/docs-atlas-architecture
PullRequestEvent         2025-02-02T13:28:00Z    mongodb/docs-atlas-architecture
PullRequestEvent         2025-02-02T13:24:43Z    mongodb/docs-atlas-architecture
IssueCommentEvent        2025-02-02T13:06:32Z    mongodb/docs-atlas-architecture
PullRequestEvent         2025-02-02T13:06:08Z    mongodb/docs-atlas-architecture
PushEvent                2025-02-02T12:53:08Z    mongodb/docs-atlas-architecture
PullRequestEvent         2025-02-02T12:53:08Z    mongodb/docs-atlas-architecture
IssueCommentEvent        2025-02-02T12:35:48Z    mongodb/docs-atlas-architecture
PullRequestEvent         2025-02-02T12:35:25Z    mongodb/docs-atlas-architecture
IssueCommentEvent        2025-02-02T07:25:18Z    mongodb/mongodb-atlas-cli
IssueCommentEvent        2025-02-02T07:17:40Z    mongodb/mongodb-atlas-cli
IssuesEvent              2025-02-02T07:16:59Z    mongodb/mongodb-atlas-cli
ForkEvent                2025-02-02T07:00:49Z    mongodb/mongodb-atlas-cli
PullRequestEvent         2025-02-02T06:48:20Z    mongodb/mongo
ForkEvent                2025-02-02T06:01:55Z    mongodb/mongo-go-driver
IssueCommentEvent        2025-02-02T05:04:18Z    mongodb/docs-atlas-architecture
PullRequestEvent         2025-02-02T05:03:52Z    mongodb/docs-atlas-architecture
IssueCommentEvent        2025-02-02T03:50:04Z    mongodb/docs-atlas-architecture
PushEvent                2025-02-02T03:45:30Z    mongodb/docs-atlas-architecture
PullRequestEvent         2025-02-02T03:45:29Z    mongodb/docs-atlas-architecture
IssueCommentEvent        2025-02-02T03:40:40Z    mongodb/docs-atlas-architecture
PullRequestEvent         2025-02-02T03:40:18Z    mongodb/docs-atlas-architecture
IssueCommentEvent        2025-02-02T03:15:37Z    mongodb/mongo-rust-driver
IssueCommentEvent        2025-02-02T02:02:38Z    mongodb/mongodb-kubernetes-operator
WatchEvent               2025-02-02T01:53:54Z    mongodb/homebrew-brew

*/
