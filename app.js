// ====== Конфигурация городов ======
const CITIES = [
  { id: "sosnovy", name: "Сосновый Бор", lat: 59.8911, lon: 29.0786, tz: "Europe/Moscow" },
  { id: "spb", name: "Санкт-Петербург", lat: 59.9386, lon: 30.3141, tz: "Europe/Moscow" },
];

const REFRESH_MS = 3 * 60 * 1000; // автообновление каждые 3 минуты (чаще чем у Яндекса)

// ====== Коды погоды WMO: описание + ключ иконки ======
const WMO = {
  0:  ["Ясно", "sun"],
  1:  ["Малооблачно", "few"],
  2:  ["Облачно с прояснениями", "partly"],
  3:  ["Пасмурно", "cloud"],
  45: ["Туман", "fog"],
  48: ["Изморозь", "fog"],
  51: ["Слабая морось", "drizzle"],
  53: ["Морось", "drizzle"],
  55: ["Сильная морось", "drizzle"],
  56: ["Ледяная морось", "sleet"],
  57: ["Ледяная морось", "sleet"],
  61: ["Небольшой дождь", "rain"],
  63: ["Дождь", "rain"],
  65: ["Сильный дождь", "rain"],
  66: ["Ледяной дождь", "sleet"],
  67: ["Ледяной дождь", "sleet"],
  71: ["Небольшой снег", "snow"],
  73: ["Снег", "snow"],
  75: ["Сильный снег", "snow"],
  77: ["Снежная крупа", "snow"],
  80: ["Кратковременный дождь", "rain"],
  81: ["Ливень", "rain"],
  82: ["Сильный ливень", "rain"],
  85: ["Снегопад", "snow"],
  86: ["Сильный снегопад", "snow"],
  95: ["Гроза", "storm"],
  96: ["Гроза с градом", "storm"],
  99: ["Сильная гроза с градом", "storm"],
};

function wmoInfo(code) { return WMO[code] || ["Неизвестно", "cloud"]; }

// ====== SVG-иконки погоды (день и ночь) ======
const C = {
  sun: '#ffd166', sunStroke: '#ffb454', cloud: '#e3ecff',
  cloudDark: '#b6c4e0', rain: '#7cc4ff', snow: '#eaf4ff', bolt: '#ffd166',
  moon: '#eef3ff', moonShade: '#c4d2f0',
};

// Лучи солнца — переиспользуем в нескольких иконках
const SUN_RAYS = `<g fill="none" stroke="${C.sunStroke}" stroke-width="3" stroke-linecap="round">
    <line x1="32" y1="6" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="58"/>
    <line x1="6" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="58" y2="32"/>
    <line x1="13" y1="13" x2="19" y2="19"/><line x1="45" y1="45" x2="51" y2="51"/>
    <line x1="51" y1="13" x2="45" y2="19"/><line x1="19" y1="45" x2="13" y2="51"/></g>`;

const ICONS = {
  // Ясно — солнце
  sun: `<svg viewBox="0 0 64 64">${SUN_RAYS}<circle cx="32" cy="32" r="12" fill="${C.sun}"/></svg>`,

  // Ясно ночью — луна
  moon: `<svg viewBox="0 0 64 64">
    <path d="M40 10a22 22 0 1 0 14 38 17 17 0 0 1-14-38z" fill="${C.moon}"/>
    <circle cx="45" cy="20" r="2.2" fill="${C.moonShade}"/>
    <circle cx="52" cy="29" r="1.5" fill="${C.moonShade}"/>
    <circle cx="44" cy="31" r="1.2" fill="${C.moonShade}"/></svg>`,

  // Малооблачно — крупное солнце и небольшое облако
  few: `<svg viewBox="0 0 64 64">
    <g transform="translate(-5 -6)">${SUN_RAYS}<circle cx="32" cy="32" r="11" fill="${C.sun}"/></g>
    <path d="M27 52a8 8 0 0 1 7.7-9.8 9.6 9.6 0 0 1 18.1 3 6.4 6.4 0 0 1-.8 12.8H29a6.4 6.4 0 0 1-2-6z" fill="${C.cloud}"/></svg>`,

  // Малооблачно ночью — луна и небольшое облако
  fewNight: `<svg viewBox="0 0 64 64">
    <path d="M28 8a15 15 0 1 0 9 25 12 12 0 0 1-9-25z" fill="${C.moon}"/>
    <path d="M27 52a8 8 0 0 1 7.7-9.8 9.6 9.6 0 0 1 18.1 3 6.4 6.4 0 0 1-.8 12.8H29a6.4 6.4 0 0 1-2-6z" fill="${C.cloud}"/></svg>`,

  // Облачно с прояснениями — большое облако с солнцем сбоку
  partly: `<svg viewBox="0 0 64 64">
    <circle cx="18" cy="18" r="8" fill="${C.sun}"/>
    <g fill="none" stroke="${C.sunStroke}" stroke-width="2" stroke-linecap="round">
    <line x1="18" y1="4" x2="18" y2="9"/><line x1="4" y1="18" x2="9" y2="18"/>
    <line x1="8" y1="8" x2="11.5" y2="11.5"/><line x1="28" y1="8" x2="24.5" y2="11.5"/></g>
    <path d="M16 48a11 11 0 0 1 10.8-13.5 13.5 13.5 0 0 1 25.5 4.5 9 9 0 0 1-1.3 18H18a9 9 0 0 1-2-9z" fill="${C.cloud}"/></svg>`,

  // Облачно с прояснениями ночью — луна за облаком
  partlyNight: `<svg viewBox="0 0 64 64">
    <path d="M25 7a14 14 0 1 0 9 24 11 11 0 0 1-9-24z" fill="${C.moon}"/>
    <path d="M20 46a10 10 0 0 1 9.8-12 12 12 0 0 1 23 3.5 8 8 0 0 1-1 16H22a8 8 0 0 1-2-7.5z" fill="${C.cloud}"/></svg>`,

  cloud: `<svg viewBox="0 0 64 64">
    <path d="M18 46a11 11 0 0 1 10.5-13.5 13 13 0 0 1 24.5 4 8.5 8.5 0 0 1-1 17H20a8.5 8.5 0 0 1-2-7.5z" fill="${C.cloud}"/></svg>`,

  fog: `<svg viewBox="0 0 64 64">
    <path d="M18 38a11 11 0 0 1 10.5-13.5 13 13 0 0 1 24.5 4 8.5 8.5 0 0 1-1 13H20a8.5 8.5 0 0 1-2-3.5z" fill="${C.cloudDark}"/>
    <g stroke="${C.cloud}" stroke-width="3" stroke-linecap="round">
    <line x1="14" y1="50" x2="50" y2="50"/><line x1="20" y1="57" x2="44" y2="57"/></g></svg>`,

  drizzle: `<svg viewBox="0 0 64 64">
    <path d="M18 38a11 11 0 0 1 10.5-13.5 13 13 0 0 1 24.5 4 8.5 8.5 0 0 1-1 14H20a8.5 8.5 0 0 1-2-4.5z" fill="${C.cloud}"/>
    <g stroke="${C.rain}" stroke-width="3" stroke-linecap="round">
    <line x1="26" y1="50" x2="24" y2="56"/><line x1="38" y1="50" x2="36" y2="56"/></g></svg>`,

  rain: `<svg viewBox="0 0 64 64">
    <path d="M18 36a11 11 0 0 1 10.5-13.5 13 13 0 0 1 24.5 4 8.5 8.5 0 0 1-1 14H20a8.5 8.5 0 0 1-2-4.5z" fill="${C.cloud}"/>
    <g stroke="${C.rain}" stroke-width="3.2" stroke-linecap="round">
    <line x1="24" y1="48" x2="21" y2="57"/><line x1="33" y1="48" x2="30" y2="57"/>
    <line x1="42" y1="48" x2="39" y2="57"/></g></svg>`,

  sleet: `<svg viewBox="0 0 64 64">
    <path d="M18 36a11 11 0 0 1 10.5-13.5 13 13 0 0 1 24.5 4 8.5 8.5 0 0 1-1 14H20a8.5 8.5 0 0 1-2-4.5z" fill="${C.cloud}"/>
    <g stroke="${C.rain}" stroke-width="3" stroke-linecap="round"><line x1="25" y1="48" x2="22" y2="56"/><line x1="40" y1="48" x2="37" y2="56"/></g>
    <circle cx="33" cy="53" r="2.4" fill="${C.snow}"/></svg>`,

  snow: `<svg viewBox="0 0 64 64">
    <path d="M18 36a11 11 0 0 1 10.5-13.5 13 13 0 0 1 24.5 4 8.5 8.5 0 0 1-1 14H20a8.5 8.5 0 0 1-2-4.5z" fill="${C.cloud}"/>
    <g fill="${C.snow}"><circle cx="25" cy="51" r="2.6"/><circle cx="33" cy="56" r="2.6"/><circle cx="41" cy="51" r="2.6"/></g></svg>`,

  storm: `<svg viewBox="0 0 64 64">
    <path d="M18 34a11 11 0 0 1 10.5-13.5 13 13 0 0 1 24.5 4 8.5 8.5 0 0 1-1 14H20a8.5 8.5 0 0 1-2-4.5z" fill="${C.cloudDark}"/>
    <path d="M32 44l-8 11h7l-3 9 11-13h-7l4-7z" fill="${C.bolt}"/></svg>`,
};

// Иконка по коду WMO; ночью солнце меняем на луну
function iconFor(code, isDay = true) {
  let key = wmoInfo(code)[1];
  if (!isDay) {
    if (key === "sun") key = "moon";
    else if (key === "few") key = "fewNight";
    else if (key === "partly") key = "partlyNight";
  }
  return ICONS[key] || ICONS.cloud;
}

// ====== Вспомогательные функции ======
const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

function pad2(n) { return String(n).padStart(2, "0"); }

function fmtTime(iso, tz) {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit", minute: "2-digit", timeZone: tz,
  });
}

function cityNow(tz) {
  return new Date().toLocaleString("ru-RU", {
    weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: tz,
  });
}

function windDir(deg) {
  const dirs = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
  return dirs[Math.round(deg / 45) % 8];
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// Часть суток по часу начала
function partOfDay(h) {
  if (h < 6) return "ночью";
  if (h < 12) return "утром";
  if (h < 18) return "днём";
  return "вечером";
}

// Тип осадков по коду (для текста)
function precipType(code) {
  const key = wmoInfo(code)[1];
  if (key === "snow") return "снег";
  if (key === "sleet") return "мокрый снег";
  if (key === "drizzle") return "морось";
  if (key === "storm") return "гроза";
  if (key === "rain") return "дождь";
  return "осадки";
}

// Единый порог «есть осадки»: миллиметры ИЛИ вероятность
const WET_MM = 0.1;
const WET_PROB = 45;
function isWet(mm, pr) { return (mm || 0) >= WET_MM || (pr != null && pr >= WET_PROB); }

// Разбор локального ISO-времени Open-Meteo (без сдвига часового пояса браузера)
function isoDate(t) { return t.slice(0, 10); }                // "2026-05-29"
function isoHour(t) { return parseInt(t.slice(11, 13), 10); } // 0..23

// ====== Запрос к Open-Meteo с максимальными параметрами ======
async function fetchWeather(city) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: city.lat,
    longitude: city.lon,
    timezone: city.tz,
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,precipitation,is_day,cloud_cover,dew_point_2m",
    minutely_15: "precipitation,weather_code,temperature_2m",
    hourly: "temperature_2m,weather_code,precipitation,precipitation_probability,is_day,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,dew_point_2m,apparent_temperature",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,precipitation_hours,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant",
    forecast_days: "14",
    wind_speed_unit: "ms",
    models: "best_match",
    cell_selection: "nearest",
    _: Date.now(),
  }).toString();

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

// ====== Анализ осадков: когда начнётся / закончится и окна на сутки ======

// Нау-каст по 15-минутным данным — точное время старта/окончания в ближайшие 2 часа
function nowcast(data) {
  const M = data.minutely_15;
  if (!M || !M.time) return null;
  const now = Date.now();
  let i = M.time.findIndex((t) => new Date(t).getTime() >= now);
  if (i < 0) return null;
  const p = M.precipitation || [];
  const codes = M.weather_code || [];
  const wetNow = (p[i - 1] || 0) > 0 || (p[i] || 0) > 0;
  const horizon = Math.min(i + 8, M.time.length); // ~2 часа

  if (wetNow) {
    for (let j = i; j < horizon; j++) {
      if (!((p[j] || 0) > 0)) return { kind: "stop", time: M.time[j], code: codes[i] };
    }
    return { kind: "ongoing", code: codes[i] };
  }
  for (let j = i; j < horizon; j++) {
    if ((p[j] || 0) > 0) return { kind: "start", time: M.time[j], code: codes[j] };
  }
  return null;
}

// Окна осадков на ближайшие 24 часа по почасовым данным
function precipWindows(data, cur) {
  const H = data.hourly;
  if (!H || !H.time) return [];
  const ct = new Date(cur.time);
  const curHourMs = new Date(ct.getFullYear(), ct.getMonth(), ct.getDate(), ct.getHours()).getTime();
  let start = H.time.findIndex((t) => new Date(t).getTime() >= curHourMs);
  if (start < 0) start = 0;
  const end = Math.min(start + 24, H.time.length);

  const prob = H.precipitation_probability || [];
  const wins = [];
  let w = null;
  for (let i = start; i < end; i++) {
    const mm = H.precipitation ? (H.precipitation[i] || 0) : 0;
    const pr = prob[i] != null ? prob[i] : null;
    const wet = isWet(mm, pr);
    const hour = new Date(H.time[i]).getHours();
    if (wet) {
      if (!w) w = { startHour: hour, startT: H.time[i], sum: 0, maxProb: 0, code: H.weather_code[i], maxMm: 0 };
      w.sum += mm;
      if (pr != null && pr > w.maxProb) w.maxProb = pr;
      if (mm > w.maxMm) { w.maxMm = mm; w.code = H.weather_code[i]; }
      w.endHour = hour;
    } else if (w) { wins.push(w); w = null; }
  }
  if (w) wins.push(w);
  return wins;
}

function fmtWindow(w) {
  const type = precipType(w.code);
  const endH = (w.endHour + 1) % 24;
  const range = `с ${pad2(w.startHour)}:00 до ${pad2(endH)}:00`;
  const probTxt = w.maxProb ? ` · ${w.maxProb}%` : "";
  const mmTxt = w.sum >= 0.1 ? ` · ~${w.sum < 1 ? w.sum.toFixed(1) : Math.round(w.sum)} мм` : "";
  return `${cap(type)} ${partOfDay(w.startHour)}, ${range}${probTxt}${mmTxt}`;
}

// Когда за конкретный день ждать осадки: какие части суток (утром/днём/вечером/ночью).
// Для «сегодня» через minHour отбрасываем уже прошедшие часы.
function dayPrecipParts(data, dateStr, minHour = -1) {
  const H = data.hourly;
  if (!H || !H.time) return { parts: [], maxProb: 0 };
  const prob = H.precipitation_probability || [];
  const acc = {
    "утром":   { mm: 0, pr: 0 },
    "днём":    { mm: 0, pr: 0 },
    "вечером": { mm: 0, pr: 0 },
    "ночью":   { mm: 0, pr: 0 },
  };
  for (let i = 0; i < H.time.length; i++) {
    if (isoDate(H.time[i]) !== dateStr) continue;
    const hr = isoHour(H.time[i]);
    if (hr < minHour) continue;
    const mm = H.precipitation ? (H.precipitation[i] || 0) : 0;
    const pr = prob[i] != null ? prob[i] : 0;
    if (!isWet(mm, pr)) continue;
    const part = partOfDay(hr);
    acc[part].mm += mm;
    if (pr > acc[part].pr) acc[part].pr = pr;
  }
  const order = ["утром", "днём", "вечером", "ночью"];
  const parts = order.filter((p) => acc[p].mm > 0 || acc[p].pr >= WET_PROB);
  let maxProb = 0;
  parts.forEach((p) => { if (acc[p].pr > maxProb) maxProb = acc[p].pr; });
  return { parts, maxProb };
}

// Собираем готовый блок: главная строка (нау-каст) + окна на сутки
function buildPrecip(data, cur, tz) {
  const nc = nowcast(data);
  const wins = precipWindows(data, cur);
  let headline, headClass = "dry";

  if (nc && nc.kind === "start") {
    headline = `${cap(precipType(nc.code))} начнётся около ${fmtTime(nc.time, tz)}`;
    headClass = "soon";
  } else if (nc && nc.kind === "ongoing") {
    headline = `Сейчас идут осадки`;
    headClass = "now";
  } else if (nc && nc.kind === "stop") {
    headline = `Осадки закончатся около ${fmtTime(nc.time, tz)}`;
    headClass = "now";
  } else if (wins.length) {
    const w = wins[0];
    headline = `${cap(precipType(w.code))} ожидается ${partOfDay(w.startHour)}, около ${pad2(w.startHour)}:00`;
    headClass = "soon";
  } else {
    headline = `Осадков не ожидается ближайшие сутки`;
    headClass = "dry";
  }

  const lines = wins.map(fmtWindow);
  return { headline, headClass, lines };
}

// ====== Рендер одной карточки ======
function renderCard(city, data) {
  const tpl = document.getElementById("cardTemplate");
  const node = tpl.content.cloneNode(true);
  const cur = data.current;
  const [desc] = wmoInfo(cur.weather_code);

  node.querySelector(".city-name").textContent = city.name;
  node.querySelector(".city-time").textContent = cityNow(city.tz);
  node.querySelector(".now-icon").innerHTML = iconFor(cur.weather_code, cur.is_day === 1);
  node.querySelector(".temp").textContent = Math.round(cur.temperature_2m);
  node.querySelector(".desc").textContent = desc;
  node.querySelector(".feels-val").textContent = Math.round(cur.apparent_temperature);
  node.querySelector(".t-max").textContent = Math.round(data.daily.temperature_2m_max[0]);
  node.querySelector(".t-min").textContent = Math.round(data.daily.temperature_2m_min[0]);

  node.querySelector(".wind").textContent =
    `${cur.wind_speed_10m.toFixed(1)} м/с ${windDir(cur.wind_direction_10m)}`;
  node.querySelector(".humidity").textContent = `${cur.relative_humidity_2m}%`;
  node.querySelector(".pressure").textContent =
    `${Math.round(cur.pressure_msl * 0.750062)} мм`;
  node.querySelector(".precip").textContent = `${cur.precipitation} мм`;
  node.querySelector(".gusts").textContent =
    cur.wind_gusts_10m != null ? `${cur.wind_gusts_10m.toFixed(1)} м/с` : "—";
  const uv = data.daily.uv_index_max ? data.daily.uv_index_max[0] : null;
  node.querySelector(".uv").textContent = uv != null ? Math.round(uv) : "—";

  // Добавляем точку росы
  const dewPoint = cur.dew_point_2m != null ? Math.round(cur.dew_point_2m) : null;
  if (dewPoint != null) {
    node.querySelector(".feels").innerHTML = `ощущается как <b class="feels-val">${Math.round(cur.apparent_temperature)}</b>° · точка росы ${dewPoint}°`;
  } else {
    node.querySelector(".feels").innerHTML = `ощущается как <b class="feels-val">${Math.round(cur.apparent_temperature)}</b>°`;
  }

  node.querySelector(".sunrise").textContent = fmtTime(data.daily.sunrise[0], city.tz);
  node.querySelector(".sunset").textContent = fmtTime(data.daily.sunset[0], city.tz);

  // ----- Блок «Когда ждать осадки» -----
  const precip = buildPrecip(data, cur, city.tz);
  const pb = node.querySelector(".precip-block");
  pb.classList.add("p-" + precip.headClass);
  pb.querySelector(".precip-headline").textContent = precip.headline;
  const linesBox = pb.querySelector(".precip-lines");
  if (precip.lines.length) {
    precip.lines.forEach((t) => {
      const el = document.createElement("div");
      el.className = "precip-line";
      el.textContent = t;
      linesBox.appendChild(el);
    });
  } else {
    linesBox.remove();
  }

  // ----- Почасовой прогноз (24 часа вместо 12) с вероятностью осадков -----
  const hourly = node.querySelector(".hourly");
  const nowH = new Date(cur.time).getHours();
  const nowDate = new Date(cur.time).getDate();
  let startIdx = data.hourly.time.findIndex((t) => {
    const dt = new Date(t);
    return dt.getHours() === nowH && dt.getDate() === nowDate;
  });
  if (startIdx < 0) startIdx = 0;

  const prob = data.hourly.precipitation_probability || [];
  const fragment = document.createDocumentFragment();

  // Показываем 24 часа вместо 12 для более детального прогноза
  for (let i = startIdx; i < startIdx + 24 && i < data.hourly.time.length; i++) {
    const mm = data.hourly.precipitation ? (data.hourly.precipitation[i] || 0) : 0;
    const pr = prob[i] != null ? prob[i] : null;
    const wet = isWet(mm, pr);
    const h = document.createElement("div");
    h.className = "hour" + (wet ? " wet" : "");

    // Добавляем ощущаемую температуру в тултип
    const apparentTemp = data.hourly.apparent_temperature ? Math.round(data.hourly.apparent_temperature[i]) : null;
    const windSpeed = data.hourly.wind_speed_10m ? data.hourly.wind_speed_10m[i].toFixed(1) : null;

    h.innerHTML = `<div class="h-time">${fmtTime(data.hourly.time[i], city.tz)}</div>
      ${iconFor(data.hourly.weather_code[i], (data.hourly.is_day ? data.hourly.is_day[i] : 1) === 1)}
      <div class="h-temp">${Math.round(data.hourly.temperature_2m[i])}°</div>
      ${pr != null ? `<div class="h-prob${wet ? " on" : ""}">${pr}%</div>` : ""}`;

    // Добавляем дополнительную информацию в data-атрибуты для тултипа
    if (apparentTemp != null) h.setAttribute("title", `Ощущается: ${apparentTemp}°${windSpeed ? ` · Ветер: ${windSpeed} м/с` : ""}`);

    fragment.appendChild(h);
  }
  hourly.appendChild(fragment);

  // ----- Прогноз на 14 дней (вместо 7): КОГДА именно ждать осадки (утром/днём/вечером) -----
  const daily = node.querySelector(".daily");
  const dProb = data.daily.precipitation_probability_max || [];
  const curHour = new Date(cur.time).getHours();
  const dailyFragment = document.createDocumentFragment();

  for (let i = 0; i < data.daily.time.length; i++) {
    const dateStr = isoDate(data.daily.time[i]);
    const date = new Date(dateStr + "T12:00");
    const dayName = WEEKDAYS[date.getDay()];
    const dayNum = date.getDate();
    const monthNum = date.getMonth() + 1;
    const label = i === 0 ? "Сегодня" : `${dayName}, ${dayNum}.${monthNum < 10 ? '0' + monthNum : monthNum}`;
    const pr = dProb[i] != null ? dProb[i] : null;
    const dp = dayPrecipParts(data, dateStr, i === 0 ? curHour : -1);

    // Описание погоды для дня
    const [weatherDesc] = wmoInfo(data.daily.weather_code[i]);

    // Добавляем информацию о ветре для дня
    const windMax = data.daily.wind_speed_10m_max ? data.daily.wind_speed_10m_max[i] : null;
    const gustsMax = data.daily.wind_gusts_10m_max ? data.daily.wind_gusts_10m_max[i] : null;

    let whenHtml = "";
    if (dp.parts.length) {
      const probTxt = dp.maxProb ? ` · ${dp.maxProb}%` : "";
      whenHtml = `<span class="d-when on">💧 ${dp.parts.join(", ")}${probTxt}</span>`;
    } else if (pr != null && pr >= 25) {
      whenHtml = `<span class="d-when">возможны осадки · ${pr}%</span>`;
    } else {
      // Показываем описание погоды + ветер если сильный
      let windInfo = "";
      if (windMax && windMax > 7) {
        windInfo = ` · ветер до ${windMax.toFixed(0)} м/с`;
      }
      whenHtml = `<span class="d-when">${weatherDesc}${windInfo}</span>`;
    }

    const row = document.createElement("div");
    row.className = "day";

    // Добавляем тултип с подробной информацией
    const tooltipParts = [];
    if (windMax) tooltipParts.push(`Ветер: до ${windMax.toFixed(1)} м/с`);
    if (gustsMax) tooltipParts.push(`Порывы: до ${gustsMax.toFixed(1)} м/с`);
    const precipHours = data.daily.precipitation_hours ? data.daily.precipitation_hours[i] : null;
    if (precipHours) tooltipParts.push(`Осадки: ${precipHours}ч`);

    row.innerHTML = `
      <span class="d-ico">${iconFor(data.daily.weather_code[i], true)}</span>
      <span class="d-info">
        <span class="d-name">${label}</span>
        ${whenHtml}
      </span>
      <span class="d-temps">
        <span class="dt-min">${Math.round(data.daily.temperature_2m_min[i])}°</span>
        <span class="bar"></span>
        <span class="dt-max">${Math.round(data.daily.temperature_2m_max[i])}°</span>
      </span>`;

    if (tooltipParts.length > 0) {
      row.setAttribute("title", tooltipParts.join(" · "));
    }

    dailyFragment.appendChild(row);
  }
  daily.appendChild(dailyFragment);

  return { node, isDay: cur.is_day === 1, code: cur.weather_code };
}

function renderError(city) {
  const art = document.createElement("article");
  art.className = "card error";
  art.innerHTML = `<div class="err-icon">⚠</div>
    <div class="city-name">${city.name}</div>
    <p class="feels">Не удалось загрузить погоду. Попробую снова автоматически.</p>`;
  return art;
}

// ====== Скелетон-карточка: держит место и шиммерит, пока грузятся данные ======
// Главное против «мигания»: на старте экран сразу выглядит как приложение,
// реклама не подпрыгивает под шапку и нет резкого скачка вёрстки при загрузке.
function skeletonCard(city) {
  const art = document.createElement("article");
  art.className = "card skeleton";
  const reps = (n, html) => Array.from({ length: n }, () => html).join("");
  art.innerHTML = `
    <div class="card-head">
      <div class="city">
        <span class="sk sk-text" style="width:46%"></span>
        <span class="sk sk-text" style="width:62%;margin-top:9px"></span>
      </div>
      <span class="sk sk-circle"></span>
    </div>
    <div class="now">
      <span class="sk sk-temp"></span>
      <div class="now-meta">
        <span class="sk sk-text" style="width:70%"></span>
        <span class="sk sk-text" style="width:55%"></span>
        <span class="sk sk-text" style="width:40%"></span>
      </div>
    </div>
    <div class="sk sk-bar" style="height:66px;margin-bottom:20px"></div>
    <div class="details">${reps(6, '<span class="sk sk-detail"></span>')}</div>
    <div class="section-title"><span class="sk sk-text" style="width:130px"></span></div>
    <div class="hourly sk-row">${reps(8, '<span class="sk sk-hour"></span>')}</div>
    <div class="section-title"><span class="sk sk-text" style="width:90px"></span></div>
    <div class="daily">${reps(7, '<span class="sk sk-day"></span>')}</div>`;
  if (city) art.querySelector(".city .sk-text").setAttribute("aria-label", city.name);
  return art;
}

// Мгновенно показываем заглушки под все города (синхронно, до первого fetch)
function showSkeletons() {
  const cards = document.getElementById("cards");
  if (!cards || cards.children.length) return;
  const frag = document.createDocumentFragment();
  CITIES.forEach((c) => frag.appendChild(skeletonCard(c)));
  cards.appendChild(frag);
}

// ====== Тема фона по погоде и времени суток ======
const THEMES = {
  clearDay:   ["#2b6cd4", "#5fa8e8"],
  clearNight: ["#0f1840", "#1f2e63"],
  cloudDay:   ["#5a6b8c", "#8a9bbd"],
  cloudNight: ["#1a2238", "#2f3a57"],
  rainDay:    ["#3a4a66", "#5a6b85"],
  rainNight:  ["#161e30", "#28324a"],
  snowDay:    ["#6a7b9c", "#9fb0cc"],
  snowNight:  ["#222b45", "#3a4566"],
  stormDay:   ["#2a3147", "#454d6b"],
  stormNight: ["#12141f", "#262a3d"],
};

function pickTheme(code, isDay) {
  const key = wmoInfo(code)[1];
  const suffix = isDay ? "Day" : "Night";
  if (key === "sun" || key === "few") return THEMES["clear" + suffix];
  if (["rain", "drizzle", "sleet"].includes(key)) return THEMES["rain" + suffix];
  if (key === "snow") return THEMES["snow" + suffix];
  if (key === "storm") return THEMES["storm" + suffix];
  return THEMES["cloud" + suffix];
}

function applyBackground(code, isDay) {
  const [top, bot] = pickTheme(code, isDay);
  document.documentElement.style.setProperty("--bg-top", top);
  document.documentElement.style.setProperty("--bg-bot", bot);
  document.getElementById("sky").style.background =
    `linear-gradient(165deg, ${top}, ${bot})`;
  document.body.classList.toggle("is-night", !isDay);
  // theme-color статус-бара под текущий фон (важно для приложения на телефоне)
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", top);
  spawnParticles(code);
  // Солнце/луну показываем плавно только ПОСЛЕ того, как фон выставлен под погоду,
  // — иначе при запуске большое солнце вспыхивало на секунду (см. фикс мигания).
  if (!document.body.classList.contains("ready")) {
    requestAnimationFrame(() => document.body.classList.add("ready"));
  }
}

// ====== Частицы: дождь / снег ======
function spawnParticles(code) {
  const box = document.getElementById("particles");
  box.innerHTML = "";
  const key = wmoInfo(code)[1];
  const isRain = ["rain", "drizzle", "storm", "sleet"].includes(key);
  const isSnow = key === "snow";
  if (!isRain && !isSnow) return;

  // Оптимизация: меньше частиц, используем DocumentFragment
  const count = isSnow ? 35 : 50;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    const left = Math.random() * 100;
    const delay = Math.random() * 5;
    if (isSnow) {
      p.className = "flake";
      p.textContent = "❄";
      p.style.cssText = `left:${left}%;font-size:${8 + Math.random() * 12}px;animation-duration:${5 + Math.random() * 6}s;animation-delay:${delay}s`;
    } else {
      p.className = "drop";
      p.style.cssText = `left:${left}%;height:${40 + Math.random() * 40}px;animation-duration:${0.5 + Math.random() * 0.6}s;animation-delay:${delay}s`;
    }
    fragment.appendChild(p);
  }
  box.appendChild(fragment);
}

// ====== Часы ======
function tickClock() {
  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString("ru-RU");
}

function setUpdated(date, stale = false) {
  const t = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("updatedText").textContent = "обновлено в " + t;
  document.getElementById("pulse").classList.toggle("stale", stale);
}

// ====== Главный цикл обновления ======
async function update() {
  const btn = document.getElementById("refreshBtn");
  btn.classList.add("spin");

  const results = await Promise.allSettled(CITIES.map(fetchWeather));
  const cards = document.getElementById("cards");

  // Собираем все карточки в фрагмент и подменяем за один раз (replaceChildren),
  // без промежуточного пустого кадра — это убирает мигание при загрузке и автообновлении.
  const frag = document.createDocumentFragment();
  let firstCity = null;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      const { node, isDay, code } = renderCard(CITIES[i], r.value);
      frag.appendChild(node);
      if (i === 0) firstCity = { isDay, code }; // фон по первому городу (Сосновый Бор)
    } else {
      frag.appendChild(renderError(CITIES[i]));
      console.error("Ошибка загрузки", CITIES[i].name, r.reason);
    }
  });

  // Анимация «выезда» карточек — только при первой загрузке, без мигания на автообновлении.
  // Класс ставим ДО вставки (rise использует fill-mode both), чтобы не было вспышки.
  cards.classList.toggle("intro", firstRender);
  cards.replaceChildren(frag);
  firstRender = false;

  if (firstCity) applyBackground(firstCity.code, firstCity.isDay);
  const anyOk = results.some((r) => r.status === "fulfilled");
  setUpdated(new Date(), !anyOk);
  lastUpdate = Date.now();

  setTimeout(() => btn.classList.remove("spin"), 800);
}

// ====== PWA: установка приложения и service worker ======
let deferredPrompt = null;

// Запущено ли уже как установленное приложение (с иконки на экране)
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
         window.navigator.standalone === true;
}

// Платформа — чтобы показать правильную инструкцию по установке
function platformKind() {
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua) ||
      (/macintosh/i.test(ua) && "ontouchend" in document)) return "ios";
  return "desktop";
}

const INSTALL_STEPS = {
  android: [
    "Откройте сайт в Chrome.",
    "Нажмите меню ⋮ в правом верхнем углу.",
    "Выберите «Установить приложение» (или «Добавить на главный экран»).",
    "Подтвердите — на рабочем столе появится отдельная иконка.",
  ],
  ios: [
    "Откройте сайт в Safari.",
    "Нажмите кнопку «Поделиться» ⬆️ внизу экрана.",
    "Пролистайте вниз и выберите «На экран „Домой“».",
    "Нажмите «Добавить» — иконка появится как обычное приложение.",
  ],
  desktop: [
    "Откройте сайт в Chrome или Edge.",
    "В правой части адресной строки нажмите значок установки ⊕.",
    "Либо меню браузера → «Установить „Погода“».",
  ],
};

function openInstallSheet() {
  const sheet = document.getElementById("installSheet");
  if (!sheet) return;
  const steps = INSTALL_STEPS[platformKind()] || INSTALL_STEPS.desktop;
  sheet.querySelector(".sheet-steps").innerHTML =
    steps.map((s) => `<li>${s}</li>`).join("");
  sheet.hidden = false;
  requestAnimationFrame(() => sheet.classList.add("open"));
}

function closeInstallSheet() {
  const sheet = document.getElementById("installSheet");
  if (!sheet) return;
  sheet.classList.remove("open");
  setTimeout(() => { sheet.hidden = true; }, 250);
}

function initInstall() {
  const btn = document.getElementById("installBtn");
  if (!btn) return;

  // Уже установлено — кнопка не нужна; иначе показываем её всегда
  btn.hidden = isStandalone();

  // Android/Chrome/Edge: ловим системное приглашение установить
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone()) btn.hidden = false;
  });

  btn.addEventListener("click", async () => {
    if (deferredPrompt) {
      // Нативное окно установки (Android, десктоп)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === "accepted") btn.hidden = true;
    } else {
      // iOS и браузеры без авто-установки — показываем пошаговую инструкцию
      openInstallSheet();
    }
  });

  window.addEventListener("appinstalled", () => {
    btn.hidden = true;
    deferredPrompt = null;
    closeInstallSheet();
  });

  const sheet = document.getElementById("installSheet");
  if (sheet) {
    sheet.addEventListener("click", (e) => {
      if (e.target === sheet || e.target.classList.contains("sheet-close")) {
        closeInstallSheet();
      }
    });
  }
}

if ("serviceWorker" in navigator) {
  // Если уже есть управляющий SW, то его смена = приехало обновление → один тихий reload.
  // На самой первой установке controller отсутствует, поэтому лишней перезагрузки не будет.
  if (navigator.serviceWorker.controller) {
    let swReloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (swReloaded) return;
      swReloaded = true;
      location.reload();
    });
  }
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) =>
      console.warn("SW не зарегистрирован:", err)
    );
  });
}

// ====== Инициализация ======
let lastUpdate = Date.now();
let firstRender = true; // анимация появления карточек только при первой загрузке

document.getElementById("refreshBtn").addEventListener("click", update);
initInstall();

tickClock();
setInterval(tickClock, 1000);

showSkeletons();   // мгновенные заглушки, пока летит первый запрос — никакого пустого экрана
update();
setInterval(update, REFRESH_MS);

// Обновляем при возврате на вкладку/в приложение, если данные устарели
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && Date.now() - lastUpdate > REFRESH_MS) {
    update();
  }
});
