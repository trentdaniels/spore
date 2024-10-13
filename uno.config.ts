import { defineConfig, presetMini } from 'unocss'

export default defineConfig({
	presets: [presetMini()],
	rules: [[`border-collapse`, { 'border-collapse': 'collapse' }]],
})
