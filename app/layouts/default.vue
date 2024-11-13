<script setup lang="ts">
	const client = useSupabaseClient()
	const signOut = async () => {
		await client.auth.signOut()
		navigateTo('/login', { replace: true })
	}

	const now = useNow({ interval: 60_000 })
</script>

<template>
	<div class="m-inline-auto inline-[min(120ch,90dvw)] min-block-100% flex flex-col gap-4">
		<header class="flex gap-2 flex-items-baseline p-block-4">
			<NuxtLink class="text-size-2xl font-bold" to="/">Spore</NuxtLink>
			<NuxtLink class="mie-auto" to="/create">Create Habit</NuxtLink>
			<!-- <DropdownMenuRoot>
				<DropdownMenuTrigger class="aspect-square flex items-center justify-center border-1 rounded-md bg-transparent p-block-3 p-inline-3">
					<Icon size="1.25em" name="radix-icons:person" />
				</DropdownMenuTrigger>

				<DropdownMenuPortal>
					<DropdownMenuContent
						align="end"
						:side-offset="5"
						class="min-inline-[200px] border-1 border-dark rounded-md border-solid bg-white p-block-2 p-inline-2 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
					>
						<DropdownMenuItem class="select-none" @click="signOut"> Sign Out </DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenuPortal>
			</DropdownMenuRoot> -->
			<button class="border-1 rounded-md border-solid bg-white p-block-2 p-inline-4" @click="signOut">Sign Out</button>
		</header>
		<main id="main-content" class="flex-1">
			<slot></slot>
		</main>
		<footer class="p-be-8 p-bs-4 text-align-end">
			<span class="font-bold">Spore</span>
			&copy;{{ now.getFullYear() }}
		</footer>
	</div>
</template>
