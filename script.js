document.addEventListener("DOMContentLoaded", async () => {
  const calendarEl = document.getElementById("calendar");
  const prevBtn = document.getElementById("prevWeek");
  const nextBtn = document.getElementById("nextWeek");

    let holidayDates = [];

  const startHour = 10;
  const endHour = 18;
  let weekOffset = 0;

    const loadingEl = document.getElementById("loading");

    function showLoading() {
      loadingEl.style.display = "block";
    }

    function hideLoading() {
      loadingEl.style.display = "none";
    }

    async function fetchHolidayDates() {
  try {
    const res = await fetch("/api/holiday");
    const result = await res.json();
    holidayDates = result.holidays || [];
  } catch (err) {
    console.error("祝日一覧の取得失敗:", err);
  }
}

  await fetchHolidayDates(); // ← 祝日一覧を取得
  await renderCalendar();    // ← その後に描画


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

  function getDayClass(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay();

    if (holidayDates.includes(dateStr)) return "holiday";  // ← これが正しい
    if (day === 0) return "sunday";
    if (day === 6) return "saturday";
    return "";
  }    

  async function renderCalendar() {  

    showLoading();

    calendarEl.innerHTML = "";

    const dates = generateDates(weekOffset);
    const hours = generateHours();

    let availableSlots = [];
    

    try {
      const response = await fetch("/api/calendar-ava");
      const result = await response.json();
      availableSlots = result.slots || [];
      console.log("availableSlots:",availableSlots);
    }catch (err){
      console.error("API取得失敗:", err);      
    }       

    const table = document.createElement("table");

    // ヘッダー行（曜日ラベル）
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")); // 時間列の空白

    dates.forEach(d => {
      const th = document.createElement("th");
      th.textContent = d.label;
      const dayClass = getDayClass(d.date);
      if (dayClass) th.classList.add(dayClass);
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
        const cell = document.createElement("td");
        const dayClass = getDayClass(d.date);
        if (dayClass) cell.classList.add(dayClass);

        const todayStr = new Date().toISOString().split("T")[0];
        const isPast = d.date < todayStr;
        const isToday = d.date === todayStr;
        const isFuture = d.date > todayStr;

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
  
    hideLoading();
}

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