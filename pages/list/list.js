// pages/list/list.js
const dayMap = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

Page({
  data:{
    weekWeather: [1,2,3,4,5,6,7],
    city: '上海市'
  },
  onLoad(options){
    this.setData({
      city: options.city
    })
    this.getWeekWeather()
  },
  onPullDownRefresh(){
    this.getWeekWeather(
      ()=>{
        wx.stopPullDownRefresh()
    })
  },
  getWeekWeather(callback){
    var self = this

    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: this.data.city,
        time: new Date().getTime()
      },
      success(res){
        let result = res.data.result;
        console.log(result);
        self.setWeekWeather(result);
      },
      complete(){
        callback && callback()
      }
    })
  },
  setWeekWeather(result){
    let weekWeather = [];
    for(let i = 0; i < 7; i++){
      let date = new Date();
      date.setDate(date.getDate() + i);
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`,
        temp: `${result[i].minTemp}°-${result[i].maxTemp}°`,
        iconPath: '/images/' + result[i].weather + '-icon.png'
      })
    }
    weekWeather[0].day = '今天'
    this.setData({
      weekWeather: weekWeather
    })
  }
})