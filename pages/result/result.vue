<template>
	<view class="container">
		<!-- 图片展示 -->
		<view class="image-section">
			<image :src="resultData.image" mode="aspectFit" class="result-image"></image>
		</view>

		<!-- 识别结果 -->
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

		<!-- 特点说明 -->
		<view class="features-section">
			<text class="section-title">特点说明</text>
			<view class="features-list">
				<view class="feature-item" v-for="(feature, index) in resultData.features" :key="index">
					<text class="feature-text">{{ feature }}</text>
				</view>
			</view>
		</view>

		<!-- 适用场景 -->
		<view class="usage-section">
			<text class="section-title">适用场景</text>
			<text class="usage-text">{{ resultData.usage }}</text>
		</view>

		<!-- 操作按钮 -->
		<view class="action-buttons">
			<button class="action-btn retry-btn" @click="retryRecognition">重新识别</button>
			<button class="action-btn save-btn" @click="saveResult">保存结果</button>
		</view>

		<!-- 时间戳 -->
		<view class="timestamp">
			<text class="time-text">识别时间：{{ resultData.recognizeTime }}</text>
		</view>
	</view>
</template>

<script>
	export default {
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
		onLoad(options) {
			if (options.data) {
				try {
					this.resultData = JSON.parse(decodeURIComponent(options.data));
				} catch (e) {
					console.error('解析数据失败:', e);
					uni.showToast({
						title: '数据加载失败',
						icon: 'none'
					});
				}
			}
		},
		methods: {
			// 重新识别
			retryRecognition() {
				uni.navigateBack();
			},

			// 保存结果到本地
			saveResult() {
				// 获取已保存的历史
				const savedHistory = uni.getStorageSync('savedHistory') || [];

				// 检查是否已保存过
				const exists = savedHistory.some(item => item.id === this.resultData.id);

				if (exists) {
					uni.showToast({
						title: '该结果已保存',
						icon: 'none'
					});
					return;
				}

				// 保存结果
				savedHistory.unshift({
					...this.resultData,
					saveTime: new Date().toLocaleString()
				});

				// 限制保存数量
				if (savedHistory.length > 50) {
					savedHistory.pop();
				}

				uni.setStorageSync('savedHistory', savedHistory);

				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
			}
		}
	}
</script>

<style>
	.container {
		padding: 40rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.image-section {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 20rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
	}

	.result-image {
		width: 100%;
		height: 500rpx;
		border-radius: 10rpx;
	}

	.result-section {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
	}

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.confidence {
		font-size: 28rpx;
		color: #4CAF50;
	}

	.result-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.result-item:last-child {
		border-bottom: none;
	}

	.label {
		font-size: 30rpx;
		color: #666;
	}

	.value {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.features-section {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
	}

	.features-list {
		margin-top: 20rpx;
	}

	.feature-item {
		background-color: #f8f8f8;
		padding: 20rpx;
		border-radius: 10rpx;
		margin-bottom: 15rpx;
	}

	.feature-text {
		font-size: 28rpx;
		color: #333;
	}

	.usage-section {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
	}

	.usage-text {
		font-size: 30rpx;
		color: #666;
		line-height: 1.6;
		margin-top: 20rpx;
	}

	.action-buttons {
		display: flex;
		justify-content: space-between;
		margin-bottom: 40rpx;
		gap: 20rpx;
	}

	.action-btn {
		flex: 1;
		height: 90rpx;
		border-radius: 45rpx;
		font-size: 32rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border: none;
	}

	.retry-btn {
		background-color: #fff;
		color: #666;
		border: 2rpx solid #ddd;
	}

	.save-btn {
		background-color: #4CAF50;
		color: white;
	}

	.timestamp {
		text-align: center;
		padding-bottom: 40rpx;
	}

	.time-text {
		font-size: 24rpx;
		color: #999;
	}
</style>