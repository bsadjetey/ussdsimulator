document.addEventListener("DOMContentLoaded", () => {
  const appUrl = localStorage.getItem("app_url");
  const phoneNumber = localStorage.getItem("phone_number");

  if (!appUrl || !phoneNumber) {
    alert("Please configure the USSD app URL and phone number in settings.");
    window.location.href = "./settings.html";
    return;
  }

  const startBtn = document.getElementById("start-ussd");
  const sendBtn = document.getElementById("btn-send");
  const cancelBtn = document.getElementById("btn-cancel");
  const input = document.getElementById("txt-input");
  const content = document.getElementById("ussd-content");
  const loader = document.getElementById("loader");
  const startSection = document.getElementById("start-section");

  let sessionId = null;
  let activeSession = false;

  function generateSessionId() {
    return "SID_" + Math.random().toString(36).substring(2, 10);
  }

async function runUSSD(text, phone_number){
    const app_url = localStorage.getItem("app_url");
    const app_code = localStorage.getItem("selected_app") || '';
    $('#loader').show();

    $.ajax({
        url: app_url,
        data: { text, phone_number, session_id:'ATUid_d07d1c85038f7eaebd81b500970d48bd', app_code },
        type: 'GET',
        timeout: 5000,
        success: function(response){
            $('#loader').hide();
            $('#txt-input').val('');
            $('#start-ussd').hide();

            const restype = response.slice(0,3);
            const message = response.slice(3);

            if(restype.toLowerCase() === 'con') {
                $('.ussd-footer').show();
                $('#txt-input').prop('disabled', false).focus();
            } else {
                $('.ussd-footer').hide();
                $('#txt-input').prop('disabled', true);
            }

            $('#ussd-content').html(message);
        },
        error: function(xhr, status){
            $('#loader').hide();
            $('#ussd-content').html(status==='timeout' ? "Session timed out!" : "Some error occurred!");
        }
    });
}


  function toggleSession(isActive) {
    if (isActive) {
      startSection.style.display = "none";
      input.disabled = false;
      sendBtn.disabled = false;
      cancelBtn.textContent = "Cancel";
    } else {
      startSection.style.display = "block";
      input.disabled = true;
      sendBtn.disabled = true;
      cancelBtn.textContent = "Dismiss";
    }
  }

  function clearSession() {
    activeSession = false;
    sessionId = null;
    content.innerText = "";
    toggleSession(false);
  }

  // Event Listeners
  startBtn.addEventListener("click", () => {
    sessionId = generateSessionId();
    runUSSD("");
  });

  sendBtn.addEventListener("click", () => {
    if (activeSession) runUSSD(input.value.trim());
  });

  cancelBtn.addEventListener("click", clearSession);
});
