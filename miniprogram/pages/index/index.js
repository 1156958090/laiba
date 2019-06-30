// 待补充滑到底继续刷新数据，因为前端操控数据库只能最多同时获得20条数据
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    logged: false,
    openid: '',
    exist: false,
    activities: [],
    teamName: '',
    
    // havaTeam:app.globalData.havaTeam
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    console.log(app.globalData.openid)
    if (app.globalData.openid != undefined) {
      //获取活动
      db.collection('users').where({
        _openid: app.globalData.openid
      }).get().then(res => {
        console.log(res.data[0].joined)
        if (res.data[0].joined[0] == undefined) {
          that.setData({
            haveTeam: true,
          })
        } else {
          that.setData({
            haveTeam: false,
            teamName: res.data[0].joined[0]
          })
          db.collection('activity').where({
            teamName: res.data[0].joined[0]
          }).orderBy('time', 'desc').get().then(res => {
            console.log(res)
            that.setData({
              activities: res.data,
              exist: true
            })
          })
        }

      })
    }


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      logged: app.globalData.logged
    })
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
    var that = this
    db.collection('activity').skip(20).where({
      teamName: that.data.teamName
    }).get().then(res => {
      console.log(res)
      that.setData({
        activities:that.data.activities.concat(res.data)
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  publish: function() {

  },
  createOrChooice: function() {
    wx.navigateTo({
      //跳转到创建团队或者加入团队界面
      url: '../createTeam/createTeam',
    })
  },
  /**
   * 暂时未开放游客模式
   * 游客模式就是在首页可以看到别的团体的活动，但是没有参加的权限
   */
  visitor: function() {

  },
  createActivity: function() {
    wx.navigateTo({
      //跳转到创建活动页面上
      url: '../createActivity/createActivity',
    })
  },
  goDetail: function(e) {
    var index = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../actDetail/actDetail?objData=' + JSON.stringify(this.data.activities[index]),
    })
  }
})