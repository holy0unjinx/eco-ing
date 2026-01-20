<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Loding from '../Loding.svelte';
	import { goto } from '$app/navigation';
	import type { Product } from '$lib/type/type';

	let isLoading = writable(false);
	const products = writable<Product[]>([]);

	onMount(async () => {
		isLoading.set(true);
		try {
			const response = await fetch('/api/product');
			const data = await response.json();
			products.set(data.contents.products);
		} catch (error) {
			console.error('제품을 불러오는 도중 오류가 발생했습니다:', error);
		}
		isLoading.set(false);
	});
</script>

<svelte:head>
	<title>에코잉 | SHOP</title>
	<meta name="description" content="환경을 위한 움직임 ― 에코잉" />
</svelte:head>

{#if $isLoading}
	<Loding />
{/if}

<button
	class="back"
	type="button"
	on:click={() => {
		goto('/');
	}}>&#60;</button
>

<center>
	<p class="title">상점</p>
</center>

<hr />

<div class="contents">
	{#each $products as card}
		{#if card.published}
			<div class="card">
				<img src={card.imgURL} alt={card.name} class="card-image" />
				<div class="card-content">
					<h2 class="card-title">{card.name}</h2>
					<p class="card-des">{card.description}</p>
					{#if card.amount <= 0}
						<p class="card-sold-out">품절됨</p>
					{:else if card.amount < 3}
						<p class="card-sold-out">품절임박! {card.amount}개 남음!</p>
					{/if}
					<p class="card-price">{card.price}P</p>
					<p>
						<a
							href="/shop{card.amount <= 0 ? '' : '/' + card.id}"
							class="card-link {card.amount <= 0 ? 'disabled' : ''}"
							>{card.amount <= 0 ? '품절' : '구매'}</a
						>
					</p>
				</div>
			</div>
		{/if}
	{/each}
</div>

<style>
	.back {
		height: 100%;
		width: 10%;
		color: gray;
		font-weight: 400;
		font-size: 1.5rem;
		background-color: white;
		border: none;
	}
	.title {
		margin-top: 1rem;
		margin-bottom: 1rem;
		font-size: 3rem;
		font-weight: 700;
	}
	.contents {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding: 10px;
		gap: 10px; /* 카드 간격 */
		box-sizing: border-box;
	}

	.card {
		flex: 1 1 calc(50% - 20px); /* 2열 정렬을 위해 flex-basis 사용 */
		margin: 10px; /* 카드 간격 */
		border: 1px solid #ddd;
		border-radius: 10px; /* 카드 모서리 둥글게 */
		overflow: hidden;
		box-sizing: border-box;
		background-color: #fff; /* 배경색 추가 */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
	}

	.card-image {
		width: 100%;
		height: auto; /* 비율 유지 */
		display: block;
		border-bottom: 1px solid #ddd; /* 이미지 아래 경계선 */
	}

	.card-content {
		padding: 15px;
	}

	.card-title {
		margin: 0 0 10px 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #333;
	}

	.card-price {
		font-size: 1.25rem;
		color: #e53935; /* 가격 색상 */
		font-weight: 700;
		margin-top: 10px;
	}

	.card-sold-out {
		color: red;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.card-des {
		font-size: 1rem;
		color: #666;
	}

	.card-link {
		display: block;
		text-align: center;
		margin-top: 15px;
		text-decoration: none;
		background-color: #007bff;
		color: white;
		padding: 10px;
		border-radius: 5px;
		font-size: 1rem;
	}

	.disabled {
		background-color: #8b8b8b;
	}

	/* 모바일에서 50% 적용 */
	@media (max-width: 600px) {
		.card {
			flex: 1 1 calc(50% - 20px); /* 작은 화면에서도 50% 너비 */
			margin: 10px;
		}
	}
</style>
