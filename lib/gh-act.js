/**
 * @module  github-activity
 * @desc    A simple command line interface (CLI) to fetch the recent activities of a GitHub user and display it in the terminal.
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

/* Emulate commonJS __filename and __dirname constants */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @var {number} debug - Run in debug mode. */
let debug = false;

/** @const {string} authTokenFile - Authorization token file. */
const authTokenFile = path.join(__dirname, '../.auth-token');

/** @var {string} authToken - Authorization token. */
let authToken = '';

/** @const {string} CMD - The command line interface. */
const CMD = 'gh-act';

/** @const {string} CMD_VER - The command line interface version. */
const CMD_VER = 'v1.0.0';

/** @const {object} cmdOptions - Command line arguments. */
const cmdOptions = {
	user      : false,            // -u --user
	output    : 'v',              // -b --table
	                              // -j --json
	                              // -c --csv
	                              // -v --verbose
	type      : '',               // -t --type
	agg       : false,            // -a --agg
	cache     : true,             //    --nocache
	userAgent : `${CMD}/${CMD_VER}`,
	apiVersion: '2022-11-28',
};

/** @const {string} cacheDir - Cache directory. */
const cacheDir = path.join(os.tmpdir(), CMD);

/** @const {string} githubUser - The GitHub username given as a command line argument. */
let githubUser = '';

/** @const {Array} githubUserAct - The GitHub user activities. */
let githubUserAct = null;

/**
 *     function main
 * function parseCmdLine()
 * function processCmd()
 * function getHelp()
 * function getError(n)
 *
 * @func Main
 * @desc The application entry point function
 */
(() => {

	// read the authorization token if exists
	try{
		authToken = fs.readFileSync(authTokenFile, 'utf8');
	}
	catch(e){
	}

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
				fs.mkdirSync(cacheDir);
			}
			catch(e){}

			processCmd('fetchUser');
		}
		else
		if(process.env['GH_ACT_TEST'] === 'fetchAct'){
			parseCmdLine();

			try{
				fs.mkdirSync(cacheDir);
			}
			catch(e){}

			processCmd('fetchAct');
		}
	}
	// run the CLI in normal mode
	else{
		parseCmdLine();

		try{
			fs.mkdirSync(cacheDir);
		}
		catch(e){}

		processCmd().then((userAct) => {
			console.log(userAct);
		});
	}
})('Main Function');

/**
 * function main
 *     function parseCmdLine()
 * function processCmd()
 * function getHelp()
 * function getError(n)
 *
 * @func parseCmdLine
 * @desc Command line parser function.
 */
function parseCmdLine(){

	const args = process.argv;

	if(args.length === 2){
		process.stdout.write(`${getHelp()}\n`);
		process.exit(0);
	}

	for(let i = 2; i < args.length; i++){
		if(args[i] === '--help'){
			process.stdout.write(`${getHelp()}\n`);
			process.exit(0);
		}
		else
		if(args[i] === '--version'){
			process.stdout.write(`${CMD_VER}\n`);
			process.exit(0);
		}
		else
		if(args[i] === '--list'){
			for(let e of getEvents()){
				process.stdout.write( (e[0]+' ').padEnd(30, '.') + '.... ');
				process.stdout.write(e[1] + '\n');
			}
			process.exit(0);
		}
		else
		if(args[i].startsWith('--')){
			switch(args[i]){
				case '--':
					break;
				case '--user':
					cmdOptions.user = true;
					break;
				case '--table':
					cmdOptions.output = 'b';
					break;
				case '--json':
					cmdOptions.output = 'j';
					break;
				case '--csv':
					cmdOptions.output = 'c';
					break;
				case '--verbose':
					cmdOptions.output = 'v';
					break;
				case '--agg':
					cmdOptions.agg = true;
					break;
				case '--nocache':
					cmdOptions.cache = false;
					if(args.length === 3){
						fs.rmSync(cacheDir, {force: true, recursive: true});
						process.exit(0);
					}
					break;
				default:
					if(args[i].startsWith('--type')){

						if(args[i] === '--type='){
							process.stderr.write(`${getError(0).replace('_', '--type')}\n`);
							process.exit(1);
						}
						else
						if(args[i].startsWith('--type=')){
							let str = args[i].replace('--type=', '');

							if(getEvents().has(str)){
								cmdOptions.type = str;
							}
							else{
								process.stderr.write(`${getError(4).replace('_', str)}\n`);
								process.exit(1);
							}
						}
						else
						if(i === args.length -  1){
							process.stderr.write(`${getError(0).replace('_', '--type')}\n`);
							process.exit(1);
						}
						else
						if(getEvents().has(args[i+1])){
							cmdOptions.type = args[++i];
						}
						else{
							process.stderr.write(`${getError(4).replace('_', args[i+1])}\n`);
							process.exit(1);
						}
					}
					else{
						process.stderr.write(`${getError(1).replace('_', args[i])}\n`);
						process.exit(1);
					}
					break;
			}
		}
		else
		if(args[i] === '-'){}
		else
		if(args[i].startsWith('-')){
			for(let k = 1; k < args[i].length; k++){
				let opt = args[i][k];

				switch(opt){
					case 'u':
						cmdOptions.user = true;
						break;
					case 'b':
						cmdOptions.output = 'b';
						break;
					case 'j':
						cmdOptions.output = 'j';
						break;
					case 'c':
						cmdOptions.output = 'c';
						break;
					case 'v':
						cmdOptions.output = 'v';
						break;
					case 'a':
						cmdOptions.agg = true;
						break;
					default:
						if(opt === 't'){
							if(k < args[i].length - 1 || i === args.length -  1){
								process.stderr.write(`${getError(0).replace('_', '-t')}\n`);
								process.exit(1);
							}
							else
							if(getEvents().has(args[i+1])){
								cmdOptions.type = args[++i];
							}
							else{
								process.stderr.write(`${getError(4).replace('_', args[i+1])}\n`);
								process.exit(1);
							}
						}
						else{
							process.stderr.write(`${getError(2).replace('_', opt)}\n`);
							process.exit(1);
						}
						break;
				}
			}
		}
		else
		if(githubUser){
			process.stderr.write(`${getError(5)}\n`);
			process.exit(1);
		}
		else{
			githubUser = args[i];
		}
	}

	if(!githubUser){
		process.stderr.write(`${getError(6)}\n`);
		process.exit(1);
	}
}

/**
 * function main
 * function parseCmdLine()
 *     function processCmd()
 * function getHelp()
 * function getError(n)
 *
 * @func  processCmd
 * @async
 * @desc  Command processer function
 */
async function processCmd(test){

	const githubUserObjFile = path.join(cacheDir, githubUser + '.user.json');
	const githubUserEventsFile =  path.join(cacheDir, githubUser + '.events.json');

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

		debug && logRequestHeaders(res);

		let etag = res.headers.etag;
		etag = etag && etag.replace(/[^a-fA-F0-9]/g, '');

		let resBody = '';
		res.on('data', (chunk) => { resBody += chunk });
		res.on('end', () => {

			res.resBody = resBody;
			debug && logResponse(res);

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

function logRequestHeaders(res){

	if(res.req._header){
		let headers = res.req._header.split('\r\n');
		headers.forEach((e) => e && console.error(`> ${e}`));
		console.error('> ');
	}
	else{
		console.error(`> HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}`);

		let headers = res.req.getHeaders();
		for(let headerName of res.req.getRawHeaderNames())
			console.error(`> ${headerName}: ${headers[headerName.toLowerCase()]}`);

		console.error('> ');
	}

	console.error();
}

function logResponse(res){

	console.error(`< HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}`);

	for(let i = 0; i < res.rawHeaders.length; i += 2)
		console.error(`< ${res.rawHeaders[i]}: ${res.rawHeaders[i+1]}`)

	console.error('< ');
	console.error(res.resBody);
	console.error();
}

/**
 * function main
 * function parseCmdLine()
 * function processCmd()
 *     function getHelp()
 * function getError(n)
 *
 * @func   getHelp
 * @return {string}
 * @desc   Function to return help info
 */
function getHelp(){

	return `\
Usage: ${CMD} [OPTION]... USER
Use GitHub API to fetch GitHub user activities and display it in the terminal.

  -u  --user         include user information
  -b  --table        tabular output
  -j  --json         output JSON data
  -c  --csv          output comma separated values
  -v  --verbose      verbose output (default)
  -a  --agg          aggregate user activities by event type
  -t  --type[=TYPE]  filter user activities by event type
      --nocache      remove the cache directory and exit
      --list         list GitHub event types and exit
      --help         display this help and exit
      --version      output version information and exit`;
}

/**
 * function main
 * function parseCmdLine()
 * function processCmd()
 * function getHelp()
 *     function getError(n)
 *
 * @func   getError
 * @param  {number} Error number
 * @return {string} Error message
 * @desc   Function to return error message
 */
function getError(n){

const error = [

// error[0] - missing argument
`\
${CMD}: ambiguous argument ‘’ for ‘_’
Try '${CMD} --help' for more information.`,

// error[1] - multi-character options
`\
${CMD}: unrecognized option '_'
Try '${CMD} --help' for more information.`,

// error[2] - single-character options
`\
${CMD}: invalid option -- '_'
Try '${CMD} --help' for more information.`,

// error[3]
`\
${CMD}: GitHub user '_' not found
Try '${CMD} --help' for more information.`,

// error[4]
`\
${CMD}: unrecognized GitHub event type '_'
Try '${CMD} --list' for more information.`,

// error[5]
`\
${CMD}: GitHub user was already given
Try '${CMD} --help' for more information.`,

// error[6]
`\
${CMD}: No GitHub user given
Try '${CMD} --help' for more information.`,

// error[7]
`\
${CMD}: unable to fetch GitHub user '_' events
Try '${CMD} --help' for more information.`,

// error[8]
`\
${CMD}: unable to read the authorization token
Try '${CMD} --help' for more information.`,
];
	return error[n];
}

/**
 * @func   getEvents
 * @return {Map} Map of event types to event descriptions.
 * @desc   Function to return a Map of GitHub events.
 */
function getEvents(){
	return new Map(
		[
			['CommitCommentEvent', 'A commit comment is created.'],
			['CreateEvent', 'A Git branch or tag is created.'],
			['DeleteEvent', 'A Git branch or tag is deleted.'],
			['ForkEvent', 'A user forks a repository.'],
			['GollumEvent', 'A wiki page is created or updated.'],
			['IssueCommentEvent', 'Activity related to an issue or pull request comment.'],
			['IssuesEvent', 'Activity related to an issue.'],
			['MemberEvent', 'Activity related to repository collaborators.'],
			['PublicEvent', 'When a private repository is made public.'],
			['PullRequestEvent', 'Activity related to pull requests.'],
			['PullRequestReviewEvent', 'Activity related to pull request reviews.'],
			['PullRequestReviewCommentEvent', 'Activity related to pull request review comments in the pull request\'s unified diff.'],
			['PullRequestReviewThreadEvent', 'Activity related to a comment thread on a pull request being marked as resolved or unresolved.'],
			['PushEvent', 'One or more commits are pushed to a repository branch or tag.'],
			['ReleaseEvent', 'Activity related to a release.'],
			['SponsorshipEvent', 'Activity related to a sponsorship listing.'],
			['WatchEvent', 'When someone stars a repository.'],
		]
	);
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
