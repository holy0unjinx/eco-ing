<script lang="ts">
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import Loding from '../../Loding.svelte';

	export let step: number = 0;
	const titles = [
		'안녕하세요?',
		'이름을 알려주세요!',
		'학번을 입력해주세요.',
		'비밀번호를 설정해주세요.',
		'학생증 뒷면 바코드의 글자를 입력해주세요.'
	];

	const isLoading = writable(false);

	// 입력 값 저장 변수
	const formValues = writable({
		name: '',
		studentsId: '',
		password: '',
		barcode: ''
	});

	// 오류 메시지 저장 변수
	const errors = writable({
		name: '',
		studentsId: '',
		password: '',
		barcode: ''
	});

	// 폼 제출 이벤트 핸들러
	const handleSubmit = (event: Event) => {
		isLoading.set(true);
		const { name, studentsId, password, barcode } = $formValues;
		const errorMessages = validateForm(name, studentsId, password, barcode);
		errors.set(errorMessages);

		if (!Object.values(errorMessages).some((msg) => msg !== '')) {
			// 모든 필드가 유효한 경우
			// 여기에서 실제 제출 작업을 수행합니다.
			console.log('Form submitted successfully:', $formValues);
		} else {
			// 유효하지 않은 필드가 있는 경우
			isLoading.set(false);
		}
	};

	function isValidStudentID(studentID: string): boolean {
		// 학번은 5자리 숫자여야 함
		const idPattern = /^\d{5}$/;
		if (!idPattern.test(studentID)) {
			return false;
		}

		// 각 부분을 추출
		const grade = parseInt(studentID.charAt(0));
		const classNum = parseInt(studentID.slice(1, 3));
		const number = parseInt(studentID.slice(3, 5));

		// 유효한 범위 내에 있는지 확인
		if (grade < 1 || grade > 3) {
			return false;
		}

		if (classNum < 1 || classNum > 6) {
			return false;
		}

		if (number < 1 || number > 40) {
			return false;
		}

		return true;
	}

	function isValidKoreanName(name: string): boolean {
		const koreanNamePattern = /^[가-힣]+$/;
		return koreanNamePattern.test(name);
	}

	// 각 단계의 입력값 검증 함수
	const validateForm = (name: string, studentsId: string, password: string, barcode: string) => {
		const errorMessages = { name: '', studentsId: '', password: '', barcode: '' };

		if (step === 1 && !isValidKoreanName(name)) {
			errorMessages.name = '유효한 이름을 입력해주세요.';
		}
		if (step === 2 && !isValidStudentID(String(studentsId))) {
			errorMessages.studentsId = '유효한 학번을 입력해주세요.';
		}
		if (step === 3 && password.length < 6) {
			errorMessages.password = '비밀번호는 최소 6자리입니다.';
		}
		if (step === 4 && barcode.length < 1) {
			errorMessages.barcode = '올바른 바코드를 형식 입력해주세요.';
		}

		return errorMessages;
	};

	// 다음 단계로 이동하기 전에 검증
	const goToNextStep = () => {
		const { name, studentsId, password, barcode } = $formValues;
		const errorMessages = validateForm(name, studentsId, password, barcode);
		errors.set(errorMessages);

		if (!Object.values(errorMessages).some((msg) => msg !== '')) {
			step = step + 1;
		}
	};
</script>

{#if $isLoading}
	<Loding />
{/if}

<div class="container">
	<form method="POST" on:submit={handleSubmit}>
		<div class="header">
			<button
				class="back"
				type="button"
				on:click={() => {
					if (step == 0) {
						goto('/');
					} else {
						step = step - 1;
					}
				}}>&#60;</button
			>
		</div>

		<div class="contents">
			{#if step == 0}
				<p class="emoji">👋</p>
				<p class="title first">{titles[step]}</p>
				<p class="description">만나서 반가워요! 회원가입을 해볼까요?</p>

				<p class="warn">학생증은 챙기셨죠?</p>
			{:else}
				<p class="title">{titles[step]}</p>
			{/if}

			<p class="warn {step == 0 || step == 1 ? 'hidden' : ''}">
				주의) 이 정보는 한번 쓰면 바꿀 수 없어요!
			</p>

			<input
				type="text"
				id="name"
				name="name"
				placeholder="이름을 입력해주세요."
				class={step == 1 ? '' : 'hidden'}
				bind:value={$formValues.name}
			/>
			<p class="error">{$errors.name}</p>

			<input
				type="number"
				id="studentsId"
				name="studentsId"
				placeholder="학번을 입력해주세요."
				class={step == 2 ? '' : 'hidden'}
				bind:value={$formValues.studentsId}
			/>
			<p class="error">{$errors.studentsId}</p>

			<input
				type="password"
				id="password"
				name="password"
				placeholder="비밀번호를 입력해주세요."
				class={step == 3 ? '' : 'hidden'}
				bind:value={$formValues.password}
			/>
			<p class="error">{$errors.password}</p>

			<input
				type="text"
				id="barcode"
				name="barcode"
				placeholder="바코드를 입력해주세요."
				class={step == 4 ? '' : 'hidden'}
				bind:value={$formValues.barcode}
			/>
			<p class="error">{$errors.barcode}</p>
			<img
				src="https://i.ibb.co/QjF5f4h/22.png"
				alt="22"
				class="{step == 4 ? '' : 'hidden'} imageimg"
			/>
		</div>

		<div class="footer">
			{#if step == 4}
				<button type="submit" class="next">가입하기</button>
			{:else}
				<button class="next" type="button" on:click={goToNextStep}>다음</button>
			{/if}
		</div>
	</form>
</div>

<svelte:head>
	<title>에코잉 | 회원가입</title>
	<meta name="description" content="환경을 위한 움직임 ― 에코잉" />
</svelte:head>

<style>
	.hidden {
		display: none;
	}
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

	.emoji {
		font-size: 9rem;
		padding-top: 1.25em;
		font-weight: 1000;
	}

	.first {
		font-size: 3rem;
		padding-top: 2rem;
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

	.description {
		color: gray;
	}

	.error {
		color: red;
		margin-top: 1rem;
		font-size: 1.5rem;
	}

	.warn {
		color: blue;
		margin-top: 0.5rem;
		font-size: 1.25rem;
	}

	.imageimg {
		margin: 2rem;
		width: calc(100% - 4rem);
	}
</style>
