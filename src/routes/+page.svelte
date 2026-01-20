<script lang="ts">
	import { goto } from '$app/navigation';
	import { profileStore, type Card } from '$lib/type/type';
	import { writable } from 'svelte/store';
	import type { PageData } from './$types';
	export let data: PageData;
	import { onMount } from 'svelte';
	import Loding from './Loding.svelte';
	let deferredPrompt: any;

	onMount(() => {
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
		});
	});

	function showInstallPrompt() {
		alert('앱 설치는 베타버전입니다. 일부 기종에선 설치가 제한됩니다.');
		if (deferredPrompt) {
			deferredPrompt.prompt();
			deferredPrompt.userChoice.then((choiceResult: any) => {
				if (choiceResult.outcome === 'accepted') {
					console.log('User accepted the A2HS prompt');
				} else {
					console.log('User dismissed the A2HS prompt');
				}
				deferredPrompt = null;
			});
		}
	}

	let isLoading = writable(false);

	const cards = writable<Card[]>([]);

	// 폼 제출 이벤트 핸들러
	const handleSubmit = (event: Event) => {
		isLoading.set(true);
	};

	if (data.user) {
		let userId = data.user.userId;

		// API 요청을 보내고 응답에서 point 값을 추출하는 함수
		async function fetchProfile() {
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

				if (data.contents.profile) {
					profileStore.set(data.contents.profile);
				} else {
					throw new Error('프로필을 찾지 못했습니다.');
				}
			} catch (error) {
				console.error('프로필을 가져오는 도중 오류가 발생했습니다.:', error);
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
	}

	onMount(async () => {
		isLoading.set(true);
		try {
			const response = await fetch('/api/card');
			const data = await response.json();
			cards.set(data.contents.cards);
		} catch (error) {
			console.error('카드를 가져오는 도중 오류가 발생했습니다:', error);
		}
		isLoading.set(false);
	});
</script>

<svelte:head>
	<title>에코잉 | HOME</title>
	<meta name="description" content="환경을 위한 움직임 ― 에코잉" />
</svelte:head>

{#if $isLoading}
	<Loding />
{/if}

<main>
	<div class="container">
		{#if !data.user}
			<div class="box green no-top-radius">
				<p class="title">Eco -ing</p>
				<p class="description">환경을 지키는 움직임 - 에코잉</p>
				<div class="small-box">
					<a href="/auth/login">로그인 하기</a>
				</div>
				<div class="small-box">
					<a href="/auth/register">회원가입 하기</a>
				</div>
			</div>
			<div class="toolkit">
				<div class="menu-button">
					<button
						on:click={() => {
							goto('/');
						}}
						><p>Main Page</p>
						메인 페이지</button
					>
				</div>
				<div class="menu-button">
					<button on:click={showInstallPrompt}
						><p>Installation (beta)</p>
						앱 설치 (beta)</button
					>
					<p>></p>
				</div>
				<div class="menu-button">
					<button
						on:click={() => {
							goto('/auth/login');
						}}
						><p>Sign in</p>
						로그인</button
					>
					<p>></p>
				</div>
				<div class="menu-button">
					<button
						on:click={() => {
							goto('/auth/register');
						}}
						><p>Sign up</p>
						회원가입</button
					>
					<p>></p>
				</div>
			</div>
		{:else}
			<div class="box green no-top-radius">
				<p class="title">Eco -ing</p>
				<p class="description">환경을 지키는 움직임 - 에코잉</p>
				<div class="point">
					<p class="small-title">{data.user.name}님의 환경 포인트</p>
					<p class="big-number">{$profileStore.point}P</p>
				</div>
			</div>
			<div class="toolkit">
				<div class="menu-button">
					<button
						on:click={() => {
							goto('/');
						}}
						><p>Main Page</p>
						메인 페이지</button
					>
				</div>
				<div class="menu-button">
					<button
						on:click={() => {
							goto('/shop');
						}}
						><p>Shop</p>
						구매
					</button>
					<p>></p>
				</div>

				<div class="menu-button">
					<form method="POST">
						<button formaction="/logout" type="submit" on:submit={handleSubmit}
							><p>Log out</p>
							로그아웃</button
						>
					</form>
				</div>
				<div class="menu-button">
					<button
						on:click={() => {
							goto('/auth/accounts');
						}}
						><p>Accounts</p>
						계정관리</button
					>
					<p>></p>
				</div>
				<div class="menu-button">
					<button on:click={showInstallPrompt}
						><p>Installation (beta)</p>
						앱 설치 (beta)</button
					>
					<p>></p>
				</div>
				<div class="menu-button">
					<button
						on:click={() => {
							goto('/competition');
						}}
						><p>Competition</p>
						반 대항전 확인</button
					>
					<p>></p>
				</div>
			</div>
		{/if}
	</div>
	<div class="contents">
		<div>
			{#each $cards as card}
				{#if card.style == 'only_image'}
					<div class="card">
						<a href={card.url} class="card-link2"
							><img src={card.imgURL} alt={card.title} class="card-image2" /></a
						>
					</div>
				{:else if card.style == 'only_text'}
					<div class="card">
						<div class="card-content">
							<h2 class="card-title">{card.title}</h2>
							<hr />
							<p>{card.description}</p>
							<p><a href={card.url} class="card-link">바로가기</a></p>
						</div>
					</div>
				{:else}
					<div class="card">
						<img src={card.imgURL} alt={card.title} class="card-image" />
						<div class="card-content">
							<h2 class="card-title">{card.title}</h2>
							<hr />
							<p>{card.description}</p>
							<p><a href={card.url} class="card-link">바로가기</a></p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</main>

<style>
	hr {
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.card {
		width: calc(100% - 2rem);
		margin: 1rem;
		border: 2px solid #ccc;
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		flex-direction: row;
	}

	.card-image {
		width: 30%;
		height: auto;
		object-fit: cover;
	}

	.card-link2 {
		display: flex;
		flex-grow: 1;
	}

	.card-image2 {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card-content {
		padding: 1rem;
		width: 70%;
	}

	.card-title {
		margin-top: 0;
		font-size: 2rem;
	}

	.card-link {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		border: 2px solid #ccc;
		border-radius: 4px;
		text-decoration: none;
		color: inherit;
		transition: background-color 0.3s, color 0.3s;
	}

	.card-link:hover {
		background-color: #ccc;
		color: #fff;
	}
	.container {
		display: flex;
		text-align: center;
		justify-items: center;
		align-items: center;
		flex-wrap: wrap;
		text-decoration: none;
		background-color: rgb(231, 231, 231);
	}

	.title {
		font-size: 3rem;
		margin-top: 1rem;
		font-weight: 800;
	}

	.description {
		font-size: 1rem;
		margin-top: 0.5rem;
		font-weight: 500;
	}

	.box {
		display: inline-block;
		flex-wrap: wrap;
		border-radius: 2rem;
		flex-grow: 1;
		height: 17rem;
		width: 100%;
	}

	.small-box {
		box-sizing: border-box;
		background-color: var(--green-dark);
		margin: 1rem;
		border-radius: 2rem;
		font-weight: 700;
		flex-grow: 1;
		width: calc(100% - 2rem);
		margin-right: 1rem;
		padding-top: 1.25rem;
		padding-bottom: 1.25rem;
		color: white;
	}

	.point {
		display: grid;
		text-align: left;
		margin-top: 1rem;
		background-color: var(--green-dark);
		box-sizing: border-box;
		height: calc(100% - 7.2rem);
		border-radius: 2rem;
	}

	.big-number {
		font-size: 4rem;
		margin-left: 1rem;
		font-weight: 1000;
	}

	.small-title {
		font-size: 1.5rem;
		margin: 1rem;
		margin-left: 1.5rem;
		margin-bottom: 0;
		font-weight: 700;
		height: 1rem;
	}

	.toolkit {
		margin-top: 1rem;
		margin-left: 1rem;
		margin-right: 1rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		grid-gap: 1rem;
		width: 100%;
		margin-bottom: 1rem;
	}

	.menu-button {
		border: 0.1em solid var(--light-gray);
		display: flex;
		justify-content: center;
		align-items: center;
		height: 3rem;
		background-color: white;
		border-radius: 1rem;
		padding: 1rem;
	}

	.menu-button button {
		font-size: 1.25rem;
		text-align: center;
		background-color: white;
		border: none;
		width: 100%;
		height: 100%;
		font-weight: 700;
	}
	.menu-button button p {
		font-weight: 300;
		color: gray;
		font-size: 0.75rem;
	}

	.small-box a {
		color: white;
		text-decoration: none;
	}

	.small-box a:visited {
		color: white;
	}

	.green {
		background-color: var(--green);
		color: white;
	}

	.no-top-radius {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}
</style>
