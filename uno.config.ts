import { defineConfig, presetMini } from 'unocss'

export default defineConfig({
	presets: [presetMini()],
	rules: [
		[`border-collapse`, { 'border-collapse': 'collapse' }],
		[
			`inclusively-hidden`,
			{
				position: `absolute`,
				width: `1px`,
				height: `1px`,
				overflow: `hidden`,
				clip: `rect(0 0 0 0)`,
				[`clip-path`]: `inset(50%)`,
				[`white-space`]: `nowrap`,
			},
		],
	],
})
