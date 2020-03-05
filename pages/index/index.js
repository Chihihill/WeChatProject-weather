//动态指令 command
//index.js
//获取应用实例
const weatherMap = {
  'sunny': '晴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'overcast': '阴',
  'snow': '雪',
  'cloudy': '多云'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}
const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""

Page({
  data:{
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyForecast: [],
    todayTemp: '',
    todayDate: '',
    city: '上海市',
    locationAuthType: UNPROMPTED,
    locationTipsText: UNPROMPTED_TIPS
  },
  onPullDownRefresh(){
    //下拉刷新，重新request
    this.getNow(
      //匿名函数作为回调函数，自执行
      () => {
        wx.stopPullDownRefresh()
      })
    //when refresh completed, stopPullDwonRefresh
  },
  onLoad(){
    //location
    this.qqmapsdk = new QQMapWX({
      key: 'UWFBZ-CNZCW-VRDRW-R2ACY-J7XYJ-J4BX5'
    })

    this.getNow()
    //onload do not need stopPullDownRefresh
  },
  onShow(){
    var self = this
    wx.getSetting({
      success: function(res){
        let auth = res.authSetting['scope.userLocation']
        if(auth && self.data.locationAuthType !== AUTHORIZED){
          self.setData({
            //权限从无到有
            locationAuthType: AUTHORIZED,
            locationTipsText: AUTHORIZED_TIPS
          })
          self.getLocation()
        }
      }
    })
  },
  getNow(callback){
    //在回调函数中是不可以使用this的，所以需要在外部定义一个变量代表this。
    var self = this

    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now', 
      data: {
        city: self.data.city
      },
      success(res) {
        console.log(res)
        let result = res.data.result;
        self.setNow(result); 
        self.setHourlyForecast(result);   
        self.setToday(result);
      },  
      complete(){
        //回调函数带有参数？
        //函数b是你以参数形式传给函数a的，那么函数b就叫回调函数
        callback && callback()
        //Returns expr1 if it can be converted to false; otherwise, returns expr2. Thus, when used with Boolean values, && returns true if both operands are true; otherwise, returns false.
      }
    })
  },
  setNow(result){
    let temp = result.now.temp;
    let weather = result.now.weather;
    console.log(temp, weather);
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  setHourlyForecast(result){
    // set forecast
    console.log(result);
    let forecast = result.forecast;
    let hourlyForecast = [];
    let nowHour = new Date().getHours();
    for (var i = 0; i < 24; i += 3) {
      hourlyForecast.push({
        time: (nowHour + i) % 24 + '时',
        iconPath: '/images/' + forecast[i / 3].weather + '-icon.png',
        temp: forecast[i / 3].temp + '°'
      })
    }
    hourlyForecast[0].time = "现在";
    this.setData({
      //self == this
      hourlyForecast: hourlyForecast
    })
  },
  setToday(result){
    let date = new Date();
    this.setData({
      todayTemp: `${result.today.maxTemp}° - ${result.today.minTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDay()} 今天 `
    })
  },
  onTapDayWeather(){
    wx.showToast()
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  onTapLocationWrapper(){
    //引导用户进入设置页面开启权限
    if(this.data.locationAuthType === UNAUTHORIZED)
      wx.openSetting()
    else
      this.getLocation()
  },
  getLocation(){
    var self = this
    wx.getLocation({
      success: function(res) {
        self.setData({
          locationAuthType: AUTHORIZED,
          locationTipsText: AUTHORIZED_TIPS
        }),
        self.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            let city = res.result.address_component.city
            console.log(city)
            self.setData({
              city: city,
              locationTipsText: ''
            })
            self.getNow()
          }
        })
      },
      fail: function(){
        self.setData({
          locationAuthType: UNAUTHORIZED,
          locationTipsText: UNAUTHORIZED_TIPS
        })
      }
    })
  }
})
