<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Loding from '../../Loding.svelte';

	const isLoading = writable(false);

	// 폼 제출 이벤트 핸들러
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

<form method="POST" class="container" use:enhance>
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
		<p class="title">로그인</p>
		{#if error}
			<p class="error">오류: {error}</p>
		{/if}
		<input type="text" id="username" name="username" placeholder="학번" required />
		<input type="password" id="password" name="password" placeholder="비밀번호" required />
		<a
			href="https://docs.google.com/forms/d/e/1FAIpQLSe1OcBIFItSp8aMhkRJijCHrckZzXCvhzYF4zjjhdZA3VlQqA/viewform?usp=sf_link"
			><p class="asdfa">로그인 할 수 없나요? 여기를 클릭해주세요.</p></a
		>
	</div>
	<div class="footer">
		<button type="submit" class="next">로그인</button>
	</div>
</form>

<svelte:head>
	<title>에코잉 | 로그인</title>
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

	a {
		text-decoration: none;
		text-decoration-color: none;
		text-decoration-line: none;
		color: gray;
		font-size: 1.25rem;
	}

	.asdfa {
		margin-top: 1rem;
	}
</style>
