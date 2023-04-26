import config from 'config'
import { createReadStream } from 'fs'
import { Configuration, OpenAIApi } from 'openai'

class OpenAI {
	constructor(apiKey) {
		const config = new Configuration({
			apiKey,
		})
		this.openai = new OpenAIApi(config)
	}

	async chat(messages) {
		try {
			const response = await this.openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages,
			})
			return response.data.choices[0].message
		} catch (error) {
			console.log('Error from chatGPT', error.message)
		}
	}

	async speechToText(filepath) {
		try {
			const response = await this.openai.createTranscription(
				createReadStream(filepath),
				'whisper-1',
			)
			return response.data.text
		} catch (error) {
			console.log('Error while transcription', error.message)
		}
	}
}

export const openai = new OpenAI(config.get('OPENAI_API_KEY'))
