import config from 'config'
import { Markup, Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import { CHAT_GPT_ROLES, INITIAL_SESSION } from './constants.js'
import { downloader } from './downloader.js'
import { deleteFile } from './helpers.js'
import { oggConverter } from './oggConvertor.js'
import { openai } from './openai.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.command('new', async (context) => {
	context.session = INITIAL_SESSION
	await context.reply(code('Жду вашего голосового или текстового сообщения'))
})

bot.command('start', async (context) => {
	context.session = INITIAL_SESSION
	await context.reply(
		code(
			'Привет! Я - Телеграм бот со встроенным чатом GPT. Я умею распознавать текст и речь, попробуй!',
		),
		Markup.keyboard([['Забудь все']])
			.oneTime()
			.resize(),
	)
})

bot.hears('Забудь все', async (context) => {
	context.session = INITIAL_SESSION
	await context.reply(code('Пытаюсь забыть все, что между нами было...'))
})

bot.on(message('voice'), async (context) => {
	context.session ??= INITIAL_SESSION

	try {
		const link = await context.telegram.getFileLink(
			context.message.voice.file_id,
		)
		const userId = context.message.from.id.toString()
		const oggPath = await downloader.download(link.href, userId)
		const mp3Path = await oggConverter.convertOggToMP3(oggPath, userId)
		const text = await openai.speechToText(mp3Path)

		await deleteFile(mp3Path)

		await context.reply(code(`Ваш запрос: ${text}`))
		await context.reply(code(`Думаю... Дайте мне пару секунд`))
		await context.replyWithSticker(
			'CAACAgIAAxkBAAIBNmRJQ4S2QWtXzoXfJPCUJo1TvCHJAAJEAgACNnYgDrLT0ZqwLk_nLwQ',
		)

		context.session.messages.push({
			role: CHAT_GPT_ROLES.USER,
			content: text,
		})

		const responseFromGPT = await openai.chat(context.session.messages)

		context.session.messages.push({
			role: CHAT_GPT_ROLES.ASSISTANT,
			content: responseFromGPT.content,
		})

		await context.reply(responseFromGPT.content)
	} catch (error) {
		console.log('Error while replying on message', error.message)
		await context.reply(code(`Произошла ошибка: ${error.message}`))
	}
})

bot.on(message('text'), async (context) => {
	context.session ??= INITIAL_SESSION

	try {
		await context.reply(code(`Думаю... Дайте мне пару секунд`))
		await context.replyWithSticker(
			'CAACAgIAAxkBAAIBNmRJQ4S2QWtXzoXfJPCUJo1TvCHJAAJEAgACNnYgDrLT0ZqwLk_nLwQ',
		)

		context.session.messages.push({
			role: CHAT_GPT_ROLES.USER,
			content: context.message.text,
		})

		const responseFromGPT = await openai.chat(context.session.messages)

		context.session.messages.push({
			role: CHAT_GPT_ROLES.ASSISTANT,
			content: responseFromGPT.content,
		})

		await context.reply(responseFromGPT.content)
	} catch (error) {
		console.log('Error while replying on message', error.message)
		await context.reply(code(`Произошла ошибка: ${error.message}`))
	}
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
