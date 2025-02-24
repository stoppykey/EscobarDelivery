document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("orderForm");
    const deliveryTimeInput = document.getElementById("deliveryTime");
    const asapCheckbox = document.getElementById("asap");
    const passportInput = document.getElementById("passportPhoto");
    let uploadedPhotoUrl = ""; // Сюда будет сохранена ссылка на фото
  
    // Блокировка поля "Время доставки" при выборе "Как можно скорее"
    asapCheckbox.addEventListener("change", function () {
      deliveryTimeInput.disabled = this.checked;
      deliveryTimeInput.value = this.checked ? "" : deliveryTimeInput.value;
    });
  
    // Обработка отправки формы
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // Останавливаем стандартную отправку формы
  
      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const address = document.getElementById("address").value.trim();
      const comment = document.getElementById("comment").value.trim();
      const deliveryTime = deliveryTimeInput.value;
      const asap = asapCheckbox.checked;
  
      if (!name || !phone || !address) {
        alert("Пожалуйста, заполните все обязательные поля!");
        return;
      }
  
      // Проверяем, загружено ли фото паспорта
      if (passportInput.files.length > 0) {
        uploadPhoto(passportInput.files[0])
          .then((photoUrl) => {
            uploadedPhotoUrl = photoUrl;
            sendDataToSheet(name, phone, address, comment, uploadedPhotoUrl, deliveryTime, asap);
          })
          .catch((error) => {
            console.error("Ошибка загрузки фото:", error);
            alert("Ошибка при загрузке фото паспорта!");
          });
      } else {
        sendDataToSheet(name, phone, address, comment, "", deliveryTime, asap);
      }
    });
  
    // Функция загрузки фото на Google Диск
    function uploadPhoto(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function () {
            const base64String = reader.result.split(",")[1];
      
            fetch("https://script.google.com/macros/s/AKfycbzd04TqI95jqNmmcpGn6Ipt3G37NX61DdOTsissWyWqyGhEokEif1X9h_KrdyigBw/exec", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ photo: base64String })
            })
            .then(response => response.json())  // ✅ Теперь сервер отвечает JSON
            .then(data => resolve(data.url))  // Берём URL из ответа
            .catch(error => reject(error));
          };
        });
      }
      
  
    // Функция отправки данных в Google Таблицу
    function sendDataToSheet(name, phone, address, comment, photoUrl, deliveryTime, asap) {
      fetch("https://script.google.com/macros/s/AKfycbz2jtRaPHoUVU6d2bDLNuX_UtytHyuKS2HHfVstPiFo3CK082K3ob3d8ysJCO5eDVs/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          phone: phone,
          address: address,
          comment: comment,
          photoUrl: photoUrl,
          deliveryTime: deliveryTime,
          asap: asap
        })
      })
        .then(() => {
          form.reset();
          deliveryTimeInput.disabled = false; // Разблокируем поле времени доставки
          showNotification();
        })
        .catch((error) => {
          console.error("Ошибка при отправке данных:", error);
          alert("Ошибка при отправке данных!");
        });
    }
  
    // Функция показа уведомления
    function showNotification() {
      const notification = document.createElement("div");
      notification.innerText = "Ваш заказ принят! В скором времени с вами свяжется наш сотрудник 😉";
      notification.style.position = "fixed";
      notification.style.bottom = "20px";
      notification.style.right = "20px";
      notification.style.padding = "15px";
      notification.style.backgroundColor = "#28a745";
      notification.style.color = "#fff";
      notification.style.borderRadius = "5px";
      notification.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.2)";
      document.body.appendChild(notification);
  
      setTimeout(() => {
        notification.remove();
      }, 4000);
    }
  });
  