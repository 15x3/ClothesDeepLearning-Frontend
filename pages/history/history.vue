<template>
	<view class="container">
		<!-- 筛选选项 -->
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

		<!-- 历史记录列表 -->
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

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<text class="empty-text">暂无历史记录</text>
			<text class="empty-tip">使用识别功能后，结果将显示在这里</text>
		</view>

		<!-- 清除按钮 -->
		<view class="clear-section" v-if="currentHistory.length > 0">
			<button class="clear-btn" @click="clearHistory">清除{{ currentTab === 'saved' ? '已保存' : '全部' }}记录</button>
		</view>

		<!-- 底部导航 -->
		<view class="bottom-nav">
			<view class="nav-item" @click="goToHome">
				<text class="nav-text">首页</text>
			</view>
			<view class="nav-item active">
				<text class="nav-text">历史记录</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 'all',
				history: [],
				savedHistory: []
			}
		},
		computed: {
			// 当前显示的历史记录
			currentHistory() {
				return this.currentTab === 'all' ? this.history : this.savedHistory;
			},
			// 过滤后的历史记录（根据当前标签）
			filteredHistory() {
				if (this.currentTab === 'all') {
					return this.history;
				} else {
					return this.savedHistory;
				}
			}
		},
		onShow() {
			this.loadHistory();
		},
		methods: {
			// 加载历史记录
			loadHistory() {
				this.history = uni.getStorageSync('fabricHistory') || [];
				this.savedHistory = uni.getStorageSync('savedHistory') || [];
			},

			// 切换标签
			switchTab(tab) {
				this.currentTab = tab;
			},

			// 查看详情
			viewDetail(item) {
				uni.navigateTo({
					url: '/pages/result/result?data=' + encodeURIComponent(JSON.stringify(item))
				});
			},

			// 清除历史记录
			clearHistory() {
				uni.showModal({
					title: '确认清除',
					content: `确定要清除所有${this.currentTab === 'saved' ? '已保存的' : ''}历史记录吗？`,
					success: (res) => {
						if (res.confirm) {
							if (this.currentTab === 'all') {
								this.history = [];
								uni.removeStorageSync('fabricHistory');
							} else {
								this.savedHistory = [];
								uni.removeStorageSync('savedHistory');
							}

							uni.showToast({
								title: '清除成功',
								icon: 'success'
							});
						}
					}
				});
			},

			// 返回首页
			goToHome() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			}
		}
	}
</script>

<style>
	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 140rpx;
	}

	.filter-tabs {
		display: flex;
		background-color: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		padding: 10rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 20rpx;
		border-radius: 15rpx;
	}

	.tab-item.active {
		background-color: #2196F3;
	}

	.tab-text {
		font-size: 30rpx;
		color: #666;
	}

	.tab-item.active .tab-text {
		color: #fff;
		font-weight: bold;
	}

	.history-list {
		height: calc(100vh - 320rpx);
	}

	.history-item {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
		position: relative;
	}

	.item-image {
		width: 120rpx;
		height: 120rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
	}

	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.item-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.item-material {
		font-size: 28rpx;
		color: #666;
	}

	.item-time {
		font-size: 24rpx;
		color: #999;
	}

	.item-confidence {
		font-size: 24rpx;
		color: #4CAF50;
	}

	.item-status {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		background-color: #4CAF50;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
	}

	.status-text {
		font-size: 22rpx;
		color: #fff;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 400rpx;
	}

	.empty-text {
		font-size: 32rpx;
		color: #999;
		margin-bottom: 20rpx;
	}

	.empty-tip {
		font-size: 26rpx;
		color: #ccc;
	}

	.clear-section {
		padding: 20rpx 0;
	}

	.clear-btn {
		width: 100%;
		height: 80rpx;
		background-color: #ff4757;
		color: #fff;
		border-radius: 40rpx;
		font-size: 30rpx;
		border: none;
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