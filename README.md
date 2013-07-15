![OAuthic for Weibo APIs](logo.png)

[![Build Status](https://travis-ci.org/bestng/oauthic-weibo.png?branch=master)](https://travis-ci.org/bestng/oauthic-weibo)
[![Coverage Status](https://coveralls.io/repos/bestng/oauthic-weibo/badge.png)](https://coveralls.io/r/bestng/oauthic-weibo)
[![Dependency Status](https://david-dm.org/bestng/oauthic-weibo.png)](https://david-dm.org/bestng/oauthic-weibo)
[![NPM version](https://badge.fury.io/js/oauthic-weibo.png)](http://badge.fury.io/js/oauthic-weibo)

Yet another beautiful wrapped [mikeal/request](https://github.com/mikeal/request) with OAuth 2.0 feature for Sina Weibo.

## Install

```sh
npm install oauthic-weibo
```

## Quick-start

Authorize:

```js
require('oauthic-weibo')
  .client(clientInfo)
  .credentical(code, function (err, credentical, userInfo) {
    // ...
  })
```

Request:

```js
var client = require('oauthic-weibo').client(clientInfo)
  .token(accessToken, expiresAt)
  .expired(onExpired)

client.get('/statuses/user_timeline.json', function (err, res, timeline) {
  // ...
})
```

## oauthic.client(clientInfo)

Create a new client instance.

Arguments:

- **clientInfo** Object - Client informations
    - **clientId** String - App Key
    - **clientScrect** String - App Secret
    - **callbackUri** String - URL to be redirected to by the provider.

Returns:

- oauthic.Client - Client instance

## Class: oauthic.Client

Client, a wrapped [mikeal/request](https://github.com/mikeal/request) instance.

### client.authorize([options])

Build the URL of the authorization page.

Arguments:

- ***options*** - Additional parameters
    - ***scope*** String | Array - Additional scopes. Should be an array or a string separated by `,`
    - ***state*** String - A parameter that would be in the query string in `redirectUri`. It's useful in avoiding CSRF attacking
    - ***display*** String - Determine how the authorization page would looks. Should be:
        - default - For desktop browsers
        - mobile - For mobile devices
        - wap - For cellphones that support WAP only
        - client - For desktop clients
    - ***forcelogin*** Boolean - Determine whether to force a login.
    - ***language*** String - Language of the authorization page. Would be Simplified-Chinese without this parameter. For English set it to `en`.

Returns:

- String - URL of the authorization page

### client.credentical(code, callback)

Get Access Token with an Authorization Code and get ready for making a request.

Arguments:

- **code** String - Authorization Code
- **callback(err, credentical, userInfo)** Function - Callback
    - **err** Error | null - Error object
    - **credentical** Object - Token informations
        - **accessToken** String - Access Token
        - **expiresAt** Date - The time when Access Token expires
    - **userInfo** Object - Additional user informations
        - **id** String - The user's unique ID
        - **picture** String - The URL of user's avatar picture
        - ...

Returns:

- oauthic.Client - Client instance

### client.token(accessToken[, expiresAt])

Set the Access Token.

Arguments:

- **accessToken** String - Access Token
- ***expiresAt*** Date | Number - Optional. The time when Access Token expires

Returns:

- oauthic.Client - Client instance

### client.expired(onExpired)

Registers a handler that would be called when the Access Token is expired and could not be refreshed.

Arguments:

- **onExpired(token)** Function - Handler function
    - **token** String - The expired Access Token

### client.get(uri[, options][, callback]), client.post(uri[, options][, callback])

Wrapped methods from [mikeal/request](https://github.com/mikeal/request). General parameters (e.g. access token) is added. URL could be written in short form, e.g. `/statuses/update.json` for `https://api.weibo.com/2/statuses/update.json`.

Actually, Sina Weibo supports GET and POST only, so other methods is not tested or documented.

Errors:

- oauthic.TokenExpiredError - The Access Token is expired and could not be refreshed

### client.accessToken

- String

Returns the current user's Access Token. Useful when you'd prefer building request parameters manually.

## oauthic.TokenExpiredError

Occurs when the Access Token is expired and could not be refreshed.

Properties:

- **token** String - The expired Access Token

## License

(The MIT License)

Copyright (c) 2013 XiNGRZ &lt;chenxingyu92@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
