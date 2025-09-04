document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  const prevBtn = document.getElementById("prevWeek");
  const nextBtn = document.getElementById("nextWeek");

  const startHour = 10;
  const endHour = 18;
  let weekOffset = 0;

  function generateDates(offset) {
    const today = new Date();
    const currentDay = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDay + offset * 7);

    return [...Array(7)].map((_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return {
        date: d.toISOString().split("T")[0],
        label: `${d.getMonth() + 1}/${d.getDate()}(${["日","月","火","水","木","金","土"][d.getDay()]})`
      };
    });
  }

  function generateHours() {
    return [...Array(endHour - startHour + 1)].map((_, i) => `${startHour + i}:00`);
  }

    function isHoliday(dateStr) {
     // holidayData配列の中に、引数で渡された日付と一致するデータがあるかチェック
     return holidayData.some(h => h.date === dateStr);
 }

    function getDayClass(dateStr) {
      const date = new Date(dateStr);
      const day = date.getDay();

      if (isHoliday(dateStr)) return "holiday"; // 祝日優先
      if (day === 0) return "sunday";           // 日曜
      if (day === 6) return "saturday";         // 土曜

      return "";
    }

  async function renderCalendar() {
    calendarEl.innerHTML = "";

    const dates = generateDates(weekOffset);
    const hours = generateHours();

    let availableSlots = [];    
  try {
    const response = await fetch("/api/calendar-ava");
    const result = await response.json();
    availableSlots = result.slots || [];
    holidayData = result.holidays || [];
    console.log("availableSlots:", availableSlots); // ← デバッグ用
    console.log("holidayData:", holidayData);
  } catch (err) {
    console.error("API取得失敗:", err);
    availableSlots = [];
    holidayData = [];
  }

    const table = document.createElement("table");

    // ヘッダー行（曜日ラベル）
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")); // 時間列の空白

    dates.forEach(d => {
      const th = document.createElement("th");
      th.textContent = d.label;

      const dayClass = getDayClass(d.date); // ← 曜日クラス取得
      if (dayClass) th.classList.add(dayClass); // ← クラス付ける

      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 本体
    const tbody = document.createElement("tbody");

    hours.forEach(hour => {
  const row = document.createElement("tr");
  const timeCell = document.createElement("td");
  timeCell.textContent = hour;
  row.appendChild(timeCell);

  dates.forEach(d => {
  const cell = document.createElement("td"); // ? これが必要！
  const dayClass = getDayClass(d.date);
  if (dayClass) cell.classList.add(dayClass);

  const todayStr = new Date().toISOString().split("T")[0];
  const isPast = d.date < todayStr;
  const isToday = d.date === todayStr;
  const isFuture = d.date > todayStr;

    console.log("判定:", d.date, getDayClass(d.date));

  const isAvailable = availableSlots.some(slot => {
    return slot.date === d.date && slot.time === hour && slot.available;
  });

  if (isPast) {
    cell.textContent = "×";
    cell.classList.add("unavailable");
  } else if (isToday) {
    cell.textContent = "◎";
    cell.classList.add("available");
    cell.addEventListener("click", () => {
      alert("【本日の予約は直接店舗へお電話にてお問い合わせ下さい】");
    });
  } else if (isFuture && isAvailable) {
    cell.textContent = "◎";
    cell.classList.add("available");
    cell.addEventListener("click", () => {
      const url = new URL("https://yoyaku-form.vercel.app/");
      url.searchParams.set("date", d.date);
      url.searchParams.set("time", hour);
      window.location.href = url.toString();
    });
  } else {
    cell.textContent = "×";
    cell.classList.add("unavailable");
  }

  row.appendChild(cell);
});

  tbody.appendChild(row);
});

  table.appendChild(tbody);
  calendarEl.appendChild(table);

} // ← ? これが抜けてた！


  // 初期表示
  renderCalendar();

  // ボタンイベント
  prevBtn.addEventListener("click", () => {
    weekOffset--;
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    weekOffset++;
    renderCalendar();
  });

});

