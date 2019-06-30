const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '../../images/user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    openid: '',
    nickName: '',
    click: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showModal({
      title: '你好！',
      content: '欢迎来到来吧',
      showCancel: true,
      cancelText: '进入',
      cancelColor: '',
      confirmText: '好的',
      confirmColor: '',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            lang: 'zh_CN',
            success: res => {
              var tmp = res
              console.log(res)
              app.globalData.userInfo = res.userInfo
              app.globalData.logged = true
              this.setData({
                avatarUrl: tmp.userInfo.avatarUrl,
                userInfo: tmp.userInfo,
                session: false,
              })
            }
          })
          wx.cloud.callFunction({
            name: 'sum',
            data: {}
          }).then(res => {
            console.log(res)
            app.globalData.openid = res.result.openid
          })
        } else {
          this.setData({
            session: true
          })
        }
        //这里是让全局都有登录的状态，所以设置logged为true，其他所有的页面都能访问到这个true，比较好渲染

      },
      fail: () => {
        this.setData({
          session: true
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        click: true
      })
      app.globalData.userInfo = e.detail.userInfo
    }

  },
  onGetOpenid: function(e) {

    var that = this
    const db = wx.cloud.database()
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        var tmp = res
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.logged = true
        that.setData({
          openid: res.result.openid,
          click:true
        }, function() {
          //查询数据库中是否存有用户信息
          db.collection('users').where({
            _openid: res.result.openid,
          }).get().then(res => {
            if (res.data[0]) {
              console.log('已经是用户了')
              app.globalData.openid = tmp.result.openid
            } else {
              //没有就往users集合中添加
              db.collection('users').add({
                data: {
                  nickName: that.data.userInfo.nickName
                },
                success: res => {
                  console.log('添加用户成功！')
                  app.globalData.openid = tmp.result.openid
                  that.setData({
                    session: false
                  })
                },
                fail: res => {
                  console.log('添加用户失败！')
                },
                complete: res => {
                  console.log(res)

                }
              })
            }
          })
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)

      }
    })
  },
  pastDue: function() {

  },

})