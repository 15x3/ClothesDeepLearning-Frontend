import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockWrapper, mockResultData, clearAllMocks } from './utils.js'

// 模拟结果页组件
const ResultComponent = {
  template: `
    <view class="container">
      <view class="image-section">
        <image :src="resultData.image" mode="aspectFit" class="result-image"></image>
      </view>
      <view class="result-section">
        <view class="result-header">
          <text class="section-title">识别结果</text>
          <text class="confidence">置信度：{{ (resultData.confidence * 100).toFixed(1) }}%</text>
        </view>
        <view class="result-item">
          <text class="label">布料类型</text>
          <text class="value">{{ resultData.fabricType }}</text>
        </view>
        <view class="result-item">
          <text class="label">材质成分</text>
          <text class="value">{{ resultData.material }}</text>
        </view>
      </view>
      <view class="features-section">
        <text class="section-title">特点说明</text>
        <view class="features-list">
          <view class="feature-item" v-for="(feature, index) in resultData.features" :key="index">
            <text class="feature-text">{{ feature }}</text>
          </view>
        </view>
      </view>
      <view class="usage-section">
        <text class="section-title">适用场景</text>
        <text class="usage-text">{{ resultData.usage }}</text>
      </view>
      <view class="action-buttons">
        <button class="action-btn retry-btn" @click="retryRecognition">重新识别</button>
        <button class="action-btn save-btn" @click="saveResult">保存结果</button>
      </view>
      <view class="timestamp">
        <text class="time-text">识别时间：{{ resultData.recognizeTime }}</text>
      </view>
    </view>
  `,
  data() {
    return {
      resultData: {
        id: 0,
        image: '',
        fabricType: '',
        material: '',
        usage: '',
        features: [],
        confidence: 0,
        recognizeTime: ''
      }
    }
  },
  methods: {
    retryRecognition() {
      uni.navigateBack()
    },
    saveResult() {
      const savedHistory = uni.getStorageSync('savedHistory') || []

      const exists = savedHistory.some(item => item.id === this.resultData.id)

      if (exists) {
        uni.showToast({
          title: '该结果已保存',
          icon: 'none'
        })
        return
      }

      savedHistory.unshift({
        ...this.resultData,
        saveTime: new Date().toLocaleString()
      })

      if (savedHistory.length > 50) {
        savedHistory.pop()
      }

      uni.setStorageSync('savedHistory', savedHistory)

      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }
  }
}

describe('结果页组件', () => {
  let wrapper

  beforeEach(() => {
    clearAllMocks()
    uni.getStorageSync.mockReturnValue([])
    wrapper = createMockWrapper(ResultComponent)
  })

  it('应该正确渲染初始状态', () => {
    expect(wrapper.find('.container').exists()).toBe(true)
    expect(wrapper.vm.resultData.id).toBe(0)
    expect(wrapper.vm.resultData.fabricType).toBe('')
  })

  it('应该正确显示识别结果数据', async () => {
    await wrapper.setData({ resultData: mockResultData })

    expect(wrapper.find('.result-image').attributes('src')).toBe(mockResultData.image)
    expect(wrapper.find('.confidence').text()).toContain('95.0%')
    expect(wrapper.findAll('.result-item .value')[0].text()).toBe(mockResultData.fabricType)
    expect(wrapper.findAll('.result-item .value')[1].text()).toBe(mockResultData.material)
    expect(wrapper.find('.usage-text').text()).toBe(mockResultData.usage)
    expect(wrapper.find('.time-text').text()).toContain(mockResultData.recognizeTime)
  })

  it('应该正确显示特点列表', async () => {
    await wrapper.setData({ resultData: mockResultData })

    const featureItems = wrapper.findAll('.feature-item')
    expect(featureItems).toHaveLength(mockResultData.features.length)

    mockResultData.features.forEach((feature, index) => {
      expect(featureItems[index].find('.feature-text').text()).toBe(feature)
    })
  })

  it('应该能够重新识别', async () => {
    await wrapper.vm.retryRecognition()

    expect(uni.navigateBack).toHaveBeenCalled()
  })

  it('应该能够保存新结果', async () => {
    await wrapper.setData({ resultData: mockResultData })
    uni.getStorageSync.mockReturnValue([])

    await wrapper.vm.saveResult()

    expect(uni.getStorageSync).toHaveBeenCalledWith('savedHistory')
    expect(uni.setStorageSync).toHaveBeenCalledWith('savedHistory', expect.any(Array))

    const savedData = uni.setStorageSync.mock.calls[0][1]
    expect(savedData).toHaveLength(1)
    expect(savedData[0].id).toBe(mockResultData.id)
    expect(savedData[0].saveTime).toBeDefined()
    expect(uni.showToast).toHaveBeenCalledWith({
      title: '保存成功',
      icon: 'success'
    })
  })

  it('应该防止重复保存相同结果', async () => {
    const existingHistory = [mockResultData]
    uni.getStorageSync.mockReturnValue(existingHistory)

    await wrapper.setData({ resultData: mockResultData })
    await wrapper.vm.saveResult()

    expect(uni.showToast).toHaveBeenCalledWith({
      title: '该结果已保存',
      icon: 'none'
    })
    expect(uni.setStorageSync).not.toHaveBeenCalled()
  })

  it('应该限制保存历史记录数量', async () => {
    const existingHistory = Array(50).fill().map((_, index) => ({
      ...mockResultData,
      id: index
    }))
    uni.getStorageSync.mockReturnValue(existingHistory)

    const newResult = { ...mockResultData, id: 999 }
    await wrapper.setData({ resultData: newResult })
    await wrapper.vm.saveResult()

    const savedData = uni.setStorageSync.mock.calls[0][1]
    expect(savedData).toHaveLength(50)
    expect(savedData[0].id).toBe(999)
  })

  it('应该正确格式化置信度显示', async () => {
    const testResult = { ...mockResultData, confidence: 0.8756 }
    await wrapper.setData({ resultData: testResult })

    expect(wrapper.find('.confidence').text()).toContain('87.6%')
  })
})