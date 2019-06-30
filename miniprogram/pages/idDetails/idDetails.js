// miniprogram/pages/idDetails/idDetails.js
/**
 * “你的信太过官方,都不说想我。”周总理给邓颖超的信
 * “周总理是大忙人,哪有时间来想我。”邓颖超回信
 * “闲人怎么知道忙人多想闲人。”周总理回信
 * “我这一生都是坚定不移的唯物主义者,唯有你,我希望有来生”周恩来致邓颖超
 */
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      teamName: options.teamName
    })

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
  /**
   * 本是想用封面用相似度识别的，但是暂时还没有找到合适的接口，所以就只做了内容页的文字识别
   * 但是可以先上传，相似度识别的可以以后扩展
   * *******
   * 现状是只能创建一个团队，多了之后逻辑会乱，我现在脑阔不太方便去想这个，所以暂时放这里
   * *******
   */
  uploads: function() {
    var that = this
    wx.chooseImage({
      count: 2,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '审核中',
        })
        let path = res.tempFilePaths
        var FileManager = wx.getFileSystemManager()
        FileManager.readFile({
          filePath: path[1],
          encoding: 'base64',
          success: res => {
            var url = encodeURI(res.data)

            wx.request({
              url: 'https://aip.baidubce.com/oauth/2.0/token',
              data: {
                grant_type: 'client_credentials',
                client_id: 'nnLdK9QG1VPVUqogiGX2LYh6',
                client_secret: 'fDMSNQ3oniihsL6u3SLpsp32Tx4ejjY9'
              },
              method: 'GET',
              success: res => {
                console.log(res.data.access_token)
                var access_token = res.data.access_token
                wx.request({
                  url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=' + access_token,
                  data: {
                    image: url
                  },
                  method: 'POST',
                  header: {
                    'content-type': 'application/x-www-form-urlencoded',
                  },
                  success: res => {
                    let result = res.data
                    db.collection('teamMaterail').where({
                      teamName: that.data.teamName
                    }).get().then(res => {
                      console.log(res)
                      for (var i = 0; i < result.words_result.length; i++) {
                        if (result.words_result && res.data) {
                          if (result.words_result[i].words == res.data[0].words[i].words) {
                            wx.cloud.callFunction({
                              name: 'user_upload',
                              data: {
                                teamName: that.data.teamName
                              },
                              success: res => {
                                wx.cloud.callFunction({
                                  name:'where_update',
                                  data:{
                                    collection:'users',
                                    key:'_openid',
                                    value:app.globalData.openid,
                                    add_key:'joined',
                                    add_value:[that.data.teamName],
                                    method:'push'
                                  },
                                  success:{

                                  }
                                })
                                console.log(res)
                                wx.showToast({
                                  title: '您已成功加入',
                                })
                                setTimeout(() =>{
                                  wx.hideToast()
                                  wx.navigateBack({
                                    detail:1
                                  })
                                },1000)
                              },
                              fail: err => {
                                console.log(err)
                                wx.showToast({
                                  title: '您的身份不符！',
                                  icon: 'none'
                                })
                              }
                            })
                            break
                          }else{
                            if (i == result.words_result.length-1)
                            {
                              wx.showToast({
                                title: '检测您的信息有误',
                                icon: 'none'
                              })
                            }
                          }
                        } else {
                          wx.showToast({
                            title: '您选择的图片有误',
                            icon: 'none'
                          })
                        }

                      }
                    })
                  },
                  fail: (err) => {
                    console.log('失败' + err)
                  }
                })
              },
              fail: (err) => {
                console.log('失败' + err)
              }
            })
          }
        })
        for (var i = 0; i < 2; i++) {
          wx.cloud.uploadFile({
            cloudPath: 'user_identify/' + app.globalData.openid + i, //为了后台识别图片的信息，所以一定要按相同的顺序来，如果顺序不对将会识别不出来
            filePath: path[i],
            success: res => {
              console.log(res.fileID)
            },
            fail: err => {
              console.log(err)
            }
          })
        }
      },
    })
  }
})