<template>
	<view class="container">
		<!-- 顶部标题 -->
		<view class="header">
			<text class="title">布料识别系统</text>
		</view>

		<!-- 图片预览区域 -->
		<view class="image-preview" v-if="imagePath">
			<image :src="imagePath" mode="aspectFit" class="preview-img"></image>
		</view>

		<!-- 上传按钮区域 -->
		<view class="button-group">
			<button class="upload-btn" @click="chooseFromAlbum">
				<text class="btn-text">📁 从相册选择</text>
			</button>
			<button class="upload-btn camera-btn" @click="takePhoto">
				<text class="btn-text">📷 拍照识别</text>
			</button>
		</view>

		<!-- 识别按钮 -->
		<button class="recognize-btn" @click="recognizeFabric" :disabled="!imagePath || isLoading">
			<text v-if="!isLoading">开始识别</text>
			<text v-else>识别中...</text>
		</button>

		<!-- 底部导航 -->
		<view class="bottom-nav">
			<view class="nav-item active">
				<text class="nav-text">首页</text>
			</view>
			<view class="nav-item" @click="goToHistory">
				<text class="nav-text">历史记录</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				imagePath: '',
				isLoading: false,
				apiUrl: 'http://localhost:8080/api/recognize' // 后端API地址
			}
		},
		onLoad() {
			// 获取历史记录
			const history = uni.getStorageSync('fabricHistory') || [];
			console.log('已加载历史记录:', history);
		},
		methods: {
			// 从相册选择图片
			chooseFromAlbum() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album'],
					success: (res) => {
						this.imagePath = res.tempFilePaths[0];
						console.log('选择的图片路径:', this.imagePath);
					},
					fail: (err) => {
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						});
					}
				});
			},

			// 拍照
			takePhoto() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['camera'],
					success: (res) => {
						this.imagePath = res.tempFilePaths[0];
						console.log('拍照的图片路径:', this.imagePath);
					},
					fail: (err) => {
						uni.showToast({
							title: '拍照失败',
							icon: 'none'
						});
					}
				});
			},

			// 识别布料
			async recognizeFabric() {
				if (!this.imagePath) {
					uni.showToast({
						title: '请先选择图片',
						icon: 'none'
					});
					return;
				}

				this.isLoading = true;

				try {
					// 首先上传图片
					uni.showLoading({
						title: '上传中...'
					});

					// 模拟API调用 - 实际开发时替换为真实的后端API
					setTimeout(() => {
						uni.hideLoading();
						this.isLoading = false;

						// 模拟识别结果
						const result = {
							id: Date.now(),
							image: this.imagePath,
							fabricType: '纯棉',
							material: '100%棉',
							usage: '适用于T恤、衬衫等贴身衣物',
							features: ['透气性好', '吸湿性强', '柔软舒适'],
							confidence: 0.95,
							recognizeTime: new Date().toLocaleString()
						};

						// 保存到历史记录
						const history = uni.getStorageSync('fabricHistory') || [];
						history.unshift(result);
						// 只保留最近20条记录
						if (history.length > 20) {
							history.pop();
						}
						uni.setStorageSync('fabricHistory', history);

						// 跳转到结果页面
						uni.navigateTo({
							url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify(result))
						});
					}, 2000);

					/* 实际API调用示例代码
					const uploadRes = await uni.uploadFile({
						url: this.apiUrl,
						filePath: this.imagePath,
						name: 'image',
						formData: {
							'type': 'fabric'
						}
					});

					uni.hideLoading();
					this.isLoading = false;

					if (uploadRes.statusCode === 200) {
						const result = JSON.parse(uploadRes.data);
						// 保存结果并跳转
						uni.navigateTo({
							url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify(result))
						});
					} else {
						throw new Error('识别失败');
					}
					*/

				} catch (error) {
					uni.hideLoading();
					this.isLoading = false;
					uni.showToast({
						title: '识别失败，请重试',
						icon: 'none'
					});
					console.error('识别错误:', error);
				}
			},

			// 跳转到历史记录页
			goToHistory() {
				uni.switchTab({
					url: '/pages/history/history'
				});
			}
		}
	}
</script>

<style>
	.container {
		padding: 40rpx;
		min-height: 100vh;
		background-color: #f5f5f5;
		display: flex;
		flex-direction: column;
	}

	.header {
		text-align: center;
		margin-bottom: 40rpx;
	}

	.title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
	}

	.image-preview {
		width: 100%;
		height: 600rpx;
		background-color: #fff;
		border-radius: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
	}

	.preview-img {
		max-width: 100%;
		max-height: 100%;
		border-radius: 20rpx;
	}

	.button-group {
		display: flex;
		justify-content: space-between;
		margin-bottom: 40rpx;
		gap: 20rpx;
	}

	.upload-btn {
		flex: 1;
		height: 100rpx;
		background-color: #fff;
		border-radius: 50rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
		border: none;
	}

	.camera-btn {
		background-color: #4CAF50;
		color: white;
	}

	.btn-text {
		font-size: 32rpx;
		color: inherit;
	}

	.recognize-btn {
		width: 100%;
		height: 100rpx;
		background-color: #2196F3;
		border-radius: 50rpx;
		color: white;
		font-size: 36rpx;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 60rpx;
		border: none;
	}

	.recognize-btn[disabled] {
		background-color: #cccccc;
	}

	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 120rpx;
		background-color: #fff;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.1);
	}

	.nav-item {
		flex: 1;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.nav-item.active {
		color: #2196F3;
		border-top: 4rpx solid #2196F3;
	}

	.nav-text {
		font-size: 28rpx;
	}
</style>
