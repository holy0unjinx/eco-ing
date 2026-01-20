<div id="loading" class="show">
	<div class="spinner" />
</div>

<style>
	#loading {
		display: none; /* 처음에는 보이지 않도록 설정 */
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(128, 128, 128, 0.8); /* 회색 배경 */
		z-index: 1000;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#loading.show {
		display: flex;
	}

	.spinner {
		border: 8px solid rgba(255, 255, 255, 0.3); /* 흰색 투명 테두리 */
		border-top: 8px solid white; /* 흰색 상단 테두리 */
		border-radius: 50%;
		width: 60px;
		height: 60px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
