/**
 * @module  github-user-activity-test
 * @desc    Testing module for the {@link module:github-user-activity github-user-activity} module.
 * @version 1.0.0
 * @author  Essam A. El-Sherif
 */

/* Import node.js core modules */
import assert             from 'node:assert/strict';
import { exec, execSync } from 'node:child_process';
import fs                 from 'node:fs';
import os                 from 'node:os';
import path               from 'node:path';
import process            from 'node:process';
import { fileURLToPath }  from 'node:url';

/* Emulate commonJS __filename and __dirname constants */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @const {string} CMD - The tested program command. */
const CMD = 'gh-act';

/** @const {string} CMD_VER - The tested program command version. */
const CMD_VER = 'v1.0.0';

/** @const {string} CMD_HELP - The tested program command help. */
const CMD_HELP = `\
Usage: ${CMD} [OPTION]... USER
Use GitHub API to fetch GitHub user activities and display it in the terminal.

  -b  --table        tabular output
  -j  --json         output JSON data
  -c  --csv          output comma separated values
  -v  --verbose      verbose output (default)
  -d  --debug        show request and response headers
  -t  --type[=TYPE]  filter user activities by event type
      --user         output user information and exit
      --nocache      remove the cache directory and exit
      --list         list GitHub event types and exit
      --help         display this help and exit
      --version      output version information and exit

Writing your GitHub authentication token to the file '.auth-token' located in the
package root directory is recommended for normal operation and required for testing.`;

/** @const {object} cmdOptions - Options used when running the tests. */
const cmdOptions = {
	node    : true,
	verbose : true,
};

/** @const {string} cacheDir - Cache directory. */
const cacheDir = path.join(os.tmpdir(), CMD);

/* Prepare test environment */
const cmdPath = path.join(__dirname, '..', 'lib/gh-act.js');
const classPath = path.join(__dirname, '..', 'lib/gh-event.js');

let testCount   = 1;
let passCount   = 0;
let failCount   = 0;
let cancelCount = 0;
let skipCount   = 0;
let todoCount   = 0;
let startTime = Date.now();

const suites = new Map();

/**
 *     function main()
 * function loadTestData()
 * function nodeRunner()
 * function defRunner()
 * async function makeTest()
 * function getCmdOutput()
 *
 * @func Main
 * @desc The application entry point function.
 */
(() => {

	loadTestData();

	if(cmdOptions.node){

		import('node:test')
			.then(runner => {
				cmdOptions.node = true;
				cmdOptions.verbose = false;
				nodeRunner(runner);
			})
			.catch((e) => {
				cmdOptions.node = false;
				cmdOptions.verbose = true;
				defRunner();
			});
	}
	else{
		cmdOptions.node = false;
		defRunner();
	}

})('Main Function');

/**
 * function main()
 *     function loadTestData()
 * function nodeRunner()
 * function defRunner()
 * async function makeTest()
 * function getCmdOutput()
 *
 * @func loadTestData
 * @desc Load test data.
 */
function loadTestData(){

	let cmdData = null;
	let suiteDesc = '';
	let actFile = '', expFile = '';

	// TEST SUITE #1 - Test common options
	suiteDesc = 'Test common options';
	suites.set(suiteDesc, []);

	// TEST ### - gh-act
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath}`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = `${CMD_HELP}\n`;
cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD}`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --help
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --help`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = `${CMD_HELP}\n`;
cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} --help`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --version
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --version`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = `${CMD_VER}\n`;
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: Object.assign({GH_ACT_TEST: 'parse'}, {} )};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} --version`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --list
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --list`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = `\
CommitCommentEvent ............... A commit comment is created.
CreateEvent ...................... A Git branch or tag is created.
DeleteEvent ...................... A Git branch or tag is deleted.
ForkEvent ........................ A user forks a repository.
GollumEvent ...................... A wiki page is created or updated.
IssueCommentEvent ................ Activity related to an issue or pull request comment.
IssuesEvent ...................... Activity related to an issue.
MemberEvent ...................... Activity related to repository collaborators.
PublicEvent ...................... When a private repository is made public.
PullRequestEvent ................. Activity related to pull requests.
PullRequestReviewEvent ........... Activity related to pull request reviews.
PullRequestReviewCommentEvent .... Activity related to pull request review comments in the pull request's unified diff.
PullRequestReviewThreadEvent ..... Activity related to a comment thread on a pull request being marked as resolved or unresolved.
PushEvent ........................ One or more commits are pushed to a repository branch or tag.
ReleaseEvent ..................... Activity related to a release.
SponsorshipEvent ................. Activity related to a sponsorship listing.
WatchEvent ....................... When someone stars a repository.
`;
cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} --list`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --nocache
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --nocache`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = '';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: Object.assign({GH_ACT_TEST: 'parse'}, {} )};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} --nocache`;

	cmdData.run_after = () => {
		assert.strictEqual(fs.statSync(`${cacheDir}`, {throwIfNoEntry: false}), undefined);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST SUITE #2 - Test invalid multi-character options
	suiteDesc = 'Test invalid multi-character options';
	suites.set(suiteDesc, []);

	// TEST ### - gh-act --xxx
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --xxx`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `${CMD}: unrecognized option '--xxx'
Try '${CMD} --help' for more information.\n`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} --xxx`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --type=
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --type=`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `\
${CMD}: ambiguous argument ‘’ for ‘--type’
Try '${CMD} --help' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} --type=`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --type
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --type`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `\
${CMD}: ambiguous argument ‘’ for ‘--type’
Try '${CMD} --help' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} --type`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --type=InvalidType
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --type=InvalidType`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `\
${CMD}: unrecognized GitHub event type 'InvalidType'
Try '${CMD} --list' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} --type=InvalidType`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --type InvalidType
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --type InvalidType`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `\
${CMD}: unrecognized GitHub event type 'InvalidType'
Try '${CMD} --list' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} --type InvalidType`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --user
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --user`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `\
${CMD}: no GitHub user given
Try '${CMD} --help' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} --user`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST SUITE #3 - Test invalid single-character options
	suiteDesc = 'Test invalid single-character options';
	suites.set(suiteDesc, []);

	// TEST ### - gh-act -x
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} -x`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `\
${CMD}: invalid option -- 'x'
Try '${CMD} --help' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} -x`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act -xy
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} -xy`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `\
${CMD}: invalid option -- 'x'
Try '${CMD} --help' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} -uxy`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act -t
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} -t`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `\
${CMD}: ambiguous argument ‘’ for ‘-t’
Try '${CMD} --help' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} -t`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act -tb
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} -tb`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `\
${CMD}: ambiguous argument ‘’ for ‘-t’
Try '${CMD} --help' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} -tb`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act -t InvalidType
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} -t InvalidType`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

cmdData.cmd_out = '';
cmdData.cmd_err = `\
${CMD}: unrecognized GitHub event type 'InvalidType'
Try '${CMD} --list' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} -t InvalidType`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST SUITE #3 - Test valid options
	suiteDesc = 'Test valid options';
	suites.set(suiteDesc, []);

	// TEST ### - gh-act user
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} user`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = `{"user":false,"output":"v","type":"","debug":false,"cache":true,"userAgent":"gh-act/v1.0.0","apiVersion":"2022-11-28","cacheDir":"${cacheDir}","authTokenFile":".auth-token"}`;
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} user`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act -d user
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} -d user`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = `{"user":false,"output":"v","type":"","debug":true,"cache":true,"userAgent":"gh-act/v1.0.0","apiVersion":"2022-11-28","cacheDir":"${cacheDir}","authTokenFile":".auth-token"}`;
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} -d user`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --user --debug --table --type CreateEvent user
	cmdData = {run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --user --debug --table --type CreateEvent user`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = `{"user":true,"output":"b","type":"CreateEvent","debug":true,"cache":true,"userAgent":"gh-act/v1.0.0","apiVersion":"2022-11-28","cacheDir":"${cacheDir}","authTokenFile":".auth-token"}`;
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'parse'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} --user --debug --table --type CreateEvent user`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST SUITE #4 - Test fetching user
	suiteDesc = 'Test fetching user';
	suites.set(suiteDesc, []);

	// TEST ### - gh-act github
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} github`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = 'https://api.github.com/orgs/github';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchUser'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} github`;

	cmdData.run_before = cmdData.run_after = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} --nocache`);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act essamatefelsherif
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} essamatefelsherif`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = 'https://api.github.com/users/essamatefelsherif';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchUser'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} essamatefelsherif`;

	cmdData.run_before = cmdData.run_after = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} --nocache`);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --debug --user essamatefelsherif
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --debug --user essamatefelsherif`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = 'https://api.github.com/users/essamatefelsherif';
	cmdData.cmd_err = `\
GET /orgs/essamatefelsherif HTTP/1.1\
GET /users/essamatefelsherif HTTP/1.1`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchUser'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} --debug --user essamatefelsherif`;

	cmdData.run_before = cmdData.run_after = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} --nocache`);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act ___
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} ___`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = '';
	cmdData.cmd_err = `\
${CMD}: GitHub user '___' not found
Try '${CMD} --help' for more information.
`;

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchUser'}};
	cmdData.cmd_ext = 1;
	cmdData.cmd_desc = `${CMD} ___`;

	cmdData.run_before = cmdData.run_after = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} --nocache`);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act github // read from cache
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} github`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = 'https://api.github.com/orgs/github';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchUser'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} github // read from cache`;

	cmdData.run_before = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} github`, {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchUser'}});
	}
	cmdData.run_after = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} --nocache`);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act essamatefelsherif // read from cache
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} essamatefelsherif`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = 'https://api.github.com/users/essamatefelsherif';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchUser'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} essamatefelsherif // read from cache`;

	cmdData.run_before = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} essamatefelsherif`, {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchUser'}});
	}
	cmdData.run_after = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} --nocache`);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST SUITE #5 - Test fetching user activities
	suiteDesc = 'Test fetching user activities';
	suites.set(suiteDesc, []);

	// TEST ### - gh-act github
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} github`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = '[object Array]';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchAct'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} github`;

	cmdData.run_before = cmdData.run_after = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} --nocache`);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act essamatefelsherif
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} essamatefelsherif`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = '[object Array]';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchAct'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} essamatefelsherif`;

	cmdData.run_before = cmdData.run_after = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} --nocache`);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act github // read from cache
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} github`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = '[object Array]';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchAct'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} github // read from cache`;

	cmdData.run_before = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} github`, {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchAct'}});
	}
	cmdData.run_after = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} --nocache`);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act essamatefelsherif // read from cache
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} essamatefelsherif`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = '';

	cmdData.cmd_out = '[object Array]';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchAct'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} essamatefelsherif // read from cache`;

	cmdData.run_before = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} essamatefelsherif`, {encoding: 'UTF-8', env: {GH_ACT_TEST: 'fetchAct'}});
	}
	cmdData.run_after = () => {
		execSync(`node ${path.join(__dirname, '../lib/gh-act.js')} --nocache`);
	}

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST SUITE #6 - Test similarity
	suiteDesc = 'Test similarity test';
	suites.set(suiteDesc, []);

	// TEST ### - gh-act --user github
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --user github`;
	cmdData.cmd_exp = `node ${cmdPath} --user github`;
	cmdData.cmd_inp = '';

	cmdData.cmd_out = '';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8'};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} --user github`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act --user essamatefelsherif
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} --user essamatefelsherif`;
	cmdData.cmd_exp = `node ${cmdPath} --user essamatefelsherif`;
	cmdData.cmd_inp = '';

	cmdData.cmd_out = '';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8'};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} --user essamatefelsherif`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act github
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} github`;
	cmdData.cmd_exp = `node ${cmdPath} github`;
	cmdData.cmd_inp = '';

	cmdData.cmd_out = '';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8'};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} github`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - gh-act essamatefelsherif
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${cmdPath} essamatefelsherif`;
	cmdData.cmd_exp = `node ${cmdPath} essamatefelsherif`;
	cmdData.cmd_inp = '';

	cmdData.cmd_out = '';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8'};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `${CMD} essamatefelsherif`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST SUITE #7 - Test class GitHubEvent
	suiteDesc = 'Test class GitHubEvent';
	suites.set(suiteDesc, []);

	// TEST ### - test new GitHubEvent( <PushEvent> )
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${classPath}`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = JSON.stringify({
		id: '45647032891',
		type: 'PushEvent',
		actor: {},
		repo: {	name: 'essamatefelsherif/essamatefelsherif', },
		payload: {size: 1, },
		public: true,
		created_at: '2025-01-17T02:46:38Z'
	});

	cmdData.cmd_out = 'Pushed 1 commit to repository essamatefelsherif/essamatefelsherif';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'testGitHubEvent'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `test new GitHubEvent( <PushEvent> )`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);

	// TEST ### - test new GitHubEvent( <CreateEvent> )
	cmdData = {run_before: null, run_after: null};

	cmdData.cmd_act = `node ${classPath}`;
	cmdData.cmd_exp = '';
	cmdData.cmd_inp = JSON.stringify({
		id: '45951298389',
		type: 'CreateEvent',
		actor: {
			id: 52518661,
			login: 'essamatefelsherif',
			display_login: 'essamatefelsherif',
		},
		repo: { name: 'essamatefelsherif/whatwg-xhr', },
		payload: { ref: 'v1.0.0', ref_type: 'tag'},
		public: true,
		created_at: '2025-01-27T14:54:46Z'
	});

	cmdData.cmd_out = 'Created tag v1.0.0 in repository essamatefelsherif/whatwg-xhr';
	cmdData.cmd_err = '';

	cmdData.cmd_opt = {encoding: 'UTF-8', env: {GH_ACT_TEST: 'testGitHubEvent'}};
	cmdData.cmd_ext = 0;
	cmdData.cmd_desc = `test new GitHubEvent( <CreateEvent> )`;

	cmdData.cmd_skip = false;
	suites.get(suiteDesc).push(cmdData);
}

/**
 * function main()
 * function verifyShellCmd()
 * function loadTestData()
 *     function nodeRunner()
 * function defRunner()
 * async function makeTest()
 * function getCmdOutput()
 * function parseCmdLine()
 * function getHelp()
 * function getError()
 *
 * @func  nodeRunner
 * @param {object} runner - The node core module 'node:test' object.
 * @desc  Carry out the loaded tests using node test runner.
 */
function nodeRunner(runner){

	for(let [suiteDesc, suiteTests] of suites){
		runner.suite(suiteDesc, () => {
			for(let cmdObj of suiteTests){
				runner.test(cmdObj.cmd_desc, {skip: cmdObj.cmd_skip}, async () => {
					await makeTest(cmdObj);
				});
			}
		});
	}
}

/* node:coverage disable */
/**
 * function main()
 * function verifyShellCmd()
 * function loadTestData()
 * function nodeRunner()
 *     function defRunner()
 * async function makeTest()
 * function getCmdOutput()
 * function parseCmdLine()
 * function getHelp()
 * function getError()
 *
 * @func  defRunner
 * @async
 * @desc  Carry out the loaded tests using this developed test runner.
 */
async function defRunner(){

	cmdOptions.verbose && process.on('exit', () => {
		console.log();
		console.log('▶ tests',       --testCount);
		console.log('▶ suites',      suites.size);
		console.log('▶ pass',        passCount);
		console.log('▶ fail',        failCount);
		console.log('▶ cancelled',   cancelCount);
		console.log('▶ skipped',     skipCount);
		console.log('▶ todo',        todoCount);
		console.log('▶ duration_ms', Math.round(Date.now() - startTime));
	});

	cmdOptions.verbose && console.error();
	for(let [suiteDesc, suiteTests] of suites)
		for(let cmdObj of suiteTests)
			if(!cmdObj.cmd_skip)
				await makeTest(cmdObj);

	cmdOptions.verbose && console.log();
}
/* node:coverage enable */

/**
 * function main()
 * function verifyShellCmd()
 * function loadTestData()
 * function nodeRunner()
 * function defRunner()
 *     async function makeTest()
 * function getCmdOutput()
 * function parseCmdLine()
 * function getHelp()
 * function getError()
 *
 * @func  makeTest
 * @async
 * @param {object} obj - The test data object.
 * @desc  Carry out a single test.
 */
async function makeTest(obj){

	const testID   = testCount++;

	let preMsg = `Test#${(testID).toString().padStart(3, '0')} ... `;
	let postMsg = preMsg;

	preMsg += `Initiate ... ${obj.cmd_desc}`;
	cmdOptions.verbose && console.error(preMsg);

	obj.run_before && obj.run_before(obj);

	let [out_act, out_exp, prc_act, prc_exp] = await getCmdOutput(obj);

	if(out_exp === null){
		out_exp = {stdout: obj.cmd_out, stderr: obj.cmd_err};
		prc_exp = {exitCode: obj.cmd_ext};
	}

	if(!cmdOptions.verbose){
		assert.strictEqual(out_act.stdout, out_exp.stdout);
		assert.strictEqual(out_act.stderr, out_exp.stderr);
		assert.strictEqual(prc_act.exitCode, prc_exp.exitCode);

		obj.run_after && obj.run_after(obj);
	}
	else{
		try{
			assert.strictEqual(out_act.stdout, out_exp.stdout);
			assert.strictEqual(out_act.stderr, out_exp.stderr);
			assert.strictEqual(prc_act.exitCode, prc_exp.exitCode);

			obj.run_after && obj.run_after(obj);

			passCount++;

			postMsg += `Success  ... ${obj.cmd_desc}`;
			cmdOptions.verbose && console.error(postMsg);
		}
		catch(e){
			failCount++;

			postMsg += `Failure  ... ${obj.cmd_desc}`;
			cmdOptions.verbose && console.error(postMsg);
		}
	}
}

/**
 * function main()
 * function verifyShellCmd()
 * function loadTestData()
 * function nodeRunner()
 * function defRunner()
 * async function makeTest()
 *     function getCmdOutput()
 * function parseCmdLine()
 * function getHelp()
 * function getError()
 *
 * @func  getCmdOutput
 * @param {object} cmdObj - The test data object.
 * @desc  Carry out a single test.
 */
function getCmdOutput(cmdObj){

	let proc_act, proc_exp;

	let prom_act = new Promise((resolve, reject) => {

		proc_act = exec(cmdObj.cmd_act, cmdObj.cmd_opt, (err, stdout, stderr) => {
			resolve({stdout, stderr});
		});
		proc_act.stdin.write(cmdObj.cmd_inp);
		cmdObj.cmd_signal && proc_act.kill(cmdObj.cmd_signal);
		proc_act.stdin.end();
	});

	if(cmdObj.cmd_exp){

		let prom_exp = new Promise((resolve, reject) => {
			proc_exp = exec(cmdObj.cmd_exp, cmdObj.cmd_opt, (err, stdout, stderr) => {
				resolve({stdout, stderr});
			});
			proc_exp.stdin.write(cmdObj.cmd_inp);
			cmdObj.cmd_signal && proc_exp.kill(cmdObj.cmd_signal);
			proc_exp.stdin.end();
		});

		return Promise.all([prom_act, prom_exp, proc_act, proc_exp]);
	}

	return Promise.all([prom_act, null, proc_act, null]);
}
