<script>
	// 여기에 필요한 스크립트를 추가할 수 있습니다.
</script>

<div class="container">
	<div class="box">Box 1</div>
	<div class="box">Box 2</div>
	<div class="box">Box 3</div>
	<div class="box">Box 4</div>
	<!-- 필요한 만큼 박스를 추가하세요 -->
</div>

<style>
	.container {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.box {
		flex: 1 1 calc(50% - 1rem); /* 각 박스가 컨테이너의 절반을 차지하도록 */
		background-color: lightblue;
		padding: 1rem;
		box-sizing: border-box;
	}
</style>
