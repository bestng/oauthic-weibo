var oauthic = require('oauthic')

var request = require('request')
  , async = require('async')
  , inherits = require('util').inherits
  , stringify = require('querystring').stringify

exports.client = function (clientInfo) {
  return new Client(clientInfo)
}

function Client (clientInfo) {
  oauthic.Client.apply(this, arguments)
}

inherits(Client, oauthic.Client)
exports.Client = Client

Client.prototype.BASE_URL = 'https://api.weibo.com/2'
Client.prototype.OAUTH2_URL = 'https://api.weibo.com/oauth2'

Client.prototype._authorize = function (clientInfo, options) {
  this.clientInfo = this.clientInfo || {}
  options = options || {}

  var query = {}

  query['client_id'] = clientInfo.clientId
  query['redirect_uri'] = clientInfo.redirectUri

  if (options.scope) {
    query['scope'] = Array.isArray(options.scope)
                    ? options.scope.join(',')
                    : options.scope
  }

  if (options.state) {
    query['state'] = String(options.state)
  }

  if (options.display) {
    query['display'] = options.display
  }

  if (options.forcelogin) {
    query['forcelogin'] = 'true'
  }

  if (options.language) {
    query['language'] = options.language
  }

  return this.OAUTH2_URL + '/authorize?' + stringify(query)
}

Client.prototype._credentical = function (code, callback) {
  var self = this

  self.clientInfo = self.clientInfo || {}

  async.waterfall([
    function (next) {
      request.post(self.OAUTH2_URL + '/access_token', {
        form: {
          'client_id': self.clientInfo.clientId
        , 'client_secret': self.clientInfo.clientSecret
        , 'redirect_uri': self.clientInfo.redirectUri
        , 'grant_type': 'authorization_code'
        , 'code': code
        }
      }, function (err, res, body) {
        if (err) {
          return next(err)
        }

        var json
        try {
          json = JSON.parse(body)
        }
        catch (e) {
          return next(e)
        }

        if (json.error) {
          return next(json)
        }

        var credentical = {
          accessToken: json.access_token
        }

        return next(null, credentical)
      })
    }
  , function (credentical, next) {
      request.post(self.OAUTH2_URL + '/get_token_info', {
        form: {
          'access_token': credentical.accessToken
        }
      }, function (err, res, body) {
        if (err) {
          return next(err)
        }

        var json
        try {
          json = JSON.parse(body)
        }
        catch (e) {
          return next(e)
        }

        if (json.error) {
          return next(json)
        }

        credentical.expiresAt = new Date((json.create_at + json.expire_in) * 1000)

        var userInfo = {
          id: json.uid
        , picture: 'http://tp1.sinaimg.cn/' + json.uid + '/180/0/1'
        }

        return next(null, credentical, userInfo)
      })
    }
  ], callback)
}

Client.prototype._refresh = function (refreshToken, callback) {
  // 微博不支持 Refresh Token
  // 所以这里啥都没有
  callback(new Error('Refresh Token is not suppported by Weibo.'))
}

Client.prototype._use = function (options) {
  options.headers = options.headers || {}

  if (this.accessToken) {
    options.headers['Authorization'] = ['OAuth2', this.accessToken].join(' ')
  }

  return options
}

exports.TokenExpiredError = oauthic.TokenExpiredError
