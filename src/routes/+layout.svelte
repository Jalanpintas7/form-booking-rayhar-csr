<script>
	import favicon from '$lib/assets/favicon.svg';
	import brandLogo from '$lib/assets/logorayharsvg.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<header class="sticky top-0 z-10 bg-[#942392] shadow-[0_1px_0_rgba(17,24,39,0.05)]">
	<div class="max-w-[1000px] mx-auto px-6 box-border h-16 flex items-center justify-center">
		<img src={brandLogo} alt="Logo" class="h-14 w-auto" />
	</div>
	<div class="h-2 bg-gradient-to-r from-[#942392] to-[#942392] [box-shadow:inset_0_-1px_0_rgba(255,255,255,0.2)]"></div>
</header>

<main class="min-h-[calc(100svh-72px)] flex flex-col text-gray-800 bg-[#f7f7fb]">
	<div class="flex-1">
		{@render children?.()}
	</div>
	<footer class="text-gray-500 flex items-center justify-center">
		<div class="py-4 border-t border-[#e5e7eb] bg-[#fafafa] w-full">
			<div class="max-w-[1000px] mx-auto px-6 box-border text-center">
				<small>Hak Cipta © 2025 Rayhar Hak Cipta Terpelihara.</small>
			</div>
		</div>
	</footer>
	<div class="h-2 bg-[#e5e7eb]"></div>
</main>
