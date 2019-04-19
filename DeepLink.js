const ua = window.navigator.userAgent
const pf = window.navigator.platform
const isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1
const isWeibo = ua.toLowerCase().match(/weibo/i) == "weibo"
const isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
const requestAnimationF = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
class DeepLink {
  constructor () {
    this.isWxOrQQ = this.isWxOrQQFn()
    this.startTime = null
    this.openTimer = null
  }

  isWxOrQQFn () {
    return isIOS ? (ua.match(/MicroMessenger/i) == "micromessenger" || ua.toLowerCase().match(/QQ/i) == "qq") : (ua.toLowerCase().match(/MicroMessenger/i) == "micromessenger")
  }
  
  getAndroidVersion () {
    return ua.substr(ua.indexOf('Andriod') + 8, 3)
  }

  getIOSVersion () {
    let reg = /OS ((\d+_?){2,3})\s/;
    if (ua.match(/iPad/i) || pf.match(/iPad/i) || ua.match(/iP(hone|od)/i) || pf.match(/iP(hone|od)/i)) {
      let osv = reg.exec(navigator.userAgent);
      console.log(osv);
      
      if (osv.length > 0) {
        return parseInt(osv[0].replace('OS', '').replace('os', '').replace(/\s+/g, '').replace(/_/g, '.').split('.')[0]);
      }
    }
    return ''
  }

  openInWxOrQQ ( defaultPara ) {
    let uri, ecduri
    let iOSversion = this.getIOSVersion()
    if (isIOS) {
      uri = defaultPara['uri'].ios;

      if (iOSversion >= 9) {
        ecduri = encodeURI(defaultPara['uri'].ios)
        window.location.href = defaultPara['prefix'] + ecduri
      }

    }else{
      window.location.href = defaultPara['downLink']
    }
    this.download(defaultPara)
    // 下载之后回调函数（统计）
    setTimeout(function () {
      if (!!defaultPara['fn'] && (typeof defaultPara['fn'] == "function")) {
        defaultPara['fn']()
      }
    }, 0);
    return;
  }

  download () {
    if (!!this.requestAnimationF) {
      // 起始时间
      this.startTime = Date.now()
      console.log(this.requestAnimationF);
      this.openTimer = requestAnimationF(()=>{this.openLink()})
    } else {
      setTimeout(() => {
        if (!this.defaultPara['isInside']) {
          window.location.href = this.defaultPara['downLink']
        }
      }, 2000)
    }
  }

  openH5 (redirectURI) {
    window.location.href = redirectURI
  }

  openLink () {
    const IOSversion = this.getAndroidVersion()
    let timestamp = Date.now()
    let diff = timestamp - this.startTime
    if (IOSversion <= 9) return
    if (diff > 2000 && diff < 3500) {
      if (!this.defaultPara['isInside']) {
        window.location.href = this.defaultPara['downLink']
      }
    } else if (diff < 3500) {
      //递归循环
      this.openTimer = requestAnimationF(()=>{this.openLink()})
    } else {
      return
    }
  }

  isEmptyObject (obj) {
    for (let key in obj){
      return false
    }
    return true
  }

  isPlant (defaultPara) {
    const downAwake = new DownAwake()
    let ecduri = isIOS ? encodeURI(defaultPara['uri'].ios) : encodeURI(defaultPara['uri'].android)
    if (defaultPara['plantSwitch']){
      downAwake.h5ToApp({
        plantAddr: defaultPara['plantAddr'],
        plantTye: defaultPara['plantType'],
        plantScheme: encodeURIComponent(ecduri)
      })
    }
  }

  open (defaultPara) {
    this.defaultPara = defaultPara
    console.log(this.defaultPara)
    let ecduri
    defaultPara['isInside'] = defaultPara['isInside'] || false

    if (this.isEmptyObject(defaultPara['uri'])) {
      return
    }

    if (!!defaultPara['uri'].h5 && (!defaultPara['uri'].ios && !defaultPara['uri'].android)) {
      this.openH5(defaultPara[uri].h5)
      return
    }

    if (defaultPara['uri'] != null) {

      if (this.isWxOrQQ) {
        // ios(wx,qq)将链接存到接口，唤起后提供
        this.getIOSVersion() < 9 && this.isPlant(defaultPara)
        this.openInWxOrQQ(defaultPara)
        return
      }
        console.log(ua)

      if (isIOS) {
        ecduri = encodeURI(defaultPara['uri'].ios)

        if (defaultPara['isInside']) {
          window.location.href = ecduri
          return
        }

        if (this.getIOSVersion() >= 9) {
          window.location.href = defaultPara['prefix'] + ecduri
        } else {
          window.location.href = ecduri
          // ios9-将链接存到接口，唤起后提供
          this.isPlant(defaultPara)
        }

        if (!!defaultPara['uri'].h5) {
          setTimeout(() => {
            this.openH5(defaultPara['uri'].h5)
          }, 2000)
          return
        }
        this.download(defaultPara)
        setTimeout(() => {
          if (!!defaultPara['fn'] && (typeof defaultPara['fn'] == 'function')) {
            defaultPara['fn']()
          }
        }, 0)
        return
      
      } else if (isAndroid) {
        ecduri = encodeURI(defaultPara['uri'].android)

        if (defaultPara['isInside']) {
          window.location.href = ecduri
        } else {
          if (this.getAndroidVersion() >= 5 && !isWeibo) {

            if (!isWeibo && !(ua.toLowerCase().match(/MicroMessenger/i == 'micromessenger') || ua.toLowerCase().match(/QQ/i) == "qq") && !!(ua.toLowerCase().match(/samsung sm/i) || ua.toLocaleLowerCase().match(/sm/i))) {
              let ifr = document.createElement('iframe')
              ifr.src = ecduri
              ifr.style.display = 'none'
              document.body.appendChild(ifr)
            } else {
              window.location.href = ecduri
            }

          } else {
            let ifr = document.createElement('iframe')
            ifr.src = ecduri
            ifr.style.display = 'none'
            document.body.appendChild(ifr)
          }
          // Android链接种植
          this.isPlant(defaultPara)

        }

        if (!!defaultPara['uri'].h5 && !defaultPara['isInside']) {
          setTimeout(() => {
            this.openH5(defaultPara['uri'].h5)
          }, 2000)
          return
        }

        if (!document.webkitHidden && !defaultPara['isInside']) {
          this.download(defaultPara)
          setTimeout(() => {
            if (!!defaultPara['fn'] && (typeof defaultPara['fn'] == 'function')) {
              defaultPara['fn']()
            }
          }, 0)
        }
        return

      } else {
        if (!defaultPara['uri'].h5) return
        this.openH5(defaultPara['uri'].h5)
      }

    } else {
      return false
    }
    
  }
  
}

class DownAwake{
  constructor () {
    // return this.h5ToApp
  }

  getAndroidDevice () {
    let reg = /mz|samsung/
    let lastIndex = ua.indexOf('Build')
    let firstIndex = ua.lastIndexOf(';',lastIndex) + 1
    let device = ua.substring(firstIndex, lastIndex).trim().toLowerCase().split('/')[0].split(' ').join('-')
    let devicePrefix = device.match(reg) ? device.match(reg) : ''

    devicePrefix ? device = device.replace(devicePrefix + '-', '') : ''
    return device
  }

  getUnderIOS9Version () {
    let reg = /iPhone OS ((\d+_?){2,3})/
    if (ua.match(/iPad/i) || pf.match(/iPad/i) || ua.match(/iP(hone|od)/i) || pf.match(/iP(hone|od)/i)) {
      let osv = reg.exec(ua)
      if (!!osv && osv.length > 0) {
        return osv[0].toLowerCase()
      }
    }
    return ''
  }

  h5ToApp (para) {
    var data = {
      "width": isIOS ? screen.width : 1,
      "height": isIOS ? screen.height : 1,
      "os": isIOS ? this.getUnderIOS9Version() : this.getAndroidDevice(),
      "type": para['plantType'],
      "code": para['plantScheme']
    }
    var url = para['plantAddr'] + "?width=" + data['width'] + "&height=" + data['height'] + "&os=" + data['os'] + "&type=" + data['type'] + "&code=" + data['code'] + "&callback=jsonpCallback"
    var setScript = document.createElement('script')
    setScript.type = "text/javascript"
    setScript.src = url

    var headEle = document.getElementsByTagName('head')[0]
    headEle.appendChild(setScript)

    jsonpCallback = function (data) { }
  }

}