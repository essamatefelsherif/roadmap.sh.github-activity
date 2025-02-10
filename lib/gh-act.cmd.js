/**
 * @module  github-activity-cmd
 * @desc    The command line interface for {@link module:github-activity github-activity} module.
 * @version 1.0.0
 * @author  Essam A. El-Sherif
 */

/* Import node.js core modules */
import fs      from 'node:fs';
import os      from 'node:os';
import path    from 'node:path';
import process from 'node:process';

/** @const {string} CMD - The command line interface. */
const CMD = 'gh-act';

/** @const {string} CMD_VER - The command line interface version. */
const CMD_VER = 'v1.0.0';

/**
 * @const {object} cmdOptions - Command line arguments.
 * @static
 */
export const cmdOptions = {
	user         : false,            // -u --user
	output       : 'v',              // -b --table
	                                 // -j --json
	                                 // -c --csv
	                                 // -v --verbose
	type         : '',               // -t --type
	debug        : false,            // -d --debug
	cache        : true,             //    --nocache
	userAgent    : `${CMD}/${CMD_VER}`,
	apiVersion   : '2022-11-28',
	cacheDir     : path.join(os.tmpdir(), CMD),
	authTokenFile: '.auth-token',
};

/**
 * @var {string} githubUser - The GitHub username given as a command line argument.
 * @static
 */
export let githubUser = '';

/**
 *     function parseCmdLine()
 * function getHelp()
 * function getError(n)
 * function getEvents()
 *
 * @func   parseCmdLine
 * @static
 * @desc   Command line parser function.
 */
export function parseCmdLine(){

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
				case '--debug':
					cmdOptions.debug = true;
					break;
				case '--nocache':
					cmdOptions.cache = false;
					if(args.length === 3){
						fs.rmSync(cmdOptions.cacheDir, {force: true, recursive: true});
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
					case 'd':
						cmdOptions.debug = true;
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
 * function parseCmdLine()
 *     function getHelp()
 * function getError(n)
 * function getEvents()
 *
 * @func   getHelp
 * @return {string}
 * @desc   Function to return help info.
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
  -d  --debug        output request and response headers
  -t  --type[=TYPE]  filter user activities by event type
      --nocache      remove the cache directory and exit
      --list         list GitHub event types and exit
      --help         display this help and exit
      --version      output version information and exit

Writing your GitHub authentication token to the file '.auth-token' located in the
package root directory is recommended for normal operation and required for testing.`;

}

/**
 * function parseCmdLine()
 * function getHelp()
 *     function getError(n)
 * function getEvents()
 *
 * @func   getError
 * @static
 * @param  {number} Error number.
 * @return {string} Error message.
 * @desc   Function to return error message.
 */
export function getError(n){

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
${CMD}: only one GitHub user is allowed
Try '${CMD} --help' for more information.`,

// error[6]
`\
${CMD}: no GitHub user given
Try '${CMD} --help' for more information.`,

// error[7]
`\
${CMD}: unable to fetch GitHub user '_' events
Try '${CMD} --help' for more information.`,

// error[8]
`\
${CMD}: unable to fetch the authorization token
Try '${CMD} --help' for more information.`,
];
	return error[n];
}

/**
 * function parseCmdLine()
 * function getHelp()
 * function getError(n)
 *     function getEvents()
 *
 * @func   getEvents
 * @static
 * @return {Map} Map of GitHub event types to event descriptions.
 * @desc   Function to return a Map of GitHub events.
 * @see    {@link https://docs.github.com/en/rest/using-the-rest-api/github-event-types?apiVersion=2022-11-28 GitHub event types}
 */
export function getEvents(){
	return new Map(
		[
			['CommitCommentEvent',            'A commit comment is created.'],
			['CreateEvent',                   'A Git branch or tag is created.'],
			['DeleteEvent',                   'A Git branch or tag is deleted.'],
			['ForkEvent',                     'A user forks a repository.'],
			['GollumEvent',                   'A wiki page is created or updated.'],
			['IssueCommentEvent',             'Activity related to an issue or pull request comment.'],
			['IssuesEvent',                   'Activity related to an issue.'],
			['MemberEvent',                   'Activity related to repository collaborators.'],
			['PublicEvent',                   'When a private repository is made public.'],
			['PullRequestEvent',              'Activity related to pull requests.'],
			['PullRequestReviewEvent',        'Activity related to pull request reviews.'],
			['PullRequestReviewCommentEvent', 'Activity related to pull request review comments in the pull request\'s unified diff.'],
			['PullRequestReviewThreadEvent',  'Activity related to a comment thread on a pull request being marked as resolved or unresolved.'],
			['PushEvent',                     'One or more commits are pushed to a repository branch or tag.'],
			['ReleaseEvent',                  'Activity related to a release.'],
			['SponsorshipEvent',              'Activity related to a sponsorship listing.'],
			['WatchEvent',                    'When someone stars a repository.'],
		]
	);
}
