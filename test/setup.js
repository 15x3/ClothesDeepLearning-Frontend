// 测试环境设置文件
import { vi } from 'vitest'

// 模拟 uni-app API
global.uni = {
  showToast: vi.fn(),
  hideToast: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  showModal: vi.fn(),
  chooseImage: vi.fn(),
  uploadFile: vi.fn(),
  navigateTo: vi.fn(),
  navigateBack: vi.fn(),
  switchTab: vi.fn(),
  getStorageSync: vi.fn(() => []),
  setStorageSync: vi.fn(),
  removeStorageSync: vi.fn()
}

// 模拟 console 方法以减少测试输出噪音
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
}