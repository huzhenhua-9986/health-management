// utils/cache.js
// 本地缓存管理工具

class CacheManager {
  constructor() {
    this.prefix = 'health_'
    this.memoryCache = new Map()
  }

  // 生成完整的缓存key
  getKey(key) {
    return `${this.prefix}${key}`
  }

  /**
   * 设置缓存
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {number} expire 过期时间（秒），默认1小时
   */
  set(key, value, expire = 3600) {
    const cacheKey = this.getKey(key)
    const expireTime = Date.now() + expire * 1000

    // 同时存储到内存和本地存储
    this.memoryCache.set(cacheKey, {
      value,
      expireTime
    })

    try {
      wx.setStorageSync(cacheKey, {
        value,
        expireTime
      })
    } catch (e) {
      console.warn('存储空间不足，仅使用内存缓存', e)
    }
  }

  /**
   * 获取缓存
   * @param {string} key 缓存键
   * @returns {any|null} 缓存值，不存在或已过期返回null
   */
  get(key) {
    const cacheKey = this.getKey(key)

    // 先从内存获取
    let cached = this.memoryCache.get(cacheKey)

    // 内存没有则从本地存储获取
    if (!cached) {
      try {
        cached = wx.getStorageSync(cacheKey)
        if (cached) {
          this.memoryCache.set(cacheKey, cached)
        }
      } catch (e) {
        console.warn('读取缓存失败', e)
        return null
      }
    }

    // 检查是否过期
    if (!cached || Date.now() > cached.expireTime) {
      this.remove(key)
      return null
    }

    return cached.value
  }

  /**
   * 删除缓存
   * @param {string} key 缓存键
   */
  remove(key) {
    const cacheKey = this.getKey(key)
    this.memoryCache.delete(cacheKey)
    try {
      wx.removeStorageSync(cacheKey)
    } catch (e) {
      console.warn('删除缓存失败', e)
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.memoryCache.clear()
    try {
      const res = wx.getStorageInfoSync()
      res.keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          wx.removeStorageSync(key)
        }
      })
    } catch (e) {
      console.warn('清空缓存失败', e)
    }
  }

  /**
   * 检查缓存是否存在且有效
   * @param {string} key 缓存键
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null
  }

  /**
   * 获取或设置缓存（如果不存在则执行回调获取值）
   * @param {string} key 缓存键
   * @param {Function} callback 回调函数，返回需要缓存的值
   * @param {number} expire 过期时间（秒）
   * @returns {Promise<any>}
   */
  async remember(key, callback, expire = 3600) {
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }

    const value = await callback()
    this.set(key, value, expire)
    return value
  }

  /**
   * 批量设置缓存
   * @param {Object} items 键值对对象
   * @param {number} expire 过期时间（秒）
   */
  setMultiple(items, expire = 3600) {
    Object.keys(items).forEach(key => {
      this.set(key, items[key], expire)
    })
  }

  /**
   * 批量获取缓存
   * @param {Array<string>} keys 缓存键数组
   * @returns {Object}
   */
  getMultiple(keys) {
    const result = {}
    keys.forEach(key => {
      result[key] = this.get(key)
    })
    return result
  }

  /**
   * 获取缓存统计信息
   * @returns {Object}
   */
  getStats() {
    try {
      const res = wx.getStorageInfoSync()
      const cacheKeys = res.keys.filter(key => key.startsWith(this.prefix))
      return {
        count: cacheKeys.length,
        currentSize: res.currentSize,
        limitSize: res.limitSize,
        usagePercent: ((res.currentSize / res.limitSize) * 100).toFixed(2)
      }
    } catch (e) {
      return {
        count: 0,
        currentSize: 0,
        limitSize: 0,
        usagePercent: 0
      }
    }
  }

  /**
   * 清理过期缓存
   */
  cleanExpired() {
    try {
      const res = wx.getStorageInfoSync()
      const now = Date.now()

      res.keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const cached = wx.getStorageSync(key)
            if (cached && cached.expireTime && now > cached.expireTime) {
              wx.removeStorageSync(key)
              this.memoryCache.delete(key)
            }
          } catch (e) {
            // 忽略读取失败的key
          }
        }
      })
    } catch (e) {
      console.warn('清理过期缓存失败', e)
    }
  }
}

// 缓存键常量
const CacheKeys = {
  // 用户信息
  USER_INFO: 'user_info',
  // 今日健康数据
  TODAY_HEALTH_DATA: 'today_health_data',
  // 今日运动数据
  TODAY_EXERCISE_DATA: 'today_exercise_data',
  // 今日睡眠数据
  TODAY_SLEEP_DATA: 'today_sleep_data',
  // 今日饮食数据
  TODAY_DIET_DATA: 'today_diet_data',
  // 健康数据列表
  HEALTH_DATA_LIST: 'health_data_list',
  // 运动数据列表
  EXERCISE_DATA_LIST: 'exercise_data_list',
  // 睡眠数据列表
  SLEEP_DATA_LIST: 'sleep_data_list',
  // 饮食数据列表
  DIET_DATA_LIST: 'diet_data_list',
  // 健康报告列表
  REPORT_LIST: 'report_list',
  // 用户设置
  USER_SETTINGS: 'user_settings'
}

// 创建单例
const cache = new CacheManager()

module.exports = {
  cache,
  CacheKeys
}
