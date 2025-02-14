/**
 * @module  github-event
 * @desc    A module to define GitHubEvent class.
 * @version 1.0.0
 * @author  Essam A. El-Sherif
 */

/**
 * @name Test
 * @func
 * @desc Self running expression for testing purpose.
 */
(() => {
	if(process.env.GH_ACT_TEST === 'testGitHubEvent'){
		let input = '';

		process.stdin.on('data', (chunk) => {
			input += chunk;
		});

		process.stdin.on('end', () => {
			let event = new GitHubEvent(JSON.parse(input));
			process.stdout.write(event.phrase);
		});
	}
})('Test Function');

/**
 * @class  GitHubEvent
 * @static
 * @desc   A class to represent a GitHub event.
 * @see    {@link https://docs.github.com/en/rest/using-the-rest-api/github-event-types GitHub event types}
 */
export class GitHubEvent{

	/**
	 * @method   constructor
	 * @instance
	 * @memberof module:github-event.GitHubEvent
	 * @param    {object} obj - Object that respresents a GitHub event.
	 * @return   {object} GitHubEvent object.
	 * @desc     Constructs a new GitHubEvent object.
	 */
	constructor(obj){

		/** @member {integer} id - The unique identifier for the event. */
		this['id'] = obj['id'];

		/** @member {string} type - Type of event. Events uses PascalCase for the name. */
		this['type'] = obj['type'];

		/** @member {object} actor -  User that triggered the event. */
		this['actor'] = Object.assign({}, obj['actor']);

		/** @member {object} repo - Repository object where the event occurred. */
		this['repo'] = Object.assign({}, obj['repo']);

		/** @member {object} payload - Payload object is unique to the event type. */
		this['payload'] = Object.assign({}, obj['payload']);

		/** @member {boolean} public - Whether the event is visible to all users. */
		this['public'] = obj['public'];

		/** @member {string} created_at - Date and time when the event was triggered formatted according to ISO 8601. */
		this['created_at'] = obj['created_at'];

		/** @member {object} org - (Optional) Organization that was chosen by the actor to perform action that triggers the event. */
		this['org'] = Object.assign({}, obj['org']);
	}

	/**
	 * @member   {string} phrase
	 * @memberof module:github-event.GitHubEvent
	 * @readonly
	 * @instance
	 * @desc     Describe the GitHubEvent.
	 */
	get phrase(){

		switch(this.type){
			case 'CommitCommentEvent':
				return `${this._toCamelCase(this.payload.action)} a commit comment in repository ${this.repo.name}`;
			case 'CreateEvent':
				return `Created ${this.payload.ref_type === 'repository' ? '' : this.payload.ref_type + ' ' + this.payload.ref + ' in '}repository ${this.repo.name}`;
			case 'DeleteEvent':
				return `Deleted ${this.payload.ref_type + ' ' + this.payload.ref + ' in '}repository ${this.repo.name}`;
			case 'ForkEvent':
				return `Forked repository ${this.repo.name}`;
			case 'GollumEvent':
				return `Created or Updated a Wiki page for repository ${this.repo.name}`;
			case 'IssueCommentEvent':
				return `${this._toCamelCase(this.payload.action)} a comment on an issue in repository ${this.repo.name}`;
			case 'IssuesEvent':
				return `${this._toCamelCase(this.payload.action)} an issue in repository ${this.repo.name}`;
			case 'MemberEvent':
				return `Added a member to or edited a member permissions for collaborators of repository ${this.repo.name}`;
			case 'PublicEvent':
				return `Private repository ${this.repo.name} is made public.`;
			case 'PullRequestEvent':
				return `${this._toCamelCase(this.payload.action)} a pull request in repository ${this.repo.name}`;
			case 'PullRequestReviewEvent':
				return `${this._toCamelCase(this.payload.action)} a pull request review in repository ${this.repo.name}`;
			case 'PullRequestReviewCommentEvent':
				return `${this._toCamelCase(this.payload.action)} a pull request review comment in repository ${this.repo.name}`;
			case 'PullRequestReviewThreadEvent':
				return `${this._toCamelCase(this.payload.action)} a pull request review thread in repository ${this.repo.name}`;
			case 'PushEvent':
				return `Pushed ${this.payload.size} commit${this.payload.size === 1 ? '' : 's'} to repository ${this.repo.name}`;
			case 'ReleaseEvent':
				return `${this._toCamelCase(this.payload.action)} repository ${this.repo.name}`;
			case 'SponsorshipEvent':
				return `SponsorshipEvent pertaining to ${this.repo.name}`;
			case 'WatchEvent':
				return `Starred repository ${this.repo.name}`;
			default:
				return '';
		}
	}

	_toCamelCase(str){
		return str[0].toUpperCase() + str.substring(1);
	}
}
