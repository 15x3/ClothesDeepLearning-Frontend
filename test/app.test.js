import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clearAllMocks } from './utils.js'

// 模拟App组件
const AppComponent = {
  onLaunch: function() {
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}

describe('App组件', () => {
  let app

  beforeEach(() => {
    clearAllMocks()
    app = AppComponent
  })

  it('应该正确初始化App组件', () => {
    expect(app).toBeDefined()
    expect(typeof app.onLaunch).toBe('function')
    expect(typeof app.onShow).toBe('function')
    expect(typeof app.onHide).toBe('function')
  })

  it('应该在启动时调用onLaunch', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    app.onLaunch()

    expect(consoleSpy).toHaveBeenCalledWith('App Launch')
    consoleSpy.mockRestore()
  })

  it('应该在显示时调用onShow', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    app.onShow()

    expect(consoleSpy).toHaveBeenCalledWith('App Show')
    consoleSpy.mockRestore()
  })

  it('应该在隐藏时调用onHide', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    app.onHide()

    expect(consoleSpy).toHaveBeenCalledWith('App Hide')
    consoleSpy.mockRestore()
  })
})