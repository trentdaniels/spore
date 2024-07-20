// @ts-check
import unocss from '@unocss/eslint-config/flat'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
	// @ts-ignore
	// NOTE: adding ts-ignore field because of a type resolution issue, not because the setup is incorrect
	// check back every now and then after upgrading
	unocss
)
