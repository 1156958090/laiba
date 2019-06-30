var sliderWidth = 96; // 需要设置slider的宽度，⽤用 于计算中间位置 
const app = getApp()
const db = wx.cloud.database()
Page({ /**   * ⻚页⾯面的初始数据   */
  data: {
    tabs: ["加入团队", "创建团队"],
    activeIndex: 1,
    sliderOffset: 0,
    sliderLeft: 0,
    uploadPecture: false,
    searchTN: '',
    teamName: ''
  },
  onLoad: function() {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },
  tabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  /**   * ⽣生命周期函数--监听⻚页⾯面初次渲染完成   */
  onReady: function() {},
  /**   * ⽣生命周期函数--监听⻚页⾯面显示   */
  onShow: function() {},
  /**   * ⽣生命周期函数--监听⻚页⾯面隐藏   */
  onHide: function() {},
  /**   * ⽣生命周期函数--监听⻚页⾯面卸载   */
  onUnload: function() {
    var pages = getCurrentPages()
    var pre = pages[pages.length - 2]
    pre.onLoad()
  },
  /**   * ⻚页⾯面相关事件处理理函数--监听⽤用户下拉动作   */
  onPullDownRefresh: function() {},
  /**   * ⻚页⾯面上拉触底事件的处理理函数   */
  onReachBottom: function() {
  },
  /**
   * ⽤用户点击右上⻆角分享   */
  onShareAppMessage: function() {},
  bindSearch: function(e) {
    let {
      search
    } = e.detail.value
    if (search != null) {
      this.setData({
        search
      }, () => {
        db.collection('Teams').where({
          teamName: this.data.search,
          permission: true
        }).get({
          success: res => {
            if (res.data[0] != undefined) {
              this.setData({
                searchTN: res.data[0]
              }, () => {
                console.log(this.data.searchTN)
              })
            } else {
              wx.showToast({
                title: '暂时没有此团队',
                icon:'none'
              })
            }
          },
          fail: err => {
            console.log(err)
          }
        })
      })
    }
  },
  chooseImage: function() {
    var that = this //上传证明材料料    
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        console.log(app.globalData.openid)
        let path = res.tempFilePaths[0]
        var FileManager = wx.getFileSystemManager()
        FileManager.readFile({
          filePath: path,
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
                    db.collection('teamMaterail').add({
                      data: {
                        words: res.data.words_result
                      },
                      success: res => {
                        console.log('添加成功g')
                      },
                      fail: err => {
                        console.log(err)
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
        wx.cloud.uploadFile({
          cloudPath: 'identify/' + app.globalData.openid,
          filePath: path,
          success: res => {
            that.setData({
              //验证是否提交了图片验证，没有提交的话则不能提交表单
              uploadPecture: true
            })
          },
          fail: err => {
            console.log(err)
          }
        })
      },
    })
  },
  onCreateTeam: function(e) {
    wx.showLoading({
      title: '申请正在提交',
    })
    let {
      teamName,
      telephone,
      mail,
      introduction,
      permission
    } = e.detail.value
    let time = new Date()
    if (teamName && telephone && mail && introduction && this.data.uploadPecture) {
      db.collection('Teams').where({
        teamName: teamName
      }).get().then(res => {
        if (res.data[0] != undefined) {
          wx.showToast({
            title: '该团体已被创建',
            icon: 'none'
          })
        } else {
          db.collection('Teams').add({
            data: {
              teamName: teamName,
              creator: app.globalData.userInfo.nickName,
              telephone: telephone,
              mail: mail,
              introduction: introduction,
              members: [app.globalData.openid],
              permission: false,
              createTime: time.toLocaleDateString()
            },
            success: res => {
              console.log('团体添加成功')
              wx.cloud.callFunction({
                name: 'where_update',
                data: {
                  collection: 'teamMaterail',
                  key: '_openid',
                  value: app.globalData.openid,
                  add_key: 'teamName',
                  add_value: teamName,
                  method: 'a' //这里只要不是method为push追加的，填任何都可以
                  // teamName:teamName,
                  // openid:app.globalData.openid
                },
                success: res => {
                  console.log(res)
                  wx.hideLoading()
                  wx.showToast({
                    title: '申请已成功提交',
                  })
                  setTimeout(function() {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 1000)
                },
                fail: err => {
                  console.log(err)
                }
              })
              console.log('添加成功')

            },
            fail: err => {
              console.log(err)
            }
          })
          db.collection('activity').add({
            data:{
              teamName:teamName,
              activity:[]
            }
          })
        }
      })
    } else {
      wx.showToast({
        title: '您有信息未输⼊入',
        icon: 'none'
      })
    } // db.collection('Teams').add({    
    //   data:{    
    //     teamName:teamName,    
    //   telephone:telephone,    
    //   mail:mail,    
    //   introduction:introduction,    
    //   permission:false    
    //   },    
    //   success: res =>{    
    //     console.log(res)    
    //   },    
    //   fail: err => {    
    //     console.log(err)    
    //   }    
    // })  
  },
  join: function() {
    //判定用户是否已经加入搜索到的团体
    db.collection('Teams').where({
      teamName: this.data.searchTN.teamName
    }).get({
      success: res => {
        console.log(res)
        let openid = app.globalData.openid
        for (var x = 0; x < res.data[0].members.length; x++) {
          if (res.data[0].members[x] == openid) {

            wx.showToast({
              title: '您已加入该团体',
              icon: 'none'
            })
            return
          }

        }
        wx.navigateTo({
          url: '../idDetails/idDetails?teamName=' + this.data.searchTN.teamName,
        })
      },
      fail: err => {
        console.log(err)
      }
    })

  },

})