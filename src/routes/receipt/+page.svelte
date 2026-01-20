<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Loding from '../Loding.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Product } from '$lib/type/type';

	let ref = $page.url.searchParams.get('ref');
	let barcode = $page.url.searchParams.get('barcode');
	console.log(ref);

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
					id: Number(ref)
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
	<p class="title">영수증</p>
</center>

<hr />

<div class="contents">
	<div>
		{#if product !== undefined}
			{#if product.published}
				<img src={product.imgURL} alt={product.name} class="card-image" />
				<img
					src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(
						String(barcode)
					)}&scale=3&height=10&includetext=true&textalign=center&padding=5&backgroundcolor=ffffff`}
					alt={product.name}
					class="card-image"
				/>
				<div class="card-content">
					<h2 class="card-title">{product.name} ({product.where_to_use})</h2>
					<hr class="asdasd" />
					<p class="card-des">{product.description}</p>
				</div>
			{:else}
				비공개 입니다.
			{/if}
		{/if}
	</div>
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
	/* CSS 추가 */
	.contents {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		padding: 20px;
		width: 100%;
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

	.card-des {
		font-size: 1.25rem;
	}
</style>
