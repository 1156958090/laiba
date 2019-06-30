// miniprogram/pages/schedule/schedule.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
var timer
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reserve: parseInt(new Date().getTime()),
    Time: [],
    click_id: 0,
    hover: 0,
    comments: {},
    focus: false,
    display: 'none',
    once:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    //从数据库获取参加的活动
    console.log(app.globalData.openid)
    if (app.globalData.openid != null) {
      db.collection('activity').where({
        member: _.in([app.globalData.openid])
      }).orderBy('time', 'asc').get().then(res => {
        that.setData({
          once:1
        })
        if(res.data[0] != undefined)
        {
          console.log('进来了')
        //毫秒数转化为天小时分钟
        for (var a in res.data) {
          res.data[a].duration = that.getTime(that.data.reserve - res.data[a].activity.second)
          res.data[a].num = false
          res.data[a].redDot = 'button1'
        }
        that.setData({
            activities: res.data,
          }
          /*, function() {
                    if (that.data.activities) {
                      timer = setInterval(that.fresh, 4000)
                    }
                  }*/
        )}
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //这事第二种解决方案，直接放到监听页面显示的函数中，每次进来都刷新一次
    var that = this
    if (that.data.once) {
      db.collection('activity').where({
        member: _.in([app.globalData.openid])
      }).get().then(res => {
        //毫秒数转化为天小时分钟
        for (var a in res.data) {
          res.data[a].duration = that.getTime(that.data.reserve - res.data[a].activity.second)
          res.data[a].num = false
          res.data[a].redDot = 'button1'
        }
        for (var b in res.data) {
          if(that.data.activities != undefined)
          {
          if (res.data[b].comments && that.data.activities[b].comments != undefined) {
            if (Object.keys(res.data[b].comments).length == Object.keys(that.data.activities[b].comments).length) {
              continue
            } else {
              res.data[b].redDot = 'button'
              wx.showTabBarRedDot({
                index: 0,
              })
            }
          } else if (res.data[b].comments && that.data.activities[b].comments == undefined){
            res.data[b].redDot = 'button'
            wx.showTabBarRedDot({
              index: 0,
            })
          } 
        }
        }
        console.log('刷新一次')
        that.setData({
          activities: res.data
        })
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  getTime: function(my_time) {
    var days = my_time / 1000 / 60 / 60 / 24;
    var daysRound = Math.floor(days);
    var hours = my_time / 1000 / 60 / 60 - (24 * daysRound);
    var hoursRound = Math.floor(hours);
    var minutes = my_time / 1000 / 60 - (24 * 60 * daysRound) - (60 * hoursRound);
    var minutesRound = Math.floor(minutes);
    var time = daysRound + '天' + hoursRound + '时' + minutesRound + '分'
    if (days >= 0 && hours >= 0 && minutes >= 0)
      return time;
    else {
      return '已结束'
    }
  },
  single: function(e) {
    // if (timer) {
    //   clearInterval(timer)
    //   timer = null
    // } else {
    //   timer = setInterval(this.fresh, 3000)
    //   console.log(timer)
    // }
    wx.hideTabBarRedDot({
      index: 0,
    })
    var tem = this.data.activities
    for (var a in tem) {
      if (a == e.currentTarget.dataset.id) {
        tem[a].num = tem[a].num == false ? true : false
        tem[a].redDot = 'button1'
        this.setData({
          activities: tem,
        })
      }
    }

  },
  fresh: function() {
    //这是查询是否有留言的第一种方案（通过设置定时器定时访问看看有没有新的留言），但是太费流量了，所以暂时采用第二种方法
    var that = this
    db.collection('activity').where({
      member: _.in([app.globalData.openid])
    }).get().then(res => {
      //毫秒数转化为天小时分钟
      for (var a in res.data) {
        res.data[a].duration = that.getTime(that.data.reserve - res.data[a].activity.second)
        res.data[a].num = false
        res.data[a].font = '查看留言'
        if (that.data.activities[a].font == '有新留言') {
          res.data[a].font = '有新留言'
        }

      }
      for (var b in res.data) {
        if (res.data[b].comments && that.data.activities[b].comments) {
          if (Object.keys(res.data[b].comments).length == Object.keys(that.data.activities[b].comments).length) {
            continue
          } else {
            res.data[b].font = '有新留言'
            wx.showTabBarRedDot({
              index: 0,
            })
          }
        } else if (!(res.data[b].comments == undefined) || !(that.data.activities[b].comments == undefined)) {
          res.data[b].font = '有新留言'
          wx.showTabBarRedDot({
            index: 0,
          })
        }

      }
      console.log('刷新一次')
      that.setData({
        activities: res.data
      })
    })
  },
  reply: function(e) {
    console.log('点击了')
    this.setData({
      focus: true,
      display: 'block',
      find_time: e.currentTarget.dataset.time,
      who: e.currentTarget.dataset.who
    })
  },
  inputBlur: function() {
    this.setData({
      display: 'none'
    })
  },
  send: function(e) {
    var that = this
    db.collection('activity').where({
      time: parseInt(that.data.find_time)//后台储存的time是整形，但是这里是字符串所以要把类型转换一下，要不然查询不到
    }).get().then(res => {
      console.log(res)
      wx.cloud.callFunction({
        name: 'where_update',
        data: {
          collection: 'activity',
          key: 'time',
          value: parseInt(that.data.find_time),
          add_key: 'comments',
          add_value: {
            [app.globalData.userInfo.nickName + Object.keys(res.data[0].comments).length]: [e.detail.value, that.data.who, app.globalData.userInfo.nickName, that.data.find_time]
          }
        }
      }).then(res => {
        wx.showToast({
          title: '回复成功！',
        })
        console.log('回复成功')

        wx.cloud.callFunction({
          name: 'where_update',
          data: {
            collection: 'users',
            key: '_openid',
            value: app.globalData.openid,
            add_key: 'commented',
            add_value: parseInt(that.data.find_time),
            method:'push'
          }
        }).then(res => {
          that.onLoad()
        })
        
      })
    })

  },
  actDetail:function (e){
    var index = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../actDetail/actDetail?objData=' + JSON.stringify(this.data.activities[index]),
    })
  }

})