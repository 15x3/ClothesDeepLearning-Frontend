import { mount } from '@vue/test-utils'
import { createApp } from 'vue'

// 创建模拟的 Vue 实例挂载函数
export function createMockWrapper(component, options = {}) {
  const app = createApp(component)
  return mount(component, {
    global: {
      plugins: [app],
      mocks: {
        $uni: uni
      }
    },
    ...options
  })
}

// 模拟识别结果数据
export const mockResultData = {
  id: 12345,
  image: '/mock/path/to/image.jpg',
  fabricType: '纯棉',
  material: '100%棉',
  usage: '适用于T恤、衬衫等贴身衣物',
  features: ['透气性好', '吸湿性强', '柔软舒适'],
  confidence: 0.95,
  recognizeTime: '2024-01-01 10:00:00'
}

// 模拟历史记录数据
export const mockHistoryData = [
  mockResultData,
  {
    ...mockResultData,
    id: 12346,
    fabricType: '涤纶',
    material: '100%涤纶',
    usage: '适用于运动服装、外套等',
    features: ['耐磨性强', '不易皱', '快干'],
    confidence: 0.88,
    recognizeTime: '2024-01-01 09:30:00',
    saveTime: '2024-01-01 10:00:00'
  }
]

// 清除所有 mock 调用记录
export function clearAllMocks() {
  Object.keys(uni).forEach(key => {
    if (typeof uni[key] === 'function' && uni[key].mockClear) {
      uni[key].mockClear()
    }
  })
}