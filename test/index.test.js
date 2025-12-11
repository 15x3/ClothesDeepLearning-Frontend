import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockWrapper, mockResultData, clearAllMocks } from './utils.js'

// 模拟首页组件
const IndexComponent = {
  template: `
    <view class="container">
      <view class="image-preview" v-if="imagePath">
        <image :src="imagePath" mode="aspectFit" class="preview-img"></image>
      </view>
      <view class="button-group">
        <button class="upload-btn" @click="chooseFromAlbum">
          <text class="btn-text">📁 从相册选择</text>
        </button>
        <button class="upload-btn camera-btn" @click="takePhoto">
          <text class="btn-text">📷 拍照识别</text>
        </button>
      </view>
      <button class="recognize-btn" @click="recognizeFabric" :disabled="!imagePath || isLoading">
        <text v-if="!isLoading">开始识别</text>
        <text v-else>识别中...</text>
      </button>
      <view class="bottom-nav">
        <view class="nav-item active">
          <text class="nav-text">首页</text>
        </view>
        <view class="nav-item" @click="goToHistory">
          <text class="nav-text">历史记录</text>
        </view>
      </view>
    </view>
  `,
  data() {
    return {
      imagePath: '',
      isLoading: false,
      apiUrl: 'http://localhost:8080/api/recognize'
    }
  },
  methods: {
    chooseFromAlbum() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: (res) => {
          this.imagePath = res.tempFilePaths[0]
          console.log('选择的图片路径:', this.imagePath)
        },
        fail: (err) => {
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
      })
    },
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
          this.imagePath = res.tempFilePaths[0]
          console.log('拍照的图片路径:', this.imagePath)
        },
        fail: (err) => {
          uni.showToast({
            title: '拍照失败',
            icon: 'none'
          })
        }
      })
    },
    async recognizeFabric() {
      if (!this.imagePath) {
        uni.showToast({
          title: '请先选择图片',
          icon: 'none'
        })
        return
      }

      this.isLoading = true
      uni.showLoading({
        title: '上传中...'
      })

      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading()
        this.isLoading = false

        const result = {
          ...mockResultData,
          id: Date.now(),
          image: this.imagePath,
          recognizeTime: new Date().toLocaleString()
        }

        const history = uni.getStorageSync('fabricHistory') || []
        history.unshift(result)
        if (history.length > 20) {
          history.pop()
        }
        uni.setStorageSync('fabricHistory', history)

        uni.navigateTo({
          url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify(result))
        })
      }, 2000)
    },
    goToHistory() {
      uni.switchTab({
        url: '/pages/history/history'
      })
    }
  }
}

describe('首页组件', () => {
  let wrapper

  beforeEach(() => {
    clearAllMocks()
    uni.getStorageSync.mockReturnValue([])
    wrapper = createMockWrapper(IndexComponent)
  })

  it('应该正确渲染初始状态', () => {
    expect(wrapper.find('.container').exists()).toBe(true)
    expect(wrapper.find('.header .title').text()).toContain('布料识别系统')
    expect(wrapper.vm.imagePath).toBe('')
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('应该在没有图片时禁用识别按钮', () => {
    const recognizeBtn = wrapper.find('.recognize-btn')
    expect(recognizeBtn.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.recognize-btn text').text()).toBe('开始识别')
  })

  it('应该在有图片时启用识别按钮', async () => {
    await wrapper.setData({ imagePath: '/mock/path/to/image.jpg' })
    const recognizeBtn = wrapper.find('.recognize-btn')
    expect(recognizeBtn.attributes('disabled')).toBeUndefined()
  })

  it('应该正确处理从相册选择图片', async () => {
    const mockFilePath = '/mock/path/to/selected-image.jpg'
    uni.chooseImage.mockImplementation(({ success }) => {
      success({ tempFilePaths: [mockFilePath] })
    })

    await wrapper.vm.chooseFromAlbum()

    expect(uni.chooseImage).toHaveBeenCalledWith({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: expect.any(Function),
      fail: expect.any(Function)
    })
    expect(wrapper.vm.imagePath).toBe(mockFilePath)
  })

  it('应该正确处理拍照', async () => {
    const mockFilePath = '/mock/path/to/photo.jpg'
    uni.chooseImage.mockImplementation(({ success }) => {
      success({ tempFilePaths: [mockFilePath] })
    })

    await wrapper.vm.takePhoto()

    expect(uni.chooseImage).toHaveBeenCalledWith({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: expect.any(Function),
      fail: expect.any(Function)
    })
    expect(wrapper.vm.imagePath).toBe(mockFilePath)
  })

  it('应该在没有选择图片时显示提示', async () => {
    await wrapper.vm.recognizeFabric()

    expect(uni.showToast).toHaveBeenCalledWith({
      title: '请先选择图片',
      icon: 'none'
    })
  })

  it('应该在选择图片后开始识别流程', async () => {
    await wrapper.setData({ imagePath: '/mock/path/to/image.jpg' })

    // 使用 Promise 模拟异步操作
    const recognizePromise = wrapper.vm.recognizeFabric()

    expect(wrapper.vm.isLoading).toBe(true)
    expect(uni.showLoading).toHaveBeenCalledWith({
      title: '上传中...'
    })

    // 等待 setTimeout 执行
    await new Promise(resolve => setTimeout(resolve, 2100))
    await recognizePromise

    expect(wrapper.vm.isLoading).toBe(false)
    expect(uni.hideLoading).toHaveBeenCalled()
    expect(uni.navigateTo).toHaveBeenCalled()
  })

  it('应该正确处理选择图片失败的情况', async () => {
    uni.chooseImage.mockImplementation(({ fail }) => {
      fail(new Error('User cancelled'))
    })

    await wrapper.vm.chooseFromAlbum()

    expect(uni.showToast).toHaveBeenCalledWith({
      title: '选择图片失败',
      icon: 'none'
    })
  })

  it('应该能够跳转到历史记录页面', async () => {
    await wrapper.vm.goToHistory()

    expect(uni.switchTab).toHaveBeenCalledWith({
      url: '/pages/history/history'
    })
  })
})