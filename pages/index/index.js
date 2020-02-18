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

Page({
  data:{
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyForecast: []
  },
  onPullDownRefresh(){
    //下拉刷新，重新request
    this.getNow(//匿名函数作为回调函数，自执行
      () => {
        wx.stopPullDownRefresh()
      })
    //when refresh completed, stopPullDwonRefresh
  },
  onLoad(){
    this.getNow()
    //onload do not need stopPullDownRefresh
  },
  getNow(callback){
    //在回调函数中是不可以使用this的，所以需要在外部定义一个变量代表this。
    var self = this

    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now', 
      data: {
        city: '深圳市'
      },
      success(res) {
        console.log(res)
        let result = res.data.result;
        self.setNow(result); 
        self.setHourlyForecast(result);   
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
  }
})
