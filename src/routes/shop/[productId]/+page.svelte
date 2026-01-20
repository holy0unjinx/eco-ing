<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Loding from '../../Loding.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { profileStore, type Product } from '$lib/type/type';
	export let data: PageData;

	let userId = data.user.userId;

	// API 요청을 보내고 응답에서 point 값을 추출하는 함수
	async function fetchProfile() {
		if (!data.user.userId) {
			await goto('/');
		}

		try {
			const response: any = await fetch('/api/profile', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: userId
				})
			});

			const data = await response.json();
			console.log(data);

			if (data.contents.profile) {
				profileStore.set(data.contents.profile);
			} else {
				throw new Error('프로필을 불러오지 못했습니다.');
			}
		} catch (error) {
			console.error('프로필을 불러오는 도중 오류가 발생했습니다.:', error);
			profileStore.set({
				id: '',
				user_id: '',
				point: 0,
				level: 0,
				barcode: '',
				email: null,
				class: ''
			});
		}
	}

	// 페이지가 로드될 때 fetchProfile 함수 호출
	onMount(async () => {
		isLoading.set(true);
		await fetchProfile();
		isLoading.set(false);
	});

	const pid = $page.params.productId;

	let isLoading = writable(false);
	let product: Product;
	let product_due: string;

	function handleSubmit() {
		isLoading.set(true);
	}

	onMount(async () => {
		isLoading.set(true);
		try {
			const response: any = await fetch('/api/product', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: Number(pid)
				})
			});
			const data = await response.json();

			product = data.contents.product;

			const response_key: any = await fetch('/api/product/key', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					productId: product.id,
					secret: '현암중학교'
				})
			});
			const data_key = await response_key.json();
			product_due = data_key.contents.product_key.due_date;
		} catch (error) {
			console.error('제품을 불러오는데 오류가 발생했습니다:', error);
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
		goto('/shop');
	}}>&#60;</button
>

<center>
	<p class="title">구매</p>
</center>

<hr />

<div class="contents">
	<div>
		{#if product !== undefined}
			{#if product.published}
				<form method="POST" class="card" on:submit={handleSubmit}>
					<img src={product.imgURL} alt={product.name} class="card-image" />
					<div class="card-content">
						<h2 class="card-title">{product.name} ({product.where_to_use})</h2>
						<hr class="asdasd" />
						<p class="card-des">{product.description}</p>
						{#if product.amount <= 0}
							<p class="card-sold-out">품절됨</p>
						{:else if product.amount < 3}
							<p class="card-sold-out">품절임박! {product.amount}개 남음!</p>
						{/if}
						<p class="card-price">{product.price}P</p>
						<p class="card-price-my">현재 보유 포인트: {$profileStore.point}P</p>

						{#if product.amount > 0}
							<p class="card-sold-out">{product_due}내에 사용 가능</p>
						{/if}
						<input type="tel" placeholder="전화번호 (- 제외)" name="phone" id="phone" />
						<input
							type="submit"
							value={product.amount <= 0 ? '품절' : '구매'}
							class="card-link"
							disabled={product.price > $profileStore.point || product.amount <= 0}
						/>
					</div>
				</form>
			{:else}
				비공개 입니다.
			{/if}
		{/if}
	</div>
</div>

<style>
	input {
		margin-top: 1rem;
		width: calc(100% - 2rem);
		font-size: 2rem;
		padding: 1rem;
	}
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
	/* CSS 추가 */
	.contents {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		padding: 20px;
		width: 100%;
	}

	.card {
		width: calc(100% - 40px);
		margin-bottom: 20px;
		box-sizing: border-box;
		border-radius: 5px;
		overflow: hidden;
	}

	.card-image {
		width: 100%;
		display: block;
	}

	.card-content {
		padding: 10px;
	}

	.asdasd {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	.card-title {
		margin-top: 0;
		font-size: 3rem;
	}

	.card-price {
		text-align: right;
		font-size: 3rem;
		color: green;
		font-weight: 1000;
	}
	.card-price-my {
		text-align: right;
		font-size: 2rem;
		color: black;
		font-weight: 700;
	}

	.card-sold-out {
		color: red;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.card-des {
		font-size: 1.25rem;
	}

	.card-link {
		display: block;
		text-align: center;
		margin-top: 10px;
		text-decoration: none;
		background-color: #007bff;
		color: white;
		padding: 1rem 1rem;
		border-radius: 5px;
		font-size: 1.5rem;
		width: 100%;
		cursor: pointer;
	}

	.card-link:disabled {
		background-color: #919191;
	}
</style>
