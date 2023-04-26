import installer from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import { dirname, resolve } from 'path'
import { deleteFile } from './helpers.js'

class OggConverter {
	constructor() {
		ffmpeg.setFfmpegPath(installer.path)
	}

	async convertOggToMP3(oggPath, userId) {
		try {
			const outputPath = resolve(dirname(oggPath), `${userId}.mp3`)
			return new Promise((resolve, reject) => {
				ffmpeg(oggPath)
					.inputOption('-t 30')
					.output(outputPath)
					.on('end', () => {
						deleteFile(oggPath)
						resolve(outputPath)
					})
					.on('error', (error) => reject(error.message))
					.run()
			})
		} catch (error) {
			console.log('Error while converting ogg to mp3', error.message)
		}
	}
}

export const oggConverter = new OggConverter()
