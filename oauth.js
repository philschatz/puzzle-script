const _ = require('koa-route')
const queryString = require('query-string');
const axios = require('axios');
const sha1 = require('sha1')
const GitHubApi = require('@octokit/rest');

const SignedParams = require('./signed-params');

const pendingGames = new Map()

module.exports = (app) => {

  // This is the part that does the GitHub login
  app.use(_.post('/share', async (ctx) => {
    // should persist state in persistent session store
    const game = ctx.request.body.code
    console.log(game, 'The Game Gist Data')
    const pendingGameKey = sha1(JSON.stringify(game))
    pendingGames.set(pendingGameKey, game)

    const state = await (new SignedParams({pendingGameKey})).stringify()
    const params = {
      state,
      scope: 'gist',
      client_id: process.env.GITHUB_CLIENT_ID,
    };
    ctx.response.redirect(`https://github.com/login/oauth/authorize?${queryString.stringify(params)}`);

  }))

  app.use(_.get('/github/oauth/callback', async (ctx) => {

    // @todo: handle condition where state is expired or has been tampered with
    const state = await SignedParams.load(ctx.request.query.state);

    console.log({ state }, 'Restoring state to authenticate user');

    // complete OAuth dance
    const accessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: ctx.request.query.code,
        state: ctx.request.query.state,
      },
    );
    console.debug(accessTokenResponse.data, 'Exchanged code for access token');
    const accessToken = queryString.parse(accessTokenResponse.data).access_token;

    const github = new GitHubApi({ logger: console.log.bind(console) });

    // look up user to get id
    github.authenticate({
      type: 'token',
      token: accessToken,
    });
    const user = (await github.users.get({})).data.login;

    console.log(user, 'Authenticated as user!')

    const game = pendingGames.get(state.pendingGameKey)
    console.log('Creating Gist')

    // Create the gist on gist.github.com
    const {data: gist} = await github.gists.create({
  		description : "PuzzleScript Game",
  		public : true,
  		files: {
  			"readme.txt" : {
  				"content": "Play this game by pasting the script in http://www.puzzlescript.net/editor.html"
  			},
  			"script.txt" : {
  				"content": game
  			}
  		}
  	})

    console.log(gist.id, 'Created Gist')
    // Redirect to let the user play the game, and copy the URL
    ctx.response.redirect(`/play.html?p=${gist.id}`)

  }));

};
