<script lang="ts">
	import { goto } from '$app/navigation';
	import { profileStore } from '$lib/type/type';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { writable } from 'svelte/store';
	import Loding from '../../Loding.svelte';
	import { redirect } from '@sveltejs/kit';
	export let data: PageData;

	const isLoading = writable(false);

	const handleSubmit = (event: Event) => {
		isLoading.set(true);
	};

	// 폼에 이벤트 핸들러를 등록
	onMount(() => {
		const form = document.querySelector('.container');
		if (form) {
			form.addEventListener('submit', handleSubmit);
		}
	});
	let id = data.user.userId;
	async function handleSubmits() {
		await fetch('/api/profile', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id })
		});

		redirect(302, '/');
	}

	if (data.user) {
		let userId = data.user.userId;

		isLoading.set(true);

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

				if (response.error) {
					throw new Error('프로필 정보를 가져오는 중 오류가 발생했습니다.');
				}

				const data = await response.json();

				if (data.contents.profile) {
					profileStore.set(data.contents.profile);
				} else {
					throw new Error('프로필을 찾지 못하였습니다.');
				}
			} catch (error) {
				console.error('프로필 정보를 가져오는 중 오류가 발생했습니다:', error);
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
			isLoading.set(false);
		}

		// 페이지가 로드될 때 fetchProfile 함수 호출
		onMount(() => {
			fetchProfile();
		});
	}

	console.log(data.user);

	let error: string | null = null;
	export let form;
	$: if (form) {
		error = form.message;
		isLoading.set(false);
	}
</script>

{#if $isLoading}
	<Loding />
{/if}

<form method="POST" class="container">
	<div class="header">
		<button
			class="back"
			type="button"
			on:click={() => {
				goto('/');
			}}>&#60;</button
		>
	</div>

	<div class="contents">
		<p class="title">계정 정보</p>
		{#if error}
			<p class="error">Error: {error}</p>
		{/if}

		<input type="text" id="name" name="name" value={data.user.name} required />

		<input
			type="text"
			id="schoolName"
			name="schoolName"
			placeholder={data.user.profile.studentsId}
			disabled={true}
		/>

		<input type="text" id="schoolName" name="schoolName" placeholder="현암중학교" disabled={true} />

		<input
			type="email"
			id="email"
			name="email"
			value={$profileStore.email}
			placeholder="이메일을 입력하세요 (선택)"
		/>

		<input
			type="text"
			id="schoolName"
			name="schoolName"
			placeholder={$profileStore.barcode}
			disabled={true}
		/>

		<button on:click={handleSubmits} class="delete"> 계정 삭제</button>
	</div>

	<div class="footer">
		<button type="submit" class="next">변경</button>
	</div>
</form>

<svelte:head>
	<title>에코잉 | 계정관리</title>
	<meta name="description" content="환경을 위한 움직임 ― 에코잉" />
</svelte:head>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	input {
		color: black;
		border: none;
		border-bottom: 0.1rem solid gray;
		margin-top: 2rem;
		width: 80%;
		padding: 0.5rem;
		font-size: 1.5rem;
		height: 3rem;
	}

	.delete {
		color: red;
		border: solid 0.1rem red;
		background-color: white;
		border-radius: 2rem;
		margin-top: 2rem;
		width: 85%;
		padding: 0.5rem;
		font-size: 1.5rem;
		height: 3rem;
		cursor: pointer;
	}

	input:focus {
		border-bottom: 0.1rem solid var(--green-dark);
		outline: none;
	}

	.contents,
	.footer {
		text-align: center;
		align-items: center;
		justify-content: center;
	}

	.header {
		flex: 0.5;
		height: 5vh;
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

	.contents {
		flex: 8.5;
		height: 85vh;
	}
	.title {
		font-size: 2rem;
		padding-top: 1em;
		font-weight: 1000;
	}

	.footer {
		flex: 1;
		height: 10vh;
		width: 100%;
	}

	button.next {
		width: 100%;
		height: 100%;
		background-color: var(--green);
		font-weight: bold;
		color: white;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
	}

	button:disabled {
		color: gray;
	}
</style>
