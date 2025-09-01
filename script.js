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

  async function renderCalendar() {
  calendarEl.innerHTML = "";
  const dates = generateDates(weekOffset);
  const hours = generateHours();
  const todayStr = new Date().toISOString().split("T")[0];

  const response = await fetch("/api/calendar-ava");
  const result = await response.json();
  const availableSlots = result.slots;

  const table = document.createElement("table");

  // ヘッダー生成（省略）

  const tbody = document.createElement("tbody");
  hours.forEach(hour => {
    const row = document.createElement("tr");
    const timeCell = document.createElement("td");
    timeCell.textContent = hour;
    row.appendChild(timeCell);

    dates.forEach(d => {
      const cell = document.createElement("td");
      const isPast = d.date < todayStr;
      const isToday = d.date === todayStr;
      const isFuture = d.date > todayStr;

      const isAvailable = availableSlots.some(slot => {
        return slot.date === d.date && slot.time === hour;
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
}