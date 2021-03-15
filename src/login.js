var successCallback;
var hash;
function loginScreen(callback) {
  successCallback = callback;
  var login = document.createElement('div');
  login.classList.add('login-div');
  login.id = 'i_login_screen';
  document.body.appendChild(login);

  // Check if hash was provided to change password
  if (window.location.hash.length == 37) {
    hash = window.location.hash.substring(1);
    changePassword();
  } else {
    i_login_screen.innerHTML = '<p>Maršrutų planavimo sistema</p>' +
      '<h1>Takas</h1>' +
      '<p>Prisijunkite:</p>' +
      '<p><input type="text" id="i_username"></p>' +
      '<p><input type="password" id="i_password"></p>' +
      '<p id="i_login" class="mygt">Prisijungti</p>' +
      '<p>Prisiregistruokite</p>' +
      '<p id="i_register" class="mygt">Registruotis</p>' +
      '<p>Arba prisijunkite bendra bandymo paskyra:</p>' +
      '<p>Visi bandymo paskyros naudotojai mato (ir gali keisti bei trinti) vieni kitų maršrutus.</p>' +
      '<p>Bandomieji maršrutai gali būti neperspėjus ištrinti praėjus mėnesiui nuo paskutinio maršruto panaudojimo.</p>' +
      '<p id="i_test" class="mygt">Prisijungti prie bandomosios paskyros</p>';
    i_test.onclick = actionLoginTest;
    i_register.onclick = actionRegisterScreen;
    i_login.onclick = actionLogin;
  }
} // loginScreen

function actionLoginTest() {
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

function actionRegisterScreen() {
  i_login_screen.innerHTML = '<h1>Registracija</h1>' +
    '<p>Naudotojo vardas: <input type="text" id="i_username"></p>' +
    '<p>E-paštas: <input type="text" id="i_email"></p>' +
    '<p style="color: red" id="i_error"></p>' +
    '<p id="i_register" class="mygt">Registruotis</p>';

  i_register.onclick = actionRegister;
} // actionRegister

function actionRegister() {
  const postData = new FormData();
  postData.append('username', i_username.value);
  postData.append('email', i_email.value);
  postData.append('host', window.location.protocol + '//' + window.location.host.toString());
  fetch('php/register.php', { method: 'POST', body: postData })
    .then(response => response.json())
    .then(data => {
      // data.id should be 1, but who cares...
      console.log('Registration completed, result=' + data.result);
      console.log('hash=' + data.hash);
      if (data.result == 0) {
        i_login_screen.innerHTML = '<h1>Registracija sėkminga</h1>' +
          '<p>Jūsų registracija sėkminga.</p>' +
          '<p>Netrukus į nurodytą e-pašto dėžutę gausite laišką su registracijos baigimo nuoroda.</p>' +
          '<p>Paspauskite gautą nuorodą, o šį langą galite uždaryti.</p>';
      } else if (data.result == -1) {
        i_register.innerHTML = 'Registracija nepavyko, toks naudotojas jau yra.';
      } else if (data.result == -100) {
        i_register.innerHTML = 'Registracija nepavyko, dėl nežinomų priežasčių.';
      }
    });
} // actionRegister

function changePassword() {
  console.log('change password');
  i_login_screen.innerHTML = '<h1>Naujas slaptažodis</h1>' +
    '<p>Slaptažodis: <input type="password" id="i_password"></p>' +
    '<p id="i_change_password" class="mygt">Nustatyti slaptažodį</p>';
  // TODO: Enter two passwords and then compare them
  i_change_password.onclick = actionChangePassword;
} // changePassword

function actionChangePassword() {
  const postData = new FormData();
  postData.append('hash', hash);
  postData.append('password', i_password.value);
  fetch('php/password.php', { method: 'POST', body: postData })
    .then(response => response.json())
    .then(data => {
      if (data.result < 0) {
        console.log(data);
      } else {
        i_login_screen.remove();
        loginScreen(successCallback);
      }
    });
} // actionChangePassword

function actionLogin() {
  const postData = new FormData();
  postData.append('user', i_username.value);
  postData.append('pass', i_password.value);
  fetch('php/login.php', { method: 'POST', body: postData })
    .then(response => response.json())
    .then(data => {
      console.log('login result=' + data.id);
      if (data.id > 0) {
        i_login_screen.remove();
        successCallback();
      }
    });
} // actionLogin

export { loginScreen }
