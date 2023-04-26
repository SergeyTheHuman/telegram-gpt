import { dirname } from 'path'
import { fileURLToPath } from 'url'

export const __dirname = dirname(fileURLToPath(import.meta.url))

export const CHAT_GPT_ROLES = {
	USER: 'user',
	ASSISTANT: 'assistant',
	SYSTEM: 'system',
}

export const INITIAL_SESSION = {
	messages: [],
}
