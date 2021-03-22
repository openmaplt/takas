var i_message;

function createMessageElement() {
  i_message = document.createElement('div');
  i_message.classList.add('message');
  i_message.style.display = 'none';
  document.body.appendChild(i_message);
} // createMessageElement

function showMessage(message) {
  if (!i_message) {
    createMessageElement();
  }
  i_message.innerHTML = message;
  i_message.style.display = 'block';
} // showMessage

function hideMessage() {
  i_message.style.display = 'none';
} // hideMessage

function showTempMessage(message) {
  showMessage(message);
  setTimeout(hideMessage, 5000);
} // showTempMessage

export { showMessage, hideMessage, showTempMessage }
