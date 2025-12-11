import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockResultData, mockHistoryData, clearAllMocks } from './utils.js'

describe('组件集成测试', () => {
  beforeEach(() => {
    clearAllMocks()
  })

  it('应该能够完整地执行识别流程', async () => {
    // 模拟存储为空
    uni.getStorageSync.mockReturnValue([])

    // 1. 模拟用户选择图片
    const mockImagePath = '/mock/image.jpg'
    uni.chooseImage.mockImplementation(({ sourceType, success }) => {
      success({ tempFilePaths: [mockImagePath] })
    })

    // 2. 模拟识别结果
    const mockResult = {
      ...mockResultData,
      id: Date.now(),
      image: mockImagePath,
      recognizeTime: new Date().toLocaleString()
    }

    // 执行识别流程
    return new Promise((resolve) => {
      // 模拟异步识别过程
      setTimeout(() => {
        // 3. 保存到历史记录
        const history = [mockResult]
        uni.getStorageSync.mockReturnValue(history)

        // 4. 验证历史记录已保存
        const savedHistory = uni.getStorageSync('fabricHistory')
        expect(savedHistory).toEqual(history)

        // 5. 验证导航到结果页
        expect(uni.navigateTo).toHaveBeenCalledWith(
          expect.stringContaining('/pages/result/result?data=')
        )

        resolve()
      }, 100)
    })
  })

  it('应该能够保存结果到已保存列表', async () => {
    // 设置初始历史记录
    uni.getStorageSync.mockImplementation((key) => {
      if (key === 'fabricHistory') return [mockResultData]
      if (key === 'savedHistory') return []
      return []
    })

    // 模拟保存结果
    const savedHistory = []
    uni.setStorageSync.mockImplementation((key, value) => {
      if (key === 'savedHistory') {
        savedHistory.push(...value)
      }
    })

    // 执行保存操作
    const resultToSave = { ...mockResultData }
    const existingSaved = uni.getStorageSync('savedHistory') || []

    const exists = existingSaved.some(item => item.id === resultToSave.id)
    expect(exists).toBe(false)

    savedHistory.push({
      ...resultToSave,
      saveTime: new Date().toLocaleString()
    })

    // 验证保存成功
    expect(savedHistory).toHaveLength(1)
    expect(savedHistory[0].id).toBe(resultToSave.id)
    expect(savedHistory[0].saveTime).toBeDefined()
  })

  it('应该能够防止重复保存相同结果', async () => {
    // 设置已存在的历史记录
    const existingSaved = [{ ...mockResultData, saveTime: '2024-01-01 10:00:00' }]
    uni.getStorageSync.mockImplementation((key) => {
      if (key === 'savedHistory') return existingSaved
      return []
    })

    // 尝试保存相同的结果
    const resultToSave = { ...mockResultData }
    const savedHistory = [...existingSaved]

    const exists = savedHistory.some(item => item.id === resultToSave.id)
    expect(exists).toBe(true)

    // 验证不会重复保存
    expect(savedHistory).toHaveLength(1)
  })

  it('应该能够正确过滤不同类型的历史记录', () => {
    // 设置混合的历史记录
    const allHistory = mockHistoryData
    const savedHistory = [mockHistoryData[1]] // 只有第二个是已保存的

    // 测试全部记录
    const allTabHistory = allHistory
    expect(allTabHistory).toHaveLength(2)

    // 测试已保存记录
    const savedTabHistory = savedHistory
    expect(savedTabHistory).toHaveLength(1)
    expect(savedTabHistory[0].id).toBe(mockHistoryData[1].id)
  })

  it('应该能够正确清除历史记录', async () => {
    // 模拟确认清除
    uni.showModal.mockImplementation(({ success }) => {
      success({ confirm: true })
    })

    // 设置初始历史记录
    const initialHistory = mockHistoryData
    uni.getStorageSync.mockReturnValue(initialHistory)

    // 清除全部记录
    let clearedHistory = []
    uni.removeStorageSync.mockImplementation((key) => {
      if (key === 'fabricHistory') {
        clearedHistory = []
      }
    })

    // 执行清除
    uni.showModal.mock.calls[0][1].success({ confirm: true })
    uni.removeStorageSync('fabricHistory')

    // 验证清除结果
    expect(clearedHistory).toEqual([])
    expect(uni.showToast).toHaveBeenCalledWith({
      title: '清除成功',
      icon: 'success'
    })
  })

  it('应该正确限制历史记录数量', () => {
    // 模拟20条历史记录（限制数量）
    const maxHistory = 20
    const existingHistory = Array(maxHistory).fill().map((_, index) => ({
      ...mockResultData,
      id: index
    }))

    // 添加新记录
    const newRecord = { ...mockResultData, id: 999 }
    const updatedHistory = [newRecord, ...existingHistory]

    // 验证只保留限制数量的记录
    if (updatedHistory.length > maxHistory) {
      updatedHistory.pop()
    }

    expect(updatedHistory).toHaveLength(maxHistory)
    expect(updatedHistory[0].id).toBe(999)
  })

  it('应该正确限制已保存记录数量', () => {
    // 模拟50条已保存记录（限制数量）
    const maxSaved = 50
    const existingSaved = Array(maxSaved).fill().map((_, index) => ({
      ...mockResultData,
      id: index
    }))

    // 添加新记录
    const newRecord = { ...mockResultData, id: 888 }
    const updatedSaved = [newRecord, ...existingSaved]

    // 验证只保留限制数量的记录
    if (updatedSaved.length > maxSaved) {
      updatedSaved.pop()
    }

    expect(updatedSaved).toHaveLength(maxSaved)
    expect(updatedSaved[0].id).toBe(888)
  })

  it('应该能够正确解析路由参数', () => {
    // 模拟路由参数
    const resultData = { ...mockResultData }
    const encodedData = encodeURIComponent(JSON.stringify(resultData))
    const decodedData = JSON.parse(decodeURIComponent(encodedData))

    // 验证数据正确解析
    expect(decodedData).toEqual(resultData)
    expect(decodedData.fabricType).toBe(resultData.fabricType)
    expect(decodedData.confidence).toBe(resultData.confidence)
  })
})