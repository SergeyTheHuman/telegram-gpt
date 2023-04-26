build:
	docker build -t isv_telegram_gpt .
run:
	docker run -d -p 3000:3000 --name isv_tg_gpt --rm isv_telegram_gpt