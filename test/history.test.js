import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockWrapper, mockHistoryData, clearAllMocks } from './utils.js'

// 模拟历史记录页组件
const HistoryComponent = {
  template: `
    <view class="container">
      <view class="filter-tabs">
        <view
          class="tab-item"
          :class="{ active: currentTab === 'all' }"
          @click="switchTab('all')"
        >
          <text class="tab-text">全部</text>
        </view>
        <view
          class="tab-item"
          :class="{ active: currentTab === 'saved' }"
          @click="switchTab('saved')"
        >
          <text class="tab-text">已保存</text>
        </view>
      </view>
      <scroll-view scroll-y class="history-list" v-if="filteredHistory.length > 0">
        <view
          class="history-item"
          v-for="(item, index) in filteredHistory"
          :key="item.id"
          @click="viewDetail(item)"
        >
          <image :src="item.image" mode="aspectFill" class="item-image"></image>
          <view class="item-info">
            <text class="item-title">{{ item.fabricType }}</text>
            <text class="item-material">{{ item.material }}</text>
            <text class="item-time">{{ item.recognizeTime }}</text>
            <text class="item-confidence">置信度：{{ (item.confidence * 100).toFixed(1) }}%</text>
          </view>
          <view class="item-status" v-if="item.saveTime">
            <text class="status-text">已保存</text>
          </view>
        </view>
      </scroll-view>
      <view class="empty-state" v-else>
        <text class="empty-text">暂无历史记录</text>
        <text class="empty-tip">使用识别功能后，结果将显示在这里</text>
      </view>
      <view class="clear-section" v-if="currentHistory.length > 0">
        <button class="clear-btn" @click="clearHistory">清除{{ currentTab === 'saved' ? '已保存' : '全部' }}记录</button>
      </view>
      <view class="bottom-nav">
        <view class="nav-item" @click="goToHome">
          <text class="nav-text">首页</text>
        </view>
        <view class="nav-item active">
          <text class="nav-text">历史记录</text>
        </view>
      </view>
    </view>
  `,
  data() {
    return {
      currentTab: 'all',
      history: [],
      savedHistory: []
    }
  },
  computed: {
    currentHistory() {
      return this.currentTab === 'all' ? this.history : this.savedHistory
    },
    filteredHistory() {
      if (this.currentTab === 'all') {
        return this.history
      } else {
        return this.savedHistory
      }
    }
  },
  methods: {
    loadHistory() {
      this.history = uni.getStorageSync('fabricHistory') || []
      this.savedHistory = uni.getStorageSync('savedHistory') || []
    },
    switchTab(tab) {
      this.currentTab = tab
    },
    viewDetail(item) {
      uni.navigateTo({
        url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify(item))
      })
    },
    clearHistory() {
      uni.showModal({
        title: '确认清除',
        content: `确定要清除所有${this.currentTab === 'saved' ? '已保存的' : ''}历史记录吗？`,
        success: (res) => {
          if (res.confirm) {
            if (this.currentTab === 'all') {
              this.history = []
              uni.removeStorageSync('fabricHistory')
            } else {
              this.savedHistory = []
              uni.removeStorageSync('savedHistory')
            }

            uni.showToast({
              title: '清除成功',
              icon: 'success'
            })
          }
        }
      })
    },
    goToHome() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}

describe('历史记录页组件', () => {
  let wrapper

  beforeEach(() => {
    clearAllMocks()
    uni.getStorageSync.mockImplementation((key) => {
      if (key === 'fabricHistory') return mockHistoryData
      if (key === 'savedHistory') return [mockHistoryData[1]] // 只有第二个是已保存的
      return []
    })
    wrapper = createMockWrapper(HistoryComponent)
  })

  it('应该正确渲染初始状态', () => {
    expect(wrapper.find('.container').exists()).toBe(true)
    expect(wrapper.vm.currentTab).toBe('all')
    expect(wrapper.find('.tab-item.active .tab-text').text()).toBe('全部')
  })

  it('应该能够切换标签页', async () => {
    const savedTab = wrapper.findAll('.tab-item')[1]
    await savedTab.trigger('click')

    expect(wrapper.vm.currentTab).toBe('saved')
    expect(wrapper.findAll('.tab-item')[1].classes()).toContain('active')
    expect(wrapper.findAll('.tab-item')[1].find('.tab-text').text()).toBe('已保存')
  })

  it('应该正确加载历史记录', async () => {
    await wrapper.vm.loadHistory()

    expect(wrapper.vm.history).toEqual(mockHistoryData)
    expect(wrapper.vm.savedHistory).toEqual([mockHistoryData[1]])
    expect(uni.getStorageSync).toHaveBeenCalledWith('fabricHistory')
    expect(uni.getStorageSync).toHaveBeenCalledWith('savedHistory')
  })

  it('应该在有历史记录时显示列表', async () => {
    await wrapper.vm.loadHistory()

    expect(wrapper.find('.history-list').exists()).toBe(true)
    expect(wrapper.find('.empty-state').exists()).toBe(false)

    const historyItems = wrapper.findAll('.history-item')
    expect(historyItems).toHaveLength(mockHistoryData.length)
  })

  it('应该在无历史记录时显示空状态', async () => {
    uni.getStorageSync.mockReturnValue([])
    await wrapper.vm.loadHistory()
    await wrapper.setData({ currentTab: 'saved' })

    expect(wrapper.find('.history-list').exists()).toBe(false)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-text').text()).toBe('暂无历史记录')
  })

  it('应该正确显示历史记录项信息', async () => {
    await wrapper.vm.loadHistory()

    const firstItem = wrapper.find('.history-item')
    const firstData = mockHistoryData[0]

    expect(firstItem.find('.item-image').attributes('src')).toBe(firstData.image)
    expect(firstItem.find('.item-title').text()).toBe(firstData.fabricType)
    expect(firstItem.find('.item-material').text()).toBe(firstData.material)
    expect(firstItem.find('.item-time').text()).toBe(firstData.recognizeTime)
    expect(firstItem.find('.item-confidence').text()).toContain('95.0%')
  })

  it('应该为已保存项显示状态标记', async () => {
    await wrapper.vm.loadHistory()
    await wrapper.setData({ currentTab: 'saved' })

    const historyItems = wrapper.findAll('.history-item')
    expect(historyItems).toHaveLength(1)
    expect(historyItems[0].find('.item-status').exists()).toBe(true)
    expect(historyItems[0].find('.status-text').text()).toBe('已保存')
  })

  it('应该能够查看详情', async () => {
    await wrapper.vm.loadHistory()
    const firstItem = wrapper.find('.history-item')

    await firstItem.trigger('click')

    expect(uni.navigateTo).toHaveBeenCalledWith({
      url: expect.stringContaining('/pages/result/result?data=')
    })
  })

  it('应该能够清除全部历史记录', async () => {
    uni.showModal.mockImplementation(({ success }) => {
      success({ confirm: true })
    })

    await wrapper.vm.loadHistory()
    await wrapper.vm.clearHistory()

    expect(uni.showModal).toHaveBeenCalledWith({
      title: '确认清除',
      content: '确定要清除所有历史记录吗？',
      success: expect.any(Function)
    })
    expect(uni.removeStorageSync).toHaveBeenCalledWith('fabricHistory')
    expect(wrapper.vm.history).toEqual([])
    expect(uni.showToast).toHaveBeenCalledWith({
      title: '清除成功',
      icon: 'success'
    })
  })

  it('应该能够清除已保存记录', async () => {
    uni.showModal.mockImplementation(({ success }) => {
      success({ confirm: true })
    })

    await wrapper.vm.loadHistory()
    await wrapper.setData({ currentTab: 'saved' })
    await wrapper.vm.clearHistory()

    expect(uni.showModal).toHaveBeenCalledWith({
      title: '确认清除',
      content: '确定要清除所有已保存的历史记录吗？',
      success: expect.any(Function)
    })
    expect(uni.removeStorageSync).toHaveBeenCalledWith('savedHistory')
    expect(wrapper.vm.savedHistory).toEqual([])
  })

  it('应该在用户取消时不清除记录', async () => {
    uni.showModal.mockImplementation(({ success }) => {
      success({ confirm: false })
    })

    await wrapper.vm.loadHistory()
    const originalLength = wrapper.vm.history.length
    await wrapper.vm.clearHistory()

    expect(wrapper.vm.history).toHaveLength(originalLength)
    expect(uni.removeStorageSync).not.toHaveBeenCalled()
  })

  it('应该能够返回首页', async () => {
    await wrapper.vm.goToHome()

    expect(uni.switchTab).toHaveBeenCalledWith({
      url: '/pages/index/index'
    })
  })

  it('应该在没有记录时隐藏清除按钮', async () => {
    uni.getStorageSync.mockReturnValue([])
    await wrapper.vm.loadHistory()

    expect(wrapper.find('.clear-section').exists()).toBe(false)
  })

  it('应该在有记录时显示清除按钮', async () => {
    await wrapper.vm.loadHistory()

    expect(wrapper.find('.clear-section').exists()).toBe(true)
    expect(wrapper.find('.clear-btn').text()).toContain('清除全部记录')
  })
})