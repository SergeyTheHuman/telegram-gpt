import axios from 'axios'
import { createWriteStream } from 'fs'
import { resolve } from 'path'
import { __dirname } from './constants.js'

class Downloader {
	constructor() {}

	async download(url, filename) {
		try {
			const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)
			const response = await axios({
				method: 'get',
				url,
				responseType: 'stream',
			})
			return new Promise((resolve) => {
				const stream = createWriteStream(oggPath)
				response.data.pipe(stream)
				stream.on('finish', () => resolve(oggPath))
			})
		} catch (error) {
			console.log('Error while fetching file', error.message)
		}
	}
}

export const downloader = new Downloader()
