-- =====================================================================
-- Calma Mountain — исходные данные (домики Alba, Nimbus, Eclipse, Terra,
-- отзывы, FAQ, контакты, демо-брони). Запускать ПОСЛЕ schema.sql.
-- on conflict do nothing: повторный запуск не перезапишет изменения из админки.
-- =====================================================================

insert into public.cottages (id, slug, name, tier, tagline, description, amenities, images, price_weekday, price_weekend, capacity, sort_order) values
  (1, 'alba', 'Alba', 'premium', '{"ru":"самые светлые и уединённые","en":"the brightest and most secluded","kg":"эң жарык жана оокумдуу"}'::jsonb, '{"ru":"A-frame домик с панорамными окнами и видом на горы, созданный для уютного отдыха.","en":"A cozy A-frame cottage with panoramic windows and mountain views, made for relaxing.","kg":"Тоо көрүнүшү бар панорамалуу терезелүү A-frame үйчө, жайлуу эс алуу үчүн жасалган."}'::jsonb, array['panorama', 'terrace', 'breakfast', 'bbq']::text[], array['/images/alba-1.webp']::text[], 13000, 15000, 3, 1),
  (2, 'nimbus', 'Nimbus', 'premium', '{"ru":"самые светлые и уединённые","en":"the brightest and most secluded","kg":"эң жарык жана оокумдуу"}'::jsonb, '{"ru":"Уютное пространство с интерьером, полным естественного света, и видом на горные пейзажи.","en":"A cozy space with a light-filled interior and views of the mountain landscapes.","kg":"Табигый жарыкка толгон интерьер жана тоо пейзажы көрүнгөн жайлуу мейкиндик."}'::jsonb, array['panorama', 'terrace', 'breakfast', 'bbq']::text[], array['/images/nimbus-1.webp']::text[], 13000, 15000, 3, 2),
  (3, 'eclipse', 'Eclipse', 'atmosphere', '{"ru":"deeper interior, warm atmosphere","en":"deeper interior, warm atmosphere","kg":"терең интерьер, жылуу атмосфера"}'::jsonb, '{"ru":"Более глубокий интерьер и тёплая атмосфера.","en":"A deeper interior and a warm atmosphere.","kg":"Терең интерьер жана жылуу атмосфера."}'::jsonb, array['panorama', 'terrace', 'breakfast', 'bbq']::text[], array['/images/eclipse-1.webp']::text[], 14000, 16000, 3, 3),
  (4, 'terra', 'Terra', 'natural', '{"ru":"уютный базовый вариант","en":"a cozy basic option","kg":"жайлуу базалык вариант"}'::jsonb, '{"ru":"A-frame домик, где можно отдыхать на террасе и наслаждаться тишиной природы.","en":"An A-frame cottage for relaxing on the terrace and enjoying the calm of nature.","kg":"Террасада отуруп, жаратылыштын тынчтыгынан ырахат алууга боло турган A-frame үйчө."}'::jsonb, array['panorama', 'terrace', 'breakfast', 'bbq']::text[], array['/images/terra-1.webp']::text[], 12000, 14000, 3, 4)
on conflict (id) do nothing;

insert into public.reviews (id, name, text, rating, cottage_id, translations, approved, created_at) values
  (1, 'Evgeny', 'Замечательное место. Тихо, спокойно, красиво. Шикарные виды. Новые домики, чистые, уютные, со всем необходимым для комфортного проживания. Радушная и гостеприимная хозяйка. С удовольствием вернёмся вновь!', 5, 1, '{"en":{"name":"Evgeny","text":"A wonderful place. Quiet, peaceful, beautiful. Stunning views. New cottages, clean and cozy, with everything you need for a comfortable stay. A warm and welcoming hostess. We''ll gladly come back!"},"kg":{"name":"Evgeny","text":"Сонун жай. Тынч, жымжырт, кооз. Укмуштуудай көрүнүштөр. Жаңы, таза, ыңгайлуу үйчөлөр, жашоо үчүн баары бар. Меймандос ээси. Дагы келебиз!"}}'::jsonb, true, '2026-06-08T12:00:00Z'),
  (2, 'Эд Шакиров', 'Замечательные, уютные и комфортные А-фреймы!!! Благодарю персонал за отличный отдых, обязательно приеду ещё.', 5, 2, '{"en":{"name":"Ed Shakirov","text":"Wonderful, cozy and comfortable A-frames!!! Thank you to the staff for a great stay, I will definitely come again."},"kg":{"name":"Эд Шакиров","text":"Сонун, жылуу жана ыңгайлуу А-фреймдер!!! Мыкты эс алганыбыз үчүн кызматкерлерге рахмат, дагы келем."}}'::jsonb, true, '2026-07-14T12:00:00Z'),
  (3, 'Denis Mednikov', 'Место огонь, красиво и очень комфортно.', 5, 4, '{"en":{"name":"Denis Mednikov","text":"Amazing place, beautiful and very comfortable."},"kg":{"name":"Denis Mednikov","text":"Мыкты жай, кооз жана абдан ыңгайлуу."}}'::jsonb, true, '2026-08-25T12:00:00Z'),
  (4, 'Azi Za', '10/10! Лично там не жили, но сегодня уронили свой телефон в их уличный туалет, байкешка достал его. Спасибо вам большое!', 5, null, '{"en":{"name":"Azi Za","text":"10/10! We didn''t stay there, but today we dropped our phone into their outdoor toilet and a kind local guy fished it out. Thank you so much!"},"kg":{"name":"Azi Za","text":"10/10! Ошол жерде жашаган жокпуз, бирок сёння телефонубузду тышкы даараткананы түшүрүп алдык, байке алып берди. Чоң рахмат!"}}'::jsonb, true, '2026-08-09T12:00:00Z')
on conflict do nothing;

insert into public.site_settings (key, value) values
  ('contacts', '{"phone":"+996 555 123 456","whatsapp":"996555123456","instagram":"https://www.instagram.com/calma.mountain/","email":"","address":{"ru":"Кыргызстан, горная местность","en":"Kyrgyzstan, mountain area","kg":"Кыргызстан, тоолуу аймак"}}'::jsonb),
  ('stay', '{"checkIn":"14:00","checkOut":"12:00","extraGuest":2000,"dayUse":10000}'::jsonb)
on conflict (key) do nothing;

insert into public.faqs (lang, question, answer, keywords, hidden, sort_order)
select * from (values
    ('ru', 'Привет', 'Здравствуйте! Спросите про цены, заезд, что входит в стоимость или бронирование.', array['привет', 'здравств', 'добрый', 'салам', 'hello']::text[], true, 0),
    ('ru', 'Сколько стоит?', 'Будни от 12 000 сом, выходные от 14 000 сом за домик. Точные цены — в разделе «Домики».', array['цена', 'цены', 'стоит', 'стоимость', 'price', 'cost']::text[], false, 1),
    ('ru', 'Во сколько заезд?', 'Заезд с 14:00, выезд до 12:00.', array['заезд', 'выезд', 'время', 'check']::text[], false, 2),
    ('ru', 'Что входит в стоимость?', 'Проживание для 2 гостей, завтрак, парковка, чай/кофе зона, BBQ зона и приватная терраса.', array['входит', 'завтрак', 'включен', 'включено', 'включ']::text[], false, 3),
    ('ru', 'Сколько человек в домике?', 'Домик рассчитан на 2 взрослых и 1 ребёнка. Для больших компаний формат не подходит.', array['человек', 'гост', 'дет', 'ребен', 'ребён', 'компани']::text[], false, 4),
    ('ru', 'Как забронировать?', 'Откройте страницу «Домики», выберите домик и нажмите «Забронировать этот домик». Укажите даты и контакты — цена посчитается автоматически.', array['брон', 'забронир', 'свободн', 'дата', 'даты']::text[], false, 5),
    ('ru', 'Как связаться?', 'Пишите в WhatsApp (кнопка ниже) или звоните: +996 555 123 456.', array['телефон', 'whatsapp', 'ватсап', 'контакт', 'связ', 'номер', 'позвон']::text[], false, 6),
    ('en', 'Hello', 'Hello! Ask me about prices, check-in times, what is included or how to book.', array['hello', 'hey', 'good morning', 'good evening', 'привет']::text[], true, 0),
    ('en', 'How much does it cost?', 'Weekdays from 12,000 KGS, weekends from 14,000 KGS per cottage. See exact prices in the Cottages section.', array['price', 'cost', 'how much', 'цена']::text[], false, 1),
    ('en', 'What are check-in times?', 'Check-in from 14:00, check-out by 12:00.', array['check', 'time', 'arrival', 'заезд']::text[], false, 2),
    ('en', 'What is included?', 'Stay for 2 guests, breakfast, parking, tea/coffee area, BBQ area and a private terrace.', array['include', 'breakfast', 'parking', 'bbq']::text[], false, 3),
    ('en', 'How many guests fit?', 'Each cottage fits 2 adults and 1 child. Larger groups are not suitable for our format.', array['guest', 'people', 'child', 'kid', 'group']::text[], false, 4),
    ('en', 'How do I book?', 'Open the Cottages page, pick a cottage and press “Book this cottage”. Choose your dates and contact details — the price is calculated automatically.', array['book', 'reserve', 'available', 'dates', 'reservation']::text[], false, 5),
    ('en', 'How can I contact you?', 'Message us on WhatsApp (button below) or call +996 555 123 456.', array['phone', 'whatsapp', 'contact', 'call', 'number']::text[], false, 6),
    ('kg', 'Салам', 'Саламатсызбы! Баа, келүү убактысы, баага эмне кирери же брондоо тууралуу сураңыз.', array['салам', 'саламатсыз', 'привет', 'hello']::text[], true, 0),
    ('kg', 'Баасы канча?', 'Жумушчу күндөрү 12 000 сомдон, дем алыш күндөрү 14 000 сомдон. Так баалар «Үйчөлөр» бөлүмүндө.', array['баа', 'канча', 'цена', 'стоит', 'price']::text[], false, 1),
    ('kg', 'Саат канчада келсе болот?', 'Келүү саат 14:00дөн, кетүү саат 12:00гө чейин.', array['келүү', 'кетүү', 'саат', 'заезд', 'check']::text[], false, 2),
    ('kg', 'Баага эмне кирет?', '2 конокко жайгашуу, эртең мененки тамак, токтоочу жай, чай/кофе зонасы, BBQ зонасы жана жеке терраса.', array['кирет', 'эртең', 'тамак', 'завтрак', 'токтоо']::text[], false, 3),
    ('kg', 'Үйчөгө канча адам батат?', 'Үйчө 2 чоң киши жана 1 баланы кабыл алат. Чоң компаниялар үчүн ылайыктуу эмес.', array['адам', 'бала', 'компания', 'конок', 'человек']::text[], false, 4),
    ('kg', 'Кантип брондойм?', '«Үйчөлөр» бетин ачып, үйчөнү тандаңыз да «Бул үйчөнү брондоо» баскычын басыңыз. Күндөрдү жана байланыш маалыматын жазыңыз — баа автоматтык эсептелет.', array['брон', 'бош', 'күн', 'дата', 'заказ']::text[], false, 5),
    ('kg', 'Кантип байланышам?', 'WhatsApp''ка жазыңыз (төмөнкү баскыч) же чалыңыз: +996 555 123 456.', array['телефон', 'whatsapp', 'ватсап', 'байланыш', 'номер', 'чалуу']::text[], false, 6)
) as v (lang, question, answer, keywords, hidden, sort_order)
where not exists (select 1 from public.faqs);

insert into public.bookings (id, cottage_id, guest_name, email, phone, check_in, check_out, guests, status, created_at) values
  (1, 1, 'Айбек Т.', 'aibek@example.com', '+996 700 111 222', '2026-11-07', '2026-11-09', 2, 'paid', '2026-10-20T10:00:00.000Z'),
  (2, 2, 'Anna K.', 'anna@example.com', '+996 555 333 444', '2026-11-14', '2026-11-15', 2, 'confirmed', '2026-10-22T12:30:00.000Z'),
  (3, 4, 'Нурлан С.', 'nurlan@example.com', '+996 777 555 666', '2026-12-01', '2026-12-03', 3, 'pending', '2026-10-25T09:15:00.000Z'),
  (4, 1, 'Dana M.', 'dana@example.com', '+996 550 888 999', '2026-12-12', '2026-12-14', 2, 'paid', '2026-10-26T18:40:00.000Z')
on conflict do nothing;

-- Явные id выше не сдвигают счётчики — сдвигаем, чтобы новые записи не конфликтовали.
select setval(pg_get_serial_sequence('public.cottages', 'id'), greatest((select max(id) from public.cottages), 1));
select setval(pg_get_serial_sequence('public.reviews', 'id'), greatest((select max(id) from public.reviews), 1));
select setval(pg_get_serial_sequence('public.bookings', 'id'), greatest((select max(id) from public.bookings), 1));
