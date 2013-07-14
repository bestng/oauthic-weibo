var should = require('should')

var restify = require('restify')

var oauthic = require('../')

var server = restify.createServer()

server.use(restify.queryParser())
server.use(restify.bodyParser({ mapParams: false }))

var token_created_at = Math.round(+new Date() / 1000)
  , token_expires_in = 5 * 60

server.post('/2/protected', function (req, res, next) {
  if ('OAuth2 correct_token' == req.header('authorization')) {
    res.send(200, { 'token': 'correct_token' })
    return next()
  }
  else {
    res.send(400, { 'error': 'unauthorized' })
    return next()
  }
})

server.post('/oauth2/access_token', function (req, res, next) {
  if ( 'correct_client_id' == req.body.client_id
    && 'correct_client_secret' == req.body.client_secret
    && 'authorization_code' == req.body.grant_type
    && 'correct_code' == req.body.code
    && 'correct_redirect_uri' == req.body.redirect_uri ) {
    res.send({
      'access_token': 'correct_token'
    , 'expires_in': token_expires_in
    , 'uid': 12345678
    })
    return next()
  }
  else {
    res.send({
      'error': 'wrong param'
    })
    return next()
  }
})

server.post('/oauth2/get_token_info', function (req, res, next) {
  if ('correct_token' == req.body.access_token) {
    res.send({
      'uid': 12345678
    , 'appkey': 'correct_client_id'
    , 'scope': null
    , 'create_at': token_created_at
    , 'expire_in': token_expires_in
    })
  }
})

describe('oauthic.weibo.test.js', function () {

  before(function (done) {
    server.listen(0, function () {
      oauthic.Client.prototype.BASE_URL = 'http://localhost:'
                                        + server.address().port
                                        + '/2'
      oauthic.Client.prototype.OAUTH2_URL = 'http://localhost:'
                                          + server.address().port
                                          + '/oauth2'
      done()
    })
  })

  after(function () {
    server.close()
  })

  describe('lib', function () {
    describe('oauthic.client(clientInfo)', function () {

      it('should return new instance of oauthic.Client', function () {
        oauthic.client().should.be.an.instanceof(oauthic.Client)
      })

      it('should pass `clientInfo` to the new instance as a parameter', function () {
        var client = oauthic.client({ this_is: 'a_test_param'})
        should.exists(client)
        client.should.have.property('clientInfo')
        client.clientInfo.should.have.property('this_is', 'a_test_param')
      })

      it('should always create a new instance', function () {
        var instanceA = oauthic.client().token('token_a')
          , instanceB = oauthic.client()

        should.exists(instanceA)
        should.exists(instanceB)

        instanceA.accessToken.should.not.equal(instanceB.accessToken)
      })

      describe('client.authorize([options])', function () {

        var client = oauthic.client({
          clientId: 'correct_client_id'
        , redirectUri: 'correct_redirect_uri'
        })

        var parse = require('querystring').parse

        it('should returns correct authorize url with options', function () {
          var url = client.authorize({
            scope: ['profile', 'message']
          , state: 'test'
          , display: 'wap'
          , forcelogin: true
          , language: 'en'
          })

          url.should.be.a('string')

          var search = url.indexOf('?')
          search.should.above(0)

          var query = parse(url.slice(search + 1))
          query.should.have.property('client_id', 'correct_client_id')
          query.should.have.property('redirect_uri', 'correct_redirect_uri')
          query.should.have.property('scope', 'profile,message')
          query.should.have.property('state', 'test')
          query.should.have.property('display', 'wap')
          query.should.have.property('forcelogin', 'true')
          query.should.have.property('language', 'en')
        })

        it('should returns correct authorize url without options', function () {
          var url = client.authorize()

          url.should.be.a('string')

          var search = url.indexOf('?')
          search.should.above(0)

          var query = parse(url.slice(search + 1))
          query.should.have.property('client_id', 'correct_client_id')
          query.should.have.property('redirect_uri', 'correct_redirect_uri')
          query.should.not.have.property('scope')
          query.should.not.have.property('state')
          query.should.not.have.property('display')
          query.should.not.have.property('forcelogin')
          query.should.not.have.property('language')
        })

      })

      describe('client.credentical(code, callback)', function () {

        !(function () {
          var client = oauthic.client({
            clientId: 'correct_client_id'
          , clientSecret: 'correct_client_secret'
          , redirectUri: 'correct_redirect_uri'
          })

          it('should callback `credentical` and `userInfo` if success', function (done) {
            client.credentical('correct_code', function (err, credentical, userInfo) {
              should.not.exist(err)

              should.exist(credentical)
              should.exist(credentical.accessToken)
              should.exist(credentical.expiresAt)

              should.exist(userInfo)
              should.exist(userInfo.id)
              should.exist(userInfo.picture)

              done()
            })
          })

          it('should set `client.accessToken` after success', function () {
            client.should.have.property('accessToken', 'correct_token')
          })
        })()

        it('should fails if the api returns an error', function (done) {
          var client = oauthic.client()
          client.credentical('correct_code', function (err, credentical, userInfo) {
            should.exist(err)
            done()
          })
        })

        it('should fails if the request occurs an error', function (done) {
          var client = oauthic.client()
          client.OAUTH2_URL = 'http://localhost:2'
          client.credentical('correct_code', function (err, credentical, userInfo) {
            should.exist(err)
            done()
          })
        })

      })

      describe('client.token(accessToken[, expiresAt])', function () {

        var client = oauthic.client()

        it('should set `client.accessToken`', function () {
          client.token('token_for_test')
          client.should.have.property('accessToken', 'token_for_test')
        })

      })

      describe('client.expired(onExpired)', function () {

        it('should call `onExpired` if expired when request', function (done) {
          var i = 1

          var client = oauthic.client()
          client.token('expired_token', (token_created_at - 60) * 1000)
          client.expired(function () {
            i.should.equal(2)
            done()
          })

          i = 2

          client.post('/protected', function (err, res, body) {})
        })

      })

      describe('client.post(uri[, options][, callback])', function () {

        it('should callbacks `oauthic.TokenExpiredError` if expired', function (done) {
          var client = oauthic.client()
          client.token('expired_token', (token_created_at - 60) * 1000)
          client.post('/protected', function (err, res, body) {
            should.exist(err)
            err.should.be.an.instanceof(oauthic.TokenExpiredError)

            should.exist(err.token)
            err.token.should.equal('expired_token')

            done()
          })
        })

      })
    })

    describe('oauthic.TokenExpiredError', function () {

      it('should has property `token`', function () {
        var err = new oauthic.TokenExpiredError('the_token')
        err.should.have.property('token', 'the_token')
      })

      it('should trust last parameter as `token`', function () {
        var err = new oauthic.TokenExpiredError(1, 2, 3, 4, 5, 'the_token')
        err.should.have.property('token', 'the_token')
      })

    })
  })

  describe('oauth2', function () {

    var client = oauthic.client({
      clientId: 'correct_client_id'
    , clientSecret: 'correct_client_secret'
    , redirectUri: 'correct_redirect_uri'
    })

    it('should request without token before authorize', function (done) {
      client.post('/protected', function (err, res, body) {
        res.should.be.json
        should.not.exist(err)
        should.exist(body)
        body.should.have.property('error', 'unauthorized')
        done()
      })
    })

    it('should authorize with code', function (done) {
      client.credentical('correct_code', function (err, credentical, userInfo) {
        should.not.exist(err)
        credentical.accessToken.should.equal('correct_token')

        var expiresAt = +credentical.expiresAt
        expiresAt.should.equal(token_created_at * 1000
                             + token_expires_in * 1000)
        done()
      })
    })

    it('should request with token after authorized', function (done) {
      client.post('/protected', function (err, res, body) {
        res.should.be.json
        should.not.exist(err)
        should.exist(body)
        body.should.have.property('token', 'correct_token')
        done()
      })
    })

  })
})
