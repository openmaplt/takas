import packagej from '../package.json';
const { version } = packagej;

var successCallback;
var hash;
var i_username; // define these manually as browser needs names "username" and
var i_password; // "password" for password saving functionality to work properly
function loginScreen(callback) {
  successCallback = callback;
  var login = document.createElement('div');
  login.classList.add('login-div');
  login.id = 'i_login_screen';
  var login_content = document.createElement('div');
  login_content.classList.add('login-content');
  login_content.id = 'i_login_content';
  login.appendChild(login_content);
  document.body.appendChild(login);
  i_loading.style.display = 'none';

  // Check if hash was provided to change password
  if (window.location.hash.length == 37) {
    hash = window.location.hash.substring(1);
    window.location.hash = '';
    changePassword();
  } else {
    i_login_content.innerHTML = '<p>Maršrutų planavimo sistema</p>' +
      '<h1>Takas</h1>' +
      '<p><i>' + version + '</i></p>' +
      '<p>Prisijunkite:</p>' +
      '<form><table style="width:100%"><tr><td style="text-align: right">Vardas:</td><td><input type="text" id="username"></td></tr>' +
      '<tr><td style="text-align: right">Slaptažodis:</td><td><input type="password" id="password"></td></tr></table></form>' +
      '<p id="i_error" class="error_message"></p>' +
      '<p id="i_login" class="mygt">Prisijungti</p>' +
      '<p>Neturite paskyros? - <a href="#" id="i_register">Prisiregistruokite</a>.</p>' +
      '<p>Arba prisijunkite bendra <b>bandymo paskyra</b>:</p>' +
      '<p>Visi bandymo paskyros naudotojai mato (ir gali keisti bei trinti) vieni kitų maršrutus.</p>' +
      '<p>Bandomieji maršrutai gali būti neperspėjus ištrinti praėjus mėnesiui nuo paskutinio maršruto panaudojimo.</p>' +
      '<p id="i_test" class="mygt">Prisijungti bandomąja paskyra</p>';
    i_username = document.getElementById('username');
    i_password = document.getElementById('password');
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
        i_login_screen.remove();
      }
    });
} // loginTest

function actionRegisterScreen() {
  i_login_content.innerHTML = '<h1>Registracija</h1>' +
    '<table><tr><td>Naudotojo vardas:</td><td><input type="text" id="i_username"></td></tr>' +
    '<tr><td>E-paštas:</td><td><input type="text" id="i_email"></td></tr></table>' +
    '<p class="error_message" id="i_error"></p>' +
    '<p id="i_register" class="mygt">Registruotis</p>';
  i_username = document.getElementById('i_username');

  i_register.onclick = actionRegister;
} // actionRegister

function actionRegister() {
  const postData = new FormData();
  postData.append('username', i_username.value);
  postData.append('email', i_email.value);
  postData.append('host', window.location.protocol + '//' + window.location.host + window.location.pathname);
  fetch('php/register.php', { method: 'POST', body: postData })
    .then(response => response.json())
    .then(data => {
      // data.id should be 1, but who cares...
      console.log('Registration completed, result=' + data.result);
      console.log('hash=' + data.hash);
      if (data.result == 0) {
        i_login_content.innerHTML = '<h1>Registracija sėkminga</h1>' +
          '<p>Jūsų registracija sėkminga.</p>' +
          '<p>Netrukus į nurodytą e-pašto dėžutę gausite laišką su registracijos baigimo nuoroda.</p>' +
          '<p>Paspauskite gautą nuorodą, o šį langą galite uždaryti.</p>' +
          '<p><b>Pastaba:</b> jei laiško nematote, paieškokite savo šlamšto aplanke.</p>';
      } else if (data.result == -1) {
        i_error.innerHTML = 'Registracija nepavyko, toks naudotojas jau yra.';
      } else if (data.result == -100) {
        i_error.innerHTML = 'Registracija nepavyko, dėl nežinomų priežasčių.';
      }
    });
} // actionRegister

function changePassword() {
  console.log('change password');
  i_login_content.innerHTML = '<h1>Naujas slaptažodis</h1>' +
    '<p>Įveskite savo <b>naują</b> slaptažodį</p>' +
    '<p>Naujas slaptažodis: <input type="password" id="i_password"></p>' +
    '<p>Pakartokite slaptažodį: <input type="password" id="i_password_2"></p>' +
    '<p id="i_password_status" class="error_message"></p>' +
    '<p id="i_change_password" class="mygt">Nustatyti slaptažodį</p>';
  i_password = document.getElementById('i_password');
  // TODO: Enter two passwords and then compare them
  i_change_password.onclick = actionChangePassword;
  i_password.onkeyup = actionClickPassword;
  i_password_2.onkeyup = actionClickPassword;
} // changePassword

function actionClickPassword() {
  if ((i_password.value.length > 0) &&
      (i_password_2.value.length > 0)) {
    if (i_password.value != i_password_2.value) {
      i_password_status.innerHTML = 'Slaptažodžiai nesutampa';
    } else {
      i_password_status.innerHTML = '';
    }
  } else {
    i_password_status.innerHTML = '';
  }
} // actionChangePassword

function actionChangePassword() {
  if ((i_password.value.length > 0) &&
      (i_password.value == i_password_2.value)) {
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
  }
} // actionChangePassword

function actionLogin() {
  i_error.innerHTML = '';
  const postData = new FormData();
  postData.append('user', i_username.value);
  postData.append('pass', i_password.value);
  fetch('php/login.php', { method: 'POST', body: postData })
    .then(response => response.json())
    .then(data => {
      if (data.id > 0) {
        i_login_screen.remove();
        successCallback();
      } else {
        i_error.innerHTML = 'Neteisingas naudotojo vardas ir/arba slaptažodis';
      }
    });
} // actionLogin

export { loginScreen }
