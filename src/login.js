var successCallback;
function loginScreen(callback) {
  successCallback = callback;
  var login = document.createElement('div');
  login.classList.add('login-div');
  login.id = 'i_login_screen';
  login.innerHTML = '<p>Maršrutų planavimo sistema</p>' +
    '<h1>Takas</h1>' +
    '<p>Prisijunkite:</p>' +
    '<p>TODO LOGIN</p>' +
    '<p>TODO PASSWORD</p>' +
    '<p id="i_login" class="mygt">TODO LOGINBUTTON</p>' +
    '<p>Prisiregistruokite</p>' +
    '<p id="i_register" class="mygt">TODO REGISTER BUTTON</p>' +
    '<p>Arba prisijunkite bendra bandymo paskyra:</p>' +
    '<p>Visi bandymo paskyros naudotojai mato (ir gali keisti bei trinti) vieni kitų maršrutus.</p>' +
    '<p>Bandomieji maršrutai gali būti neperspėjus ištrinti praėjus mėnesiui nuo paskutinio maršruto panaudojimo.</p>' +
    '<p id="i_test" class="mygt">Prisijungti prie bandomosios paskyros</p>';
  document.body.appendChild(login);

  i_test.onclick = loginTest;
} // loginScreen

function loginTest() {
  const postData = new FormData();
  postData.append('test', 1);
  fetch('php/login.php', { method: 'POST', body: postData })
    .then(response => response.json())
    .then(data => {
      // data.id should be 1, but who cares...
      console.log('Test user connected. Response=' + data.id);
      if (data.id >= 0) {
        successCallback();
      }
      i_login_screen.remove();
    });
} // loginTest
export { loginScreen }