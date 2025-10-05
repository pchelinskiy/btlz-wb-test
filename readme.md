# Шаблон для выполнения тестового задания

## ВАЖНО!!!

Для тестирования использовались таблицы:

- https://docs.google.com/spreadsheets/d/1pjdKhlCLETjKFT0tdgpqFFrcDn2KJtjn0G6MqJ3Qd_M/edit?gid=0#gid=0
- https://docs.google.com/spreadsheets/d/1jFzuwkqG9ghYr0RF1XffMi0kKxUkWszGkGk0BiHl9vo/edit?gid=0#gid=0
- https://docs.google.com/spreadsheets/d/1lsMn2BZ7HmECM0Q29g84tr_dehkbQet6YhP-C4l8rO0/edit?gid=0#gid=0

ЗАМЕНИТЕ ID ТАБЛИЦЫ В СИДАХ НА ТЕ, К КОТОРЫМ ЕСТЬ ДОСТУП ВАШЕГО СЕРВИСНОГО АККАУНТА

## Описание

Шаблон подготовлен для того, чтобы попробовать сократить трудоемкость выполнения тестового задания.

В шаблоне настоены контейнеры для `postgres` и приложения на `nodejs`.  
Для взаимодействия с БД используется `knex.js`.  
В контейнере `app` используется `build` для приложения на `ts`, но можно использовать и `js`.

Шаблон не является обязательным!\
Можно использовать как есть или изменять на свой вкус.

Все настройки можно найти в файлах:

- compose.yaml
- dockerfile
- package.json
- tsconfig.json
- src/config/env/env.ts
- src/config/knex/knexfile.ts

## Команды:

Запуск базы данных:

```bash
docker compose up -d --build postgres
```

Для выполнения миграций и сидов не из контейнера:

```bash
npm run knex:dev migrate latest
```

```bash
npm run knex:dev seed run
```

Также можно использовать и остальные команды (`migrate make <name>`,`migrate up`, `migrate down` и т.д.)

Для запуска приложения в режиме разработки:

```bash
npm run dev
```

Запуск проверки самого приложения:

```bash
docker compose up -d --build app
```

Для финальной проверки рекомендую:

```bash
docker compose down --rmi local --volumes
docker compose up --build
```

PS: С наилучшими пожеланиями!
