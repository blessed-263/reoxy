export type PlaceHit = {
  id: string;
  title: string;
  subtitle: string;
  city: string;
  airport?: string;
};

type AirportRow = {
  code: string;
  cityEn: string;
  cityRu: string;
  airportEn: string;
  airportRu: string;
  countryEn: string;
  countryRu: string;
  aliases?: string[];
  rank?: number;
};

const RU = { countryEn: 'Russia', countryRu: 'Россия' } as const;

const AIRPORTS: AirportRow[] = [
  { code: 'SVO', cityEn: 'Moscow', cityRu: 'Москва', airportEn: 'Sheremetyevo', airportRu: 'Шереметьево', ...RU, aliases: ['svo', 'sheremetievo', 'sheremetyevo international', 'msk', 'mow', 'moskva'], rank: 1 },
  { code: 'DME', cityEn: 'Moscow', cityRu: 'Москва', airportEn: 'Domodedovo', airportRu: 'Домодедово', ...RU, aliases: ['dme', 'domodedovo international', 'msk', 'mow', 'moskva'], rank: 2 },
  { code: 'VKO', cityEn: 'Moscow', cityRu: 'Москва', airportEn: 'Vnukovo', airportRu: 'Внуково', ...RU, aliases: ['vko', 'vnukovo international', 'msk', 'mow', 'moskva'], rank: 3 },
  { code: 'ZIA', cityEn: 'Moscow', cityRu: 'Москва', airportEn: 'Zhukovsky', airportRu: 'Жуковский', ...RU, aliases: ['zia', 'ramenskoye', 'жуковский', 'msk', 'mow', 'moskva'], rank: 4 },
  { code: 'LED', cityEn: 'Saint Petersburg', cityRu: 'Санкт-Петербург', airportEn: 'Pulkovo', airportRu: 'Пулково', ...RU, aliases: ['spb', 'petersburg', 'питер', 'ленинград'], rank: 5 },
  { code: 'AER', cityEn: 'Sochi', cityRu: 'Сочи', airportEn: 'Adler', airportRu: 'Адлер', ...RU, aliases: ['adler', 'sochi international'] },
  { code: 'KZN', cityEn: 'Kazan', cityRu: 'Казань', airportEn: 'Kazan', airportRu: 'Казань', ...RU },
  { code: 'SVX', cityEn: 'Yekaterinburg', cityRu: 'Екатеринбург', airportEn: 'Koltsovo', airportRu: 'Кольцово', ...RU, aliases: ['ekaterinburg'] },
  { code: 'OVB', cityEn: 'Novosibirsk', cityRu: 'Новосибирск', airportEn: 'Tolmachevo', airportRu: 'Толмачёво', ...RU },
  { code: 'KRR', cityEn: 'Krasnodar', cityRu: 'Краснодар', airportEn: 'Pashkovsky', airportRu: 'Пашковский', ...RU },
  { code: 'KJA', cityEn: 'Krasnoyarsk', cityRu: 'Красноярск', airportEn: 'Yemelyanovo', airportRu: 'Емельяново', ...RU },
  { code: 'KUF', cityEn: 'Samara', cityRu: 'Самара', airportEn: 'Kurumoch', airportRu: 'Курумоч', ...RU },
  { code: 'UFA', cityEn: 'Ufa', cityRu: 'Уфа', airportEn: 'Ufa', airportRu: 'Уфа', ...RU },
  { code: 'ROV', cityEn: 'Rostov-on-Don', cityRu: 'Ростов-на-Дону', airportEn: 'Platov', airportRu: 'Платов', ...RU, aliases: ['rostov'] },
  { code: 'MRV', cityEn: 'Mineralnye Vody', cityRu: 'Минеральные Воды', airportEn: 'Mineralnye Vody', airportRu: 'Минеральные Воды', ...RU, aliases: ['minvody', 'кмъ'] },
  { code: 'KGD', cityEn: 'Kaliningrad', cityRu: 'Калининград', airportEn: 'Khrabrovo', airportRu: 'Храброво', ...RU },
  { code: 'VVO', cityEn: 'Vladivostok', cityRu: 'Владивосток', airportEn: 'Knevichi', airportRu: 'Кневичи', ...RU },
  { code: 'KHV', cityEn: 'Khabarovsk', cityRu: 'Хабаровск', airportEn: 'Novy', airportRu: 'Новый', ...RU },
  { code: 'IKT', cityEn: 'Irkutsk', cityRu: 'Иркутск', airportEn: 'Irkutsk', airportRu: 'Иркутск', ...RU },
  { code: 'UUS', cityEn: 'Yuzhno-Sakhalinsk', cityRu: 'Южно-Сахалинск', airportEn: 'Khomutovo', airportRu: 'Хомутово', ...RU, aliases: ['sakhalin'] },
  { code: 'PKC', cityEn: 'Petropavlovsk-Kamchatsky', cityRu: 'Петропавловск-Камчатский', airportEn: 'Yelizovo', airportRu: 'Елизово', ...RU, aliases: ['kamchatka'] },
  { code: 'YKS', cityEn: 'Yakutsk', cityRu: 'Якутск', airportEn: 'Yakutsk', airportRu: 'Якутск', ...RU },
  { code: 'MCX', cityEn: 'Makhachkala', cityRu: 'Махачкала', airportEn: 'Uytash', airportRu: 'Уйташ', ...RU, aliases: ['dagestan'] },
  { code: 'AAQ', cityEn: 'Anapa', cityRu: 'Анапа', airportEn: 'Vityazevo', airportRu: 'Витязево', ...RU },
  { code: 'GDZ', cityEn: 'Gelendzhik', cityRu: 'Геленджик', airportEn: 'Gelendzhik', airportRu: 'Геленджик', ...RU },
  { code: 'GOJ', cityEn: 'Nizhny Novgorod', cityRu: 'Нижний Новгород', airportEn: 'Strigino', airportRu: 'Стригино', ...RU },
  { code: 'PEE', cityEn: 'Perm', cityRu: 'Пермь', airportEn: 'Bolshoye Savino', airportRu: 'Большое Савино', ...RU },
  { code: 'CEK', cityEn: 'Chelyabinsk', cityRu: 'Челябинск', airportEn: 'Balandino', airportRu: 'Баландино', ...RU },
  { code: 'TJM', cityEn: 'Tyumen', cityRu: 'Тюмень', airportEn: 'Roshchino', airportRu: 'Рощино', ...RU },
  { code: 'OMS', cityEn: 'Omsk', cityRu: 'Омск', airportEn: 'Omsk Tsentralny', airportRu: 'Омск Центральный', ...RU },
  { code: 'VOG', cityEn: 'Volgograd', cityRu: 'Волгоград', airportEn: 'Gumrak', airportRu: 'Гумрак', ...RU },
  { code: 'ASF', cityEn: 'Astrakhan', cityRu: 'Астрахань', airportEn: 'Narimanovo', airportRu: 'Нариманово', ...RU },
  { code: 'STW', cityEn: 'Stavropol', cityRu: 'Ставрополь', airportEn: 'Shpakovskoye', airportRu: 'Шпаковское', ...RU },
  { code: 'VOZ', cityEn: 'Voronezh', cityRu: 'Воронеж', airportEn: 'Chertovitskoye', airportRu: 'Чертовицкое', ...RU },
  { code: 'MMK', cityEn: 'Murmansk', cityRu: 'Мурманск', airportEn: 'Murmansk', airportRu: 'Мурманск', ...RU },
  { code: 'ARH', cityEn: 'Arkhangelsk', cityRu: 'Архангельск', airportEn: 'Talagi', airportRu: 'Талаги', ...RU },
  { code: 'SCW', cityEn: 'Syktyvkar', cityRu: 'Сыктывкар', airportEn: 'Syktyvkar', airportRu: 'Сыктывкар', ...RU },
  { code: 'SGC', cityEn: 'Surgut', cityRu: 'Сургут', airportEn: 'Surgut', airportRu: 'Сургут', ...RU },
  { code: 'NUX', cityEn: 'Novy Urengoy', cityRu: 'Новый Уренгой', airportEn: 'Novy Urengoy', airportRu: 'Новый Уренгой', ...RU },
  { code: 'HMA', cityEn: 'Khanty-Mansiysk', cityRu: 'Ханты-Мансийск', airportEn: 'Khanty-Mansiysk', airportRu: 'Ханты-Мансийск', ...RU },
  { code: 'NSK', cityEn: 'Norilsk', cityRu: 'Норильск', airportEn: 'Alykel', airportRu: 'Алыкель', ...RU },
  { code: 'TOF', cityEn: 'Tomsk', cityRu: 'Томск', airportEn: 'Bogashevo', airportRu: 'Богашёво', ...RU },
  { code: 'BAX', cityEn: 'Barnaul', cityRu: 'Барнаул', airportEn: 'Barnaul', airportRu: 'Барнаул', ...RU },
  { code: 'KEJ', cityEn: 'Kemerovo', cityRu: 'Кемерово', airportEn: 'Kemerovo', airportRu: 'Кемерово', ...RU },
  { code: 'NOZ', cityEn: 'Novokuznetsk', cityRu: 'Новокузнецк', airportEn: 'Spichenkovo', airportRu: 'Спиченково', ...RU },
  { code: 'HTA', cityEn: 'Chita', cityRu: 'Чита', airportEn: 'Kadala', airportRu: 'Кадала', ...RU },
  { code: 'UUD', cityEn: 'Ulan-Ude', cityRu: 'Улан-Удэ', airportEn: 'Baikal', airportRu: 'Байкал', ...RU },
  { code: 'BQS', cityEn: 'Blagoveshchensk', cityRu: 'Благовещенск', airportEn: 'Ignatyevo', airportRu: 'Игнатьево', ...RU },
  { code: 'GDX', cityEn: 'Magadan', cityRu: 'Магадан', airportEn: 'Sokol', airportRu: 'Сокол', ...RU },
  { code: 'OGZ', cityEn: 'Vladikavkaz', cityRu: 'Владикавказ', airportEn: 'Beslan', airportRu: 'Беслан', ...RU },
  { code: 'NAL', cityEn: 'Nalchik', cityRu: 'Нальчик', airportEn: 'Nalchik', airportRu: 'Нальчик', ...RU },
  { code: 'GRV', cityEn: 'Grozny', cityRu: 'Грозный', airportEn: 'Grozny', airportRu: 'Грозный', ...RU },
  { code: 'IGT', cityEn: 'Magas', cityRu: 'Магас', airportEn: 'Magas', airportRu: 'Магас', ...RU, aliases: ['ingushetia', 'назрань'] },
  { code: 'NBC', cityEn: 'Nizhnekamsk', cityRu: 'Нижнекамск', airportEn: 'Begishevo', airportRu: 'Бегишево', ...RU, aliases: ['naberezhnye chelny'] },
  { code: 'REN', cityEn: 'Orenburg', cityRu: 'Оренбург', airportEn: 'Orenburg', airportRu: 'Оренбург', ...RU },
  { code: 'IJK', cityEn: 'Izhevsk', cityRu: 'Ижевск', airportEn: 'Izhevsk', airportRu: 'Ижевск', ...RU },
  { code: 'ULY', cityEn: 'Ulyanovsk', cityRu: 'Ульяновск', airportEn: 'Baratayevka', airportRu: 'Баратаевка', ...RU },
  { code: 'CSY', cityEn: 'Cheboksary', cityRu: 'Чебоксары', airportEn: 'Cheboksary', airportRu: 'Чебоксары', ...RU },
  { code: 'KLF', cityEn: 'Kaluga', cityRu: 'Калуга', airportEn: 'Grabtsevo', airportRu: 'Грабцево', ...RU },
  { code: 'IWA', cityEn: 'Ivanovo', cityRu: 'Иваново', airportEn: 'Yuzhny', airportRu: 'Южный', ...RU },
  { code: 'EGO', cityEn: 'Belgorod', cityRu: 'Белгород', airportEn: 'Belgorod', airportRu: 'Белгород', ...RU },
  { code: 'SKX', cityEn: 'Saransk', cityRu: 'Саранск', airportEn: 'Saransk', airportRu: 'Саранск', ...RU },
  { code: 'PEZ', cityEn: 'Penza', cityRu: 'Пенза', airportEn: 'Penza', airportRu: 'Пенза', ...RU },

  { code: 'MSQ', cityEn: 'Minsk', cityRu: 'Минск', airportEn: 'Minsk National', airportRu: 'Минск Национальный', countryEn: 'Belarus', countryRu: 'Беларусь' },
  { code: 'ALA', cityEn: 'Almaty', cityRu: 'Алматы', airportEn: 'Almaty', airportRu: 'Алматы', countryEn: 'Kazakhstan', countryRu: 'Казахстан', aliases: ['alma ata'] },
  { code: 'NQZ', cityEn: 'Astana', cityRu: 'Астана', airportEn: 'Nursultan Nazarbayev', airportRu: 'Нурсултан Назарбаев', countryEn: 'Kazakhstan', countryRu: 'Казахстан', aliases: ['nursultan', 'tse'] },
  { code: 'CIT', cityEn: 'Shymkent', cityRu: 'Шымкент', airportEn: 'Shymkent', airportRu: 'Шымкент', countryEn: 'Kazakhstan', countryRu: 'Казахстан' },
  { code: 'TAS', cityEn: 'Tashkent', cityRu: 'Ташкент', airportEn: 'Islam Karimov', airportRu: 'Ислам Каримов', countryEn: 'Uzbekistan', countryRu: 'Узбекистан' },
  { code: 'SKD', cityEn: 'Samarkand', cityRu: 'Самарканд', airportEn: 'Samarkand', airportRu: 'Самарканд', countryEn: 'Uzbekistan', countryRu: 'Узбекистан' },
  { code: 'UGC', cityEn: 'Urgench', cityRu: 'Ургенч', airportEn: 'Urgench', airportRu: 'Ургенч', countryEn: 'Uzbekistan', countryRu: 'Узбекистан' },
  { code: 'FRU', cityEn: 'Bishkek', cityRu: 'Бишкек', airportEn: 'Manas', airportRu: 'Манас', countryEn: 'Kyrgyzstan', countryRu: 'Кыргызстан' },
  { code: 'GYD', cityEn: 'Baku', cityRu: 'Баку', airportEn: 'Heydar Aliyev', airportRu: 'Гейдар Алиев', countryEn: 'Azerbaijan', countryRu: 'Азербайджан' },
  { code: 'EVN', cityEn: 'Yerevan', cityRu: 'Ереван', airportEn: 'Zvartnots', airportRu: 'Звартноц', countryEn: 'Armenia', countryRu: 'Армения' },
  { code: 'TBS', cityEn: 'Tbilisi', cityRu: 'Тбилиси', airportEn: 'Shota Rustaveli', airportRu: 'Шота Руставели', countryEn: 'Georgia', countryRu: 'Грузия' },
  { code: 'BUS', cityEn: 'Batumi', cityRu: 'Батуми', airportEn: 'Alexander Kartveli', airportRu: 'Александр Картвели', countryEn: 'Georgia', countryRu: 'Грузия' },
  { code: 'RMO', cityEn: 'Chisinau', cityRu: 'Кишинёв', airportEn: 'Chisinau', airportRu: 'Кишинёв', countryEn: 'Moldova', countryRu: 'Молдова' },

  { code: 'IST', cityEn: 'Istanbul', cityRu: 'Стамбул', airportEn: 'Istanbul Airport', airportRu: 'Новый аэропорт', countryEn: 'Turkey', countryRu: 'Турция', aliases: ['ist', 'new airport'], rank: 10 },
  { code: 'SAW', cityEn: 'Istanbul', cityRu: 'Стамбул', airportEn: 'Sabiha Gokcen', airportRu: 'Сабиха Гёкчен', countryEn: 'Turkey', countryRu: 'Турция', rank: 11 },
  { code: 'AYT', cityEn: 'Antalya', cityRu: 'Анталья', airportEn: 'Antalya', airportRu: 'Анталья', countryEn: 'Turkey', countryRu: 'Турция' },
  { code: 'BJV', cityEn: 'Bodrum', cityRu: 'Бодрум', airportEn: 'Milas-Bodrum', airportRu: 'Милас-Бодрум', countryEn: 'Turkey', countryRu: 'Турция' },
  { code: 'DLM', cityEn: 'Dalaman', cityRu: 'Даламан', airportEn: 'Dalaman', airportRu: 'Даламан', countryEn: 'Turkey', countryRu: 'Турция' },
  { code: 'ADB', cityEn: 'Izmir', cityRu: 'Измир', airportEn: 'Adnan Menderes', airportRu: 'Аднан Мендерес', countryEn: 'Turkey', countryRu: 'Турция' },
  { code: 'ESB', cityEn: 'Ankara', cityRu: 'Анкара', airportEn: 'Esenboga', airportRu: 'Эсенбога', countryEn: 'Turkey', countryRu: 'Турция' },
  { code: 'DXB', cityEn: 'Dubai', cityRu: 'Дубай', airportEn: 'Dubai International', airportRu: 'Дубай Международный', countryEn: 'UAE', countryRu: 'ОАЭ', rank: 12 },
  { code: 'DWC', cityEn: 'Dubai', cityRu: 'Дубай', airportEn: 'Al Maktoum', airportRu: 'Аль-Мактум', countryEn: 'UAE', countryRu: 'ОАЭ', rank: 13 },
  { code: 'AUH', cityEn: 'Abu Dhabi', cityRu: 'Абу-Даби', airportEn: 'Zayed International', airportRu: 'Заид', countryEn: 'UAE', countryRu: 'ОАЭ' },
  { code: 'SHJ', cityEn: 'Sharjah', cityRu: 'Шарджа', airportEn: 'Sharjah', airportRu: 'Шарджа', countryEn: 'UAE', countryRu: 'ОАЭ' },
  { code: 'DOH', cityEn: 'Doha', cityRu: 'Доха', airportEn: 'Hamad', airportRu: 'Хамад', countryEn: 'Qatar', countryRu: 'Катар' },
  { code: 'RUH', cityEn: 'Riyadh', cityRu: 'Эр-Рияд', airportEn: 'King Khalid', airportRu: 'Король Халид', countryEn: 'Saudi Arabia', countryRu: 'Саудовская Аравия' },
  { code: 'JED', cityEn: 'Jeddah', cityRu: 'Джидда', airportEn: 'King Abdulaziz', airportRu: 'Король Абдул-Азиз', countryEn: 'Saudi Arabia', countryRu: 'Саудовская Аравия' },
  { code: 'TLV', cityEn: 'Tel Aviv', cityRu: 'Тель-Авив', airportEn: 'Ben Gurion', airportRu: 'Бен-Гурион', countryEn: 'Israel', countryRu: 'Израиль' },
  { code: 'CAI', cityEn: 'Cairo', cityRu: 'Каир', airportEn: 'Cairo International', airportRu: 'Каир', countryEn: 'Egypt', countryRu: 'Египет' },
  { code: 'SSH', cityEn: 'Sharm El Sheikh', cityRu: 'Шарм-эль-Шейх', airportEn: 'Sharm El Sheikh', airportRu: 'Шарм-эль-Шейх', countryEn: 'Egypt', countryRu: 'Египет', aliases: ['sharm'] },
  { code: 'HRG', cityEn: 'Hurghada', cityRu: 'Хургада', airportEn: 'Hurghada', airportRu: 'Хургада', countryEn: 'Egypt', countryRu: 'Египет' },
  { code: 'MLE', cityEn: 'Male', cityRu: 'Мале', airportEn: 'Velana', airportRu: 'Велана', countryEn: 'Maldives', countryRu: 'Мальдивы', aliases: ['maldives', 'мальдивы'] },
  { code: 'BKK', cityEn: 'Bangkok', cityRu: 'Бангкок', airportEn: 'Suvarnabhumi', airportRu: 'Суварнабхуми', countryEn: 'Thailand', countryRu: 'Таиланд', rank: 20 },
  { code: 'DMK', cityEn: 'Bangkok', cityRu: 'Бангкок', airportEn: 'Don Mueang', airportRu: 'Дон Мыанг', countryEn: 'Thailand', countryRu: 'Таиланд', rank: 21 },
  { code: 'HKT', cityEn: 'Phuket', cityRu: 'Пхукет', airportEn: 'Phuket', airportRu: 'Пхукет', countryEn: 'Thailand', countryRu: 'Таиланд' },
  { code: 'UTP', cityEn: 'Pattaya', cityRu: 'Паттайя', airportEn: 'U-Tapao', airportRu: 'Утапао', countryEn: 'Thailand', countryRu: 'Таиланд' },
  { code: 'DPS', cityEn: 'Denpasar', cityRu: 'Денпасар', airportEn: 'Ngurah Rai', airportRu: 'Нгурах Рай', countryEn: 'Indonesia', countryRu: 'Индонезия', aliases: ['bali', 'бали'] },
  { code: 'SIN', cityEn: 'Singapore', cityRu: 'Сингапур', airportEn: 'Changi', airportRu: 'Чанги', countryEn: 'Singapore', countryRu: 'Сингапур' },
  { code: 'KUL', cityEn: 'Kuala Lumpur', cityRu: 'Куала-Лумпур', airportEn: 'Kuala Lumpur International', airportRu: 'Куала-Лумпур', countryEn: 'Malaysia', countryRu: 'Малайзия' },
  { code: 'SGN', cityEn: 'Ho Chi Minh City', cityRu: 'Хошимин', airportEn: 'Tan Son Nhat', airportRu: 'Таншоннят', countryEn: 'Vietnam', countryRu: 'Вьетнам', aliases: ['saigon'] },
  { code: 'HAN', cityEn: 'Hanoi', cityRu: 'Ханой', airportEn: 'Noi Bai', airportRu: 'Нойбай', countryEn: 'Vietnam', countryRu: 'Вьетнам' },
  { code: 'CXR', cityEn: 'Nha Trang', cityRu: 'Нячанг', airportEn: 'Cam Ranh', airportRu: 'Камрань', countryEn: 'Vietnam', countryRu: 'Вьетнам' },
  { code: 'DEL', cityEn: 'Delhi', cityRu: 'Дели', airportEn: 'Indira Gandhi', airportRu: 'Индира Ганди', countryEn: 'India', countryRu: 'Индия' },
  { code: 'BOM', cityEn: 'Mumbai', cityRu: 'Мумбаи', airportEn: 'Chhatrapati Shivaji', airportRu: 'Чхатрапати Шиваджи', countryEn: 'India', countryRu: 'Индия', aliases: ['bombay'] },
  { code: 'GOX', cityEn: 'Goa', cityRu: 'Гоа', airportEn: 'Mopa', airportRu: 'Мопа', countryEn: 'India', countryRu: 'Индия' },
  { code: 'GOI', cityEn: 'Goa', cityRu: 'Гоа', airportEn: 'Dabolim', airportRu: 'Даболим', countryEn: 'India', countryRu: 'Индия' },
  { code: 'PEK', cityEn: 'Beijing', cityRu: 'Пекин', airportEn: 'Capital', airportRu: 'Столичный', countryEn: 'China', countryRu: 'Китай' },
  { code: 'PKX', cityEn: 'Beijing', cityRu: 'Пекин', airportEn: 'Daxing', airportRu: 'Дасин', countryEn: 'China', countryRu: 'Китай' },
  { code: 'PVG', cityEn: 'Shanghai', cityRu: 'Шанхай', airportEn: 'Pudong', airportRu: 'Пудун', countryEn: 'China', countryRu: 'Китай' },
  { code: 'SHA', cityEn: 'Shanghai', cityRu: 'Шанхай', airportEn: 'Hongqiao', airportRu: 'Хунцяо', countryEn: 'China', countryRu: 'Китай' },
  { code: 'CAN', cityEn: 'Guangzhou', cityRu: 'Гуанчжоу', airportEn: 'Baiyun', airportRu: 'Байюнь', countryEn: 'China', countryRu: 'Китай' },
  { code: 'HKG', cityEn: 'Hong Kong', cityRu: 'Гонконг', airportEn: 'Chek Lap Kok', airportRu: 'Чек-Лап-Кок', countryEn: 'China', countryRu: 'Китай' },
  { code: 'NRT', cityEn: 'Tokyo', cityRu: 'Токио', airportEn: 'Narita', airportRu: 'Нарита', countryEn: 'Japan', countryRu: 'Япония' },
  { code: 'HND', cityEn: 'Tokyo', cityRu: 'Токио', airportEn: 'Haneda', airportRu: 'Ханеда', countryEn: 'Japan', countryRu: 'Япония' },
  { code: 'KIX', cityEn: 'Osaka', cityRu: 'Осака', airportEn: 'Kansai', airportRu: 'Кансай', countryEn: 'Japan', countryRu: 'Япония' },
  { code: 'ICN', cityEn: 'Seoul', cityRu: 'Сеул', airportEn: 'Incheon', airportRu: 'Инчхон', countryEn: 'South Korea', countryRu: 'Южная Корея' },
  { code: 'LHR', cityEn: 'London', cityRu: 'Лондон', airportEn: 'Heathrow', airportRu: 'Хитроу', countryEn: 'United Kingdom', countryRu: 'Великобритания' },
  { code: 'LGW', cityEn: 'London', cityRu: 'Лондон', airportEn: 'Gatwick', airportRu: 'Гатвик', countryEn: 'United Kingdom', countryRu: 'Великобритания' },
  { code: 'STN', cityEn: 'London', cityRu: 'Лондон', airportEn: 'Stansted', airportRu: 'Станстед', countryEn: 'United Kingdom', countryRu: 'Великобритания' },
  { code: 'CDG', cityEn: 'Paris', cityRu: 'Париж', airportEn: 'Charles de Gaulle', airportRu: 'Шарль-де-Голль', countryEn: 'France', countryRu: 'Франция' },
  { code: 'ORY', cityEn: 'Paris', cityRu: 'Париж', airportEn: 'Orly', airportRu: 'Орли', countryEn: 'France', countryRu: 'Франция' },
  { code: 'NCE', cityEn: 'Nice', cityRu: 'Ницца', airportEn: 'Cote d’Azur', airportRu: 'Лазурный Берег', countryEn: 'France', countryRu: 'Франция' },
  { code: 'FCO', cityEn: 'Rome', cityRu: 'Рим', airportEn: 'Fiumicino', airportRu: 'Фьюмичино', countryEn: 'Italy', countryRu: 'Италия' },
  { code: 'CIA', cityEn: 'Rome', cityRu: 'Рим', airportEn: 'Ciampino', airportRu: 'Чампино', countryEn: 'Italy', countryRu: 'Италия' },
  { code: 'MXP', cityEn: 'Milan', cityRu: 'Милан', airportEn: 'Malpensa', airportRu: 'Мальпенса', countryEn: 'Italy', countryRu: 'Италия' },
  { code: 'LIN', cityEn: 'Milan', cityRu: 'Милан', airportEn: 'Linate', airportRu: 'Линате', countryEn: 'Italy', countryRu: 'Италия' },
  { code: 'VCE', cityEn: 'Venice', cityRu: 'Венеция', airportEn: 'Marco Polo', airportRu: 'Марко Поло', countryEn: 'Italy', countryRu: 'Италия' },
  { code: 'NAP', cityEn: 'Naples', cityRu: 'Неаполь', airportEn: 'Capodichino', airportRu: 'Каподикино', countryEn: 'Italy', countryRu: 'Италия' },
  { code: 'BCN', cityEn: 'Barcelona', cityRu: 'Барселона', airportEn: 'El Prat', airportRu: 'Эль-Прат', countryEn: 'Spain', countryRu: 'Испания' },
  { code: 'MAD', cityEn: 'Madrid', cityRu: 'Мадрид', airportEn: 'Barajas', airportRu: 'Барахас', countryEn: 'Spain', countryRu: 'Испания' },
  { code: 'AGP', cityEn: 'Malaga', cityRu: 'Малага', airportEn: 'Costa del Sol', airportRu: 'Коста-дель-Соль', countryEn: 'Spain', countryRu: 'Испания' },
  { code: 'LIS', cityEn: 'Lisbon', cityRu: 'Лиссабон', airportEn: 'Humberto Delgado', airportRu: 'Умберту Делгаду', countryEn: 'Portugal', countryRu: 'Португалия' },
  { code: 'AMS', cityEn: 'Amsterdam', cityRu: 'Амстердам', airportEn: 'Schiphol', airportRu: 'Схипхол', countryEn: 'Netherlands', countryRu: 'Нидерланды' },
  { code: 'BRU', cityEn: 'Brussels', cityRu: 'Брюссель', airportEn: 'Brussels', airportRu: 'Брюссель', countryEn: 'Belgium', countryRu: 'Бельгия' },
  { code: 'FRA', cityEn: 'Frankfurt', cityRu: 'Франкфурт', airportEn: 'Frankfurt am Main', airportRu: 'Франкфурт-на-Майне', countryEn: 'Germany', countryRu: 'Германия' },
  { code: 'MUC', cityEn: 'Munich', cityRu: 'Мюнхен', airportEn: 'Franz Josef Strauss', airportRu: 'Франц-Йозеф Штраус', countryEn: 'Germany', countryRu: 'Германия' },
  { code: 'BER', cityEn: 'Berlin', cityRu: 'Берлин', airportEn: 'Brandenburg', airportRu: 'Бранденбург', countryEn: 'Germany', countryRu: 'Германия' },
  { code: 'DUS', cityEn: 'Dusseldorf', cityRu: 'Дюссельдорф', airportEn: 'Dusseldorf', airportRu: 'Дюссельдорф', countryEn: 'Germany', countryRu: 'Германия' },
  { code: 'VIE', cityEn: 'Vienna', cityRu: 'Вена', airportEn: 'Schwechat', airportRu: 'Швехат', countryEn: 'Austria', countryRu: 'Австрия' },
  { code: 'ZRH', cityEn: 'Zurich', cityRu: 'Цюрих', airportEn: 'Kloten', airportRu: 'Клотен', countryEn: 'Switzerland', countryRu: 'Швейцария' },
  { code: 'GVA', cityEn: 'Geneva', cityRu: 'Женева', airportEn: 'Geneva', airportRu: 'Женева', countryEn: 'Switzerland', countryRu: 'Швейцария' },
  { code: 'PRG', cityEn: 'Prague', cityRu: 'Прага', airportEn: 'Vaclav Havel', airportRu: 'Вацлав Гавел', countryEn: 'Czechia', countryRu: 'Чехия' },
  { code: 'BUD', cityEn: 'Budapest', cityRu: 'Будапешт', airportEn: 'Ferenc Liszt', airportRu: 'Ференц Лист', countryEn: 'Hungary', countryRu: 'Венгрия' },
  { code: 'WAW', cityEn: 'Warsaw', cityRu: 'Варшава', airportEn: 'Chopin', airportRu: 'Шопен', countryEn: 'Poland', countryRu: 'Польша' },
  { code: 'KRK', cityEn: 'Krakow', cityRu: 'Краков', airportEn: 'John Paul II', airportRu: 'Иоанн Павел II', countryEn: 'Poland', countryRu: 'Польша' },
  { code: 'ATH', cityEn: 'Athens', cityRu: 'Афины', airportEn: 'Eleftherios Venizelos', airportRu: 'Элефтериос Венизелос', countryEn: 'Greece', countryRu: 'Греция' },
  { code: 'HER', cityEn: 'Heraklion', cityRu: 'Ираклион', airportEn: 'Nikos Kazantzakis', airportRu: 'Никос Казандзакис', countryEn: 'Greece', countryRu: 'Греция', aliases: ['crete', 'крит'] },
  { code: 'RHO', cityEn: 'Rhodes', cityRu: 'Родос', airportEn: 'Diagoras', airportRu: 'Диагорас', countryEn: 'Greece', countryRu: 'Греция' },
  { code: 'SKG', cityEn: 'Thessaloniki', cityRu: 'Салоники', airportEn: 'Makedonia', airportRu: 'Македония', countryEn: 'Greece', countryRu: 'Греция' },
  { code: 'LCA', cityEn: 'Larnaca', cityRu: 'Ларнака', airportEn: 'Larnaca', airportRu: 'Ларнака', countryEn: 'Cyprus', countryRu: 'Кипр' },
  { code: 'PFO', cityEn: 'Paphos', cityRu: 'Пафос', airportEn: 'Paphos', airportRu: 'Пафос', countryEn: 'Cyprus', countryRu: 'Кипр' },
  { code: 'HEL', cityEn: 'Helsinki', cityRu: 'Хельсинки', airportEn: 'Vantaa', airportRu: 'Вантаа', countryEn: 'Finland', countryRu: 'Финляндия' },
  { code: 'ARN', cityEn: 'Stockholm', cityRu: 'Стокгольм', airportEn: 'Arlanda', airportRu: 'Арланда', countryEn: 'Sweden', countryRu: 'Швеция' },
  { code: 'CPH', cityEn: 'Copenhagen', cityRu: 'Копенгаген', airportEn: 'Kastrup', airportRu: 'Каструп', countryEn: 'Denmark', countryRu: 'Дания' },
  { code: 'OSL', cityEn: 'Oslo', cityRu: 'Осло', airportEn: 'Gardermoen', airportRu: 'Гардермуэн', countryEn: 'Norway', countryRu: 'Норвегия' },
  { code: 'DUB', cityEn: 'Dublin', cityRu: 'Дублин', airportEn: 'Dublin', airportRu: 'Дублин', countryEn: 'Ireland', countryRu: 'Ирландия' },
  { code: 'BEG', cityEn: 'Belgrade', cityRu: 'Белград', airportEn: 'Nikola Tesla', airportRu: 'Никола Тесла', countryEn: 'Serbia', countryRu: 'Сербия' },
  { code: 'TIV', cityEn: 'Tivat', cityRu: 'Тиват', airportEn: 'Tivat', airportRu: 'Тиват', countryEn: 'Montenegro', countryRu: 'Черногория' },
  { code: 'TGD', cityEn: 'Podgorica', cityRu: 'Подгорица', airportEn: 'Podgorica', airportRu: 'Подгорица', countryEn: 'Montenegro', countryRu: 'Черногория' },
  { code: 'SOF', cityEn: 'Sofia', cityRu: 'София', airportEn: 'Sofia', airportRu: 'София', countryEn: 'Bulgaria', countryRu: 'Болгария' },
  { code: 'OTP', cityEn: 'Bucharest', cityRu: 'Бухарест', airportEn: 'Henri Coanda', airportRu: 'Анри Коанда', countryEn: 'Romania', countryRu: 'Румыния' },
  { code: 'JFK', cityEn: 'New York', cityRu: 'Нью-Йорк', airportEn: 'John F. Kennedy', airportRu: 'Джон Кеннеди', countryEn: 'USA', countryRu: 'США', aliases: ['nyc'] },
  { code: 'EWR', cityEn: 'New York', cityRu: 'Нью-Йорк', airportEn: 'Newark Liberty', airportRu: 'Ньюарк', countryEn: 'USA', countryRu: 'США' },
  { code: 'LGA', cityEn: 'New York', cityRu: 'Нью-Йорк', airportEn: 'LaGuardia', airportRu: 'Ла-Гуардия', countryEn: 'USA', countryRu: 'США' },
  { code: 'LAX', cityEn: 'Los Angeles', cityRu: 'Лос-Анджелес', airportEn: 'Los Angeles International', airportRu: 'Лос-Анджелес', countryEn: 'USA', countryRu: 'США' },
  { code: 'MIA', cityEn: 'Miami', cityRu: 'Майами', airportEn: 'Miami International', airportRu: 'Майами', countryEn: 'USA', countryRu: 'США' },
  { code: 'ORD', cityEn: 'Chicago', cityRu: 'Чикаго', airportEn: 'O’Hare', airportRu: 'О’Хара', countryEn: 'USA', countryRu: 'США' },
  { code: 'SFO', cityEn: 'San Francisco', cityRu: 'Сан-Франциско', airportEn: 'San Francisco International', airportRu: 'Сан-Франциско', countryEn: 'USA', countryRu: 'США' },
  { code: 'IAD', cityEn: 'Washington', cityRu: 'Вашингтон', airportEn: 'Dulles', airportRu: 'Даллес', countryEn: 'USA', countryRu: 'США' },
  { code: 'YYZ', cityEn: 'Toronto', cityRu: 'Торонто', airportEn: 'Pearson', airportRu: 'Пирсон', countryEn: 'Canada', countryRu: 'Канада' },
  { code: 'YUL', cityEn: 'Montreal', cityRu: 'Монреаль', airportEn: 'Trudeau', airportRu: 'Трюдо', countryEn: 'Canada', countryRu: 'Канада' },
  { code: 'CUN', cityEn: 'Cancun', cityRu: 'Канкун', airportEn: 'Cancun', airportRu: 'Канкун', countryEn: 'Mexico', countryRu: 'Мексика' },
  { code: 'CMB', cityEn: 'Colombo', cityRu: 'Коломбо', airportEn: 'Bandaranaike', airportRu: 'Бандаранаике', countryEn: 'Sri Lanka', countryRu: 'Шри-Ланка' },
  { code: 'MRU', cityEn: 'Mauritius', cityRu: 'Маврикий', airportEn: 'Sir Seewoosagur Ramgoolam', airportRu: 'Маврикий', countryEn: 'Mauritius', countryRu: 'Маврикий' },
  { code: 'NBO', cityEn: 'Nairobi', cityRu: 'Найроби', airportEn: 'Jomo Kenyatta', airportRu: 'Джомо Кеньята', countryEn: 'Kenya', countryRu: 'Кения' },
  { code: 'CPT', cityEn: 'Cape Town', cityRu: 'Кейптаун', airportEn: 'Cape Town International', airportRu: 'Кейптаун', countryEn: 'South Africa', countryRu: 'ЮАР' },
];

function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/gi, ' ')
    .trim();
}

function prefersRussian(query: string) {
  return /[а-яё]/i.test(query);
}

function scoreMatch(haystack: string, needle: string) {
  if (!needle || !haystack) return 0;
  if (haystack === needle) return 400;
  if (haystack.startsWith(needle)) return 260 - Math.min(haystack.length, 80);
  const parts = haystack.split(' ');
  if (parts.some((part) => part.startsWith(needle))) return 180;
  if (haystack.includes(` ${needle}`)) return 90;
  if (haystack.includes(needle)) return 45;
  return 0;
}

function toHit(row: AirportRow, query: string): PlaceHit {
  const ru = prefersRussian(query);
  const city = ru ? row.cityRu : row.cityEn;
  const airport = ru ? row.airportRu : row.airportEn;
  const country = ru ? row.countryRu : row.countryEn;
  return {
    id: `iata-${row.code}`,
    title: `${city}, ${country}`,
    subtitle: `${row.airportEn} · ${row.airportRu}`,
    city: `${city}, ${airport}`,
    airport: row.code,
  };
}

export function searchFlightPlaces(query: string, limit = 10): PlaceHit[] {
  const needle = fold(query);
  if (needle.length < 1) return [];
  const compact = needle.replace(/\s/g, '');

  return AIRPORTS.map((row) => {
    const hay = [
      row.code,
      row.cityEn,
      row.cityRu,
      row.airportEn,
      row.airportRu,
      row.countryEn,
      row.countryRu,
      ...(row.aliases || []),
    ].map(fold);
    const codeScore = scoreMatch(fold(row.code), compact) * 1.4;
    const rest = Math.max(...hay.map((item) => scoreMatch(item, needle)));
    return { row, score: Math.max(codeScore, rest) };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (a.row.rank || 99) - (b.row.rank || 99) || a.row.code.localeCompare(b.row.code))
    .slice(0, limit)
    .map((item) => toHit(item.row, query));
}

export const searchCities = searchFlightPlaces;
export const searchAirports = searchFlightPlaces;
