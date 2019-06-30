// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
/**
 * @Function where_update
 * 
 * @param {string} collection 要更新的集合
 *                 key 限定条件的字段名
 *                 value 限定条件字段的值
 *                 add_key 要更改或者增加的字段名   
 *                 add_value 要更改或者增加的字段名的值
 *                 method 更新的方法，是数组追加（push）还是直接增加（任意值）
 * @return {object} 更新结果日志
 */
const db = cloud.database()
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  var {
    collection,
    key,
    value,
    add_key,
    add_value,
    method
  } = event
  console.log(collection+key)
  try {
    if(method == 'push')
    {
      return await db.collection(collection).where({
        [key]: value
      }).update({
        data: {
          [add_key]: db.command.push(add_value)
        }
      })
    }
    else{
      return await db.collection(collection).where({
        [key]: value
      }).update({
        data: {
          [add_key]: add_value
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
}