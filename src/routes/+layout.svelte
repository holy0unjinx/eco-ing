<script lang="ts">
	import { navigating } from '$app/stores';
	import './layout.css';
	import Loding from './Loding.svelte';
</script>

<div class="container">
	{#if $navigating}
		<Loding />
	{:else}
		<slot />
	{/if}
</div>
