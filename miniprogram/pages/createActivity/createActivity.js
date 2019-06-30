// miniprogram/pages/createActivity/createActivity.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: 1,
    date: "2016-09-01",
    clock: "12:00",
    files: [],
    teamName: '',
    file_path: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    //这里需要补上卸载之后刷新活动页的活动才行
    var that = this
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面

    prevPage.onLoad()
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
  add: function() {

    this.setData({
      text: this.data.text + 1
    }, () => {
      console.log(this.data.text)
      console.log(this)
    })
  },
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function(e) {
    this.setData({
      clock: e.detail.value
    })
  },
  chooseImage: function(e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
      }
    })
  },
  previewImage: function(e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  mutiupload: function(file_path, filePath, count, length, title, callback) {
    var that = this
    wx.cloud.uploadFile({
      cloudPath: 'activity_images/' + title + count,
      filePath: filePath[count],
    }).then(res => {
      file_path.push(res.fileID)
      count++
      if (count == length) {
        callback(file_path)
      } else(
        that.mutiupload(file_path, filePath, count, length, title, callback)
      )
    })
  },
  submitAct: function(e) {
    var pages = getCurrentPages()
    var pre = pages[pages.length - 2]
    if (e.detail.value.title && e.detail.value.introduction && e.detail.value.peoples) {
      wx.showToast({
        title: '发布成功',
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        })
        pre.onLoad()
      }, 1500)
      var time = new Date()
      var second = new Date(e.detail.value.date + ' ' + e.detail.value.clock)
      var that = this
      var object = e.detail.value
      var file_path = new Array()
      //与创建团队的地方一样，活动主题与描述等都没有经过敏感字检查，小程序是有这个api的，等总体逻辑完成之后再加入
      that.mutiupload(file_path, that.data.files, 0, that.data.files.length, object.title, function(file_path) {
        console.log(file_path)
        object.file_path = file_path
        console.log(object)
        object.peoples = parseInt(object.peoples)
        console.log(object.file_path)
        db.collection('users').where({
          _openid: app.globalData.openid
        }).get().then(res => {
          that.setData({
            teamName: res.data[0].joined[0]
          })
          db.collection('activity').add({
            data: {
              activity: object,
              time: parseInt(time.getTime()),
              creator: app.globalData.userInfo.nickName,
              creatorUrl: app.globalData.userInfo.avatarUrl,
              teamName: res.data[0].joined[0],
              second : second.getTime()
            },
            success: res => {
              console.log(res)
              pre.onLoad()
            },
            fail: err => {
              console.log(err)
            }
          })
        })
      })
    } else {
      wx.showToast({
        title: '您还有未输入的项！',
        icon: 'none'
      })
    }
  }
})