// Основен адрес на API сървъра
const host = "http://localhost:5000/";

// Добавяне на събитие за създаване на кратък URL при натискане на бутона
document
  .querySelector("#create-short-url")
  .addEventListener("click", function () {
    const longurl = document.querySelector("#longurl").value.trim();
    const length = parseInt(document.querySelector("#length").value, 10);
    const maxUses = parseInt(document.querySelector("#max-uses").value, 10);

    // Проверка за валиден URL (задължително с http:// или https://)
    if (!longurl.startsWith("http://") && !longurl.startsWith("https://")) {
      return alert("Please enter a valid URL");
    }

    // Изпращане на заявка към API за създаване на кратък URL
    fetch(`${host}api/create-short-url`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ longurl, length, maxUses }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "ok") {
          const shortUrl = `${host}${data.shorturlid}`;
          // Показване на генерирания кратък URL
          document.querySelector("#short-url").innerText = shortUrl;
          document.querySelector("#short-url").href = shortUrl;
        } else if (data.status === "exists") {
          alert("URL already exists: " + `${host}${data.shorturlid}`);
        } else {
          alert("Something went wrong");
        }
      });
  });

// Функция за автоматично зареждане на всички генерирани кратки URL адреси
(function () {
  fetch(`${host}api/get-all-short-urls`)
    .then((response) => response.json())
    .then((data) => {
      let html = "";
      for (const { longurl, shorturlid, count, expire_at } of data) {
        // Създаване на ред в таблицата за всеки генериран URL
        html += `
                  <tr>
                      <td>${longurl}</td>
                      <td><a href="${host}${shorturlid}" target="_blank">${host}${shorturlid}</a></td>
                      <td>${count}</td>
                      <td>${new Date(expire_at).toLocaleString()}</td>
                  </tr>`;
      }
      // Вмъкване на HTML кода в таблицата
      document.querySelector("#list_urls tbody").innerHTML = html;
    });
})();