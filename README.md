OAuthic Weibo
==========

授权：

```js
require('weibo').client(clientInfo)
                .credentical(code, function (err, credentical, userInfo) {
                  // ...
                })
```

请求：

```js
var weibo = require('weibo').client(clientInfo)
                            .token(accessToken, expiresAt)
                            .refresh(refreshToken, saveRefreshToken)
                            .expired(onExpired)

weibo.get('/statuses/user_timeline.json', function (err, timeline) {
  // ...
})
```

## weibo.client(clientInfo)

创建一个客户端对象。

参数：

- **clientInfo** Object - 客户端信息
    - **clientId** String - App Key
    - **clientScrect** String - App Secret
    - **callbackUri** String - 授权回调页面的 URL

返回：

- weibo.Client - 客户端实例

## Class: weibo.Client

客户端，一个经过改造的 [mikeal/request](https://github.com/mikeal/request) 实例。

### client.authorize([options])

返回授权页面 URL。

参数：

- ***options*** - 附加选项
    - ***scope*** String | Array - 附加权限。可以是 Array 或者以逗号 `,` 分隔的 String
    - ***state*** String - 会被传递到 `redirectUri` 的参数，建议合理使用以防范 CSRF 攻击
    - ***display*** String - 授权页面显示类型，可取值：
        - default - 默认，适用于桌面浏览器
        - mobile - 适用于智能手机
        - wap - 适用于只支持 WAP 的非智能手机
        - client - 适用于桌面客户端
    - ***forcelogin*** Boolean - 是否强制用户重新登录
    - ***language*** String - 授权页语言，`en` 为英文。

返回：

- String - 微博授权页面的 URL

### client.credentical(code, callback)

使用 Authorization Code 换取 Access Token 并准备好发起请求。

参数：

- **code** String - Authorization Code
- **callback(err, credentical, userInfo)** Function - 回调
    - **err** Error | null - 错误对象
    - **credentical** Object - Token 信息
        - **accessToken** String - Access Token
        - ***refreshToken*** String - 可选，Refresh Token，如果不支持刷新则没有此字段
        - **expiresAt** Date - Access Token 的过期时间
    - **userInfo** Object - 其它用户信息
        - **id** String - 用户在该平台的唯一标识符
        - **picture** String - 用户头像地址
        - ...

返回：

- weibo.Client - 客户端实例

### client.token(accessToken[, expiresAt])

设置 Access Token。

参数：

- **accessToken** String - Access Token
- ***expiresAt*** Date | Number - 可选，Access Token 的过期时间

返回：

- weibo.Client - 客户端实例

### client.refresh(refreshToken, onRefreshed)

设置 Refresh Token。

参数：

- **refreshToken** String - Refresh Token
- **onRefreshed(token, expiresAt, done)** - 当 Access Token 成功刷新时会被调用
    - **token** String - 新的 Access Token
    - **expiresAt** Date - 新 Token 的过期时刻
    - **done(err)** Function - 处理完后的回调
        - **err** Error | null - 如果有错可返回

返回：

- weibo.Client - 客户端实例

### client.expired(onExpired)

用于当 Token 过期并且无法刷新时的处理。

参数：

- **onExpired(token)** Function - 处理函数
    - **token** String - 已过期的 Access Token

### client(uri[, options][, callback])
### client.get(uri[, options][, callback])
### client.post(uri[, options][, callback])
### client.put(uri[, options][, callback])
### client.patch(uri[, options][, callback])
### client.head(uri[, options][, callback])
### client.del(uri[, options][, callback])

基础库 [mikeal/request](https://github.com/mikeal/request) 中经过处理的方法，自动添加了 Access Token 等必备参数，以及能够将 URL 如 `https://api.weibo.com/2/statuses/update.json` 简写为 `/statuses/update.json`。

错误：

- weibo.TokenExpiredError - Access Token 已过期并且无法刷新。

### client.accessToken

- String

返回用户的 Access Token。通常用于需要自己构建请求的情况。

## weibo.TokenExpiredError

当 Access Token 已过期并且无法刷新时抛出的错误。

属性：

- **token** String - 已过期的 Access Token

## weibo.authorize(clientInfo, [options])

用于被 `weibo.Client` 调用生成授权页面 URL。

参数：

- **clientInfo** Object - 客户端信息
    - **clientId** String - App Key
    - **callbackUri** String - 授权回调页面的 URL
- ***options*** - 附加选项
    - ***scope*** String | Array - 附加权限。可以是 Array 或者以逗号 `,` 分隔的 String
    - ***state*** String - 会被传递到 `redirectUri` 的参数，建议合理使用以防范 CSRF 攻击
    - ***display*** String - 授权页面显示类型，可取值：
        - default - 默认，适用于桌面浏览器
        - mobile - 适用于智能手机
        - wap - 适用于只支持 WAP 的非智能手机
        - client - 适用于桌面客户端
    - ***forcelogin*** Boolean - 是否强制用户重新登录
    - ***language*** String - 授权页语言，`en` 为英文。

返回：

- String - 微博授权页面的 URL

## weibo.credentical(clientInfo, code, callback)

用于被 `weibo.Client` 调用获取 Token 和用户信息的方法。

参数：

- **clientInfo** Object - 客户端信息
    - **clientId** String - App Key
    - **clientScrect** String - App Secret
    - **callbackUri** String - 授权回调页面的 URL
- **code** String - Authorization Code
- **callback(err, credentical, userInfo)** Function - 回调
    - **err** Error | null - 错误对象
    - **credentical** Object - Token 信息
        - **accessToken** String - Access Token
        - ***refreshToken*** String - 可选，Refresh Token，如果不支持刷新则没有此字段
        - **expiresAt** Date - Access Token 的过期时间
    - **userInfo** Object - 其它用户信息
        - **id** String - 用户在该平台的唯一标识符
        - **picture** String - 用户头像地址
        - ...

## weibo.refresh(clientInfo, refreshToken, callback)

用于被 `weibo.Client` 调用刷新 Access Token 的方法。

参数：

- **clientInfo** Object - 客户端信息
    - **clientId** String - App Key
    - **clientScrect** String - App Secret
    - **callbackUri** String - 授权回调页面的 URL
- **refreshToken** - Refresh Token
- **callback(err, credentical)** Function - 回调
    - **err** Error | null - 错误对象
    - **credentical** Object - Token 信息
        - **accessToken** String - 新的 Access Token
        - **expiresAt** Date - Access Token 的过期时间
