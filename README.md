# Calma Mountain

Сайт A-frame домиков в горах Кыргызстана: домики и цены, галерея, отзывы с модерацией, онлайн-бронирование, связь через WhatsApp и админ-панель. Языки: русский, кыргызский, английский.

Стек: React 19, Vite, React Router, i18next, **Supabase** (PostgreSQL + Auth + Storage).

## Как устроен проект

```
src/
  lib/supabase.js          подключение к Supabase (ключи из .env)
  services/                ВСЕ запросы к базе — только здесь
    db.js                  общий обработчик ошибок (коды → понятные сообщения)
    authService.js         вход, регистрация, выход, роль из таблицы profiles
    cottagesService.js     домики (CRUD)
    reviewsService.js      отзывы: отправка, модерация
    bookingsService.js     брони и занятые даты
    contentService.js      контакты, условия проживания, FAQ
    storageService.js      загрузка/удаление фото в Supabase Storage
  context/
    AuthContext.jsx        текущий пользователь и его роль
    DataContext.jsx        общие данные сайта + операции с ними
  hooks/                   useData, useAuth, useAsync (загрузка), useRating …
  components/              UI-компоненты (admin/, reviews/, auth/, ui/ …)
  pages/                   страницы, в том числе pages/admin/
  locales/                 переводы ru / kg / en
supabase/
  schema.sql               таблицы, ограничения, триггеры, RLS, Storage
  seed.sql                 исходные данные: Alba, Nimbus, Eclipse, Terra, отзывы, FAQ
```

## Подключение к Supabase (один раз)

1. Зайдите на https://supabase.com, создайте проект (запомните пароль БД — он не нужен сайту).
2. **SQL Editor → New query** → вставьте всё содержимое `supabase/schema.sql` → **Run**.
3. Ещё раз **New query** → вставьте `supabase/seed.sql` → **Run**. Появятся 4 домика, отзывы, FAQ и контакты.
4. **Project Settings → API** (Data API / API Keys): скопируйте **Project URL** и **anon public** (или **publishable**) ключ.
   Ключ `service_role` / `secret` в сайт **не вставлять**.
5. **Authentication → URL Configuration**: Site URL = `http://localhost:5173`; в Redirect URLs добавьте `http://localhost:5173/**` (и адрес сайта после публикации).
6. Для быстрой проверки можно выключить подтверждение почты: **Authentication → Providers → Email → Confirm email** (по желанию). Если оставить включённым — после регистрации нужно перейти по ссылке из письма.
7. Зарегистрируйтесь на сайте (`/register`), затем назначьте себя администратором в **SQL Editor**:

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'ваш-email@example.com');
   ```

   Выйдите и войдите снова — в меню появится «Админ-панель».

8. (Необязательно) OAuth: **Authentication → Providers → Google/GitHub** — включить и вписать Client ID/Secret из Google Cloud / GitHub. Callback URL, который нужно указать у Google/GitHub, Supabase показывает на той же странице (`https://<project>.supabase.co/auth/v1/callback`). Затем в `.env`: `VITE_AUTH_PROVIDERS=google,github`. Пока провайдер не настроен, кнопки не показываются.

## Cloudinary (загрузка фото домиков)

Фото, которые админ добавляет в форме домика, загружаются в Cloudinary через API (unsigned upload).
Cloudinary сам отдаёт картинки в WebP/AVIF и сжимает их (`f_auto,q_auto`).

1. Зарегистрируйтесь на https://cloudinary.com. В **Dashboard** скопируйте **Cloud name**.
2. **Settings → Upload → Upload presets → Add upload preset**:
   - Signing mode: **Unsigned**;
   - Folder: `calma-mountain/cottages` (по желанию);
   - Allowed formats: `jpg, png, webp`; Max file size: 5 МБ (по желанию, защищает от чужих загрузок);
   - **Return delete token: On** — чтобы при «Отмене» только что загруженное фото удалялось.
   Сохраните и скопируйте имя preset.
3. В `.env`:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=ваш_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=имя_preset
   ```
   **API Secret в `.env` не вставлять** — он попадёт в браузер.
4. Перезапустите `npm run dev`.

Ограничение: удалить старое фото из Cloudinary из браузера нельзя (нужен API Secret). Когда фото убирают из домика,
оно пропадает с сайта, а сам файл остаётся в **Media Library** — его можно удалить там вручную.
Если переменные Cloudinary не заданы, фото загружаются в Supabase Storage (bucket ниже).

Bucket `cottage-images` для фото создаётся скриптом `schema.sql` автоматически (публичное чтение, загрузка только админом, до 5 МБ, JPG/PNG/WebP). Проверить: **Storage** → должен быть bucket `cottage-images`.

## Переменные окружения (.env)

| Переменная | Обязательна | Что это |
|---|---|---|
| `VITE_SUPABASE_URL` | да | Project URL |
| `VITE_SUPABASE_ANON_KEY` | да | публичный anon / publishable key |
| `VITE_AUTH_PROVIDERS` | нет | `google`, `github` или `google,github` |
| `VITE_CLOUDINARY_CLOUD_NAME` | нет* | Cloud name из Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | нет* | имя unsigned upload preset |

\* Без них фото грузятся в Supabase Storage вместо Cloudinary.

## Запуск на Windows (PowerShell)

Нужен Node.js 20.19+ (проверка: `node -v`).

```powershell
cd C:\Users\user\Desktop\project
npm install
Copy-Item .env.example .env
notepad .env          # вставьте URL и ключ, сохраните
npm run dev           # откройте http://localhost:5173
```

Другие команды: `npm run build` (сборка в `dist/`), `npm run preview` (проверка сборки), `npm run lint` (проверка кода).
После изменения `.env` перезапустите `npm run dev` (Ctrl+C, затем снова `npm run dev`).

## Безопасность — коротко

- Права проверяет **база данных** (Row Level Security), а не только интерфейс. Даже если вызвать API вручную, обычный пользователь не сможет изменить домики, одобрить отзыв или прочитать чужие брони.
- Роль хранится в таблице `profiles`; пользователь не может её изменить, а регистрация всегда создаёт роль `user`.
- Отзывы публикуются только после одобрения администратором. Сумму брони считает база (триггер), пересечение дат запрещено ограничением в БД.
