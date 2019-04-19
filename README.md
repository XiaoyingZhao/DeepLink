# DeepLink

## 什么是deepLink
##### scheme(原始唤起码)+Universal Links(通用链接)+下载后通过设备指纹识别唤起客户端指定页

### deepLink起源
起源就是领导说要做一套可以无缝唤起客户端的系统，如果完不成就要用第三方的系统，但是我们已经完成了scheme(原始唤起码)+Universal Links(通用链接)，只剩下载后通过设备指纹识别唤起客户端指定页，我们能妥协吗，当然不行！

---
### 实现方式

#####  ios9-，H5与客户端通信方式为scheme
* 协议形式为miaopai:// ，这样的唤起码浏览器不会识别，只有客户端可以识别，浏览器不会报错
* 所以为了达到唤起不成功可以下载的功能，页面做了在唤起码执行完成2s后定时执行下载或者一些别的操作（跳转到指定H5……）
##### ios9+,H5与客户端通信方式为scheme或者通用链接

```
 什么是通用链接(Universal Links)？
 Apple 为了大力推动 APP 开发者在深层链接上有更好的体验。 推出通用链接：一种能够方便的通过传统 HTTP 链接来启动 APP, 使用相同的网址打开网站和APP。
```
* 协议形式为https://app.yixia.com,这样的唤起码浏览器和APP都会识别，跳转方式为：

    * 已安装客户端会直接识别唤起码
    * 未安装客户端会跳转至通用链接指定页（中转页）
* 客户端与Safari之间的通信方式
    * 客户端点击右上角yixia.com在Safari中打开
    * Safari下拉页面在客户端中打开
    * 手机会默认记住这种选择作为偏好操作
    

### 下载后通过设备指纹识别唤起客户端指定页



#### IOS Android下载后唤起指定页
没安装的情况下，点击任意唤起链接，即种植当前链接到服务端，8分钟内下载完成并唤起之后即可自动跳转到已种植的站内页面（仅限于下载后第一次启动）

---
#### IOS Android下载后唤起指定页用到的参数和流程

* h5页下载之前将以下参数种植到接口中(类似于一个.json文件)，IOS如下

```javascript

   {
    "width" : 手机屏幕宽度 [ 320 || 375 || 414 ],
    "height" : 手机屏幕高度 [ 568 || 667 || 736 ],
    "os" : 手机系统 [ iphone os 9_1 ], //统一小写
    "time" : 当前时间戳,
    "ip":111.202.106.229,
    "code" : h5页面传给客户端的参数（唤起码）
  }
  /** h5页面的os来自当前浏览器的navigator.userAgent值，
    "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
    */

```
* Android统一在下载之前种植

```javascript
android:
{
    "width":  1,
    "height":  1,
    "os": 安卓的设备号 [ m1-note ],//统一小写，空格变-
    "time" : 当前时间戳,
    "ip":111.202.106.229,
    "code": h5页面传给客户端的参数（唤起码）
}
/** h5页面的os来自当前浏览器的navigator.userAgent值，
    "Mozilla/5.0 (Linux; Android 5.1; MZ-m1 note Build/LMY47D) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/45.0.2454.94 Mobile Safari/537.36"
    三星和魅族手机去前缀，统一小写，空格变-：
    MZ-m1 note => m1-note
```



* 种植成功之后，首次唤起客户端发送相同参数到服务端进行比对，如完全一致则发送code至客户端进行跳转操作（测试包新唤起会进行如上操作）


   