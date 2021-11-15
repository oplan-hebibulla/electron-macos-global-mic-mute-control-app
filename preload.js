
const applescript = require('applescript');
const util = require('util');

async function getMicStatus() {
  const applescriptPromise = util.promisify(applescript.execString)
  try {
    const volume = await applescriptPromise(`
      tell application "System Events"
  
        get input volume of (get volume settings)
  
      end tell
    `);
    return volume;
  } catch (error) {
    console.log('got error: ', error)
  }
}

const replaceText = (selector, html) => {
  const element = document.getElementById(selector)
  if (element) element.innerHTML = html
}

async function changeStatusText() {
  const micStatus = await getMicStatus();
  replaceText(`mic-mode`, `mic is ${!micStatus ? '<span class="text-green">mute<span>' : '<span class="text-red">unmute<span>'}`);
}

window.addEventListener('DOMContentLoaded', async () => {
  document.addEventListener("keyup", async function(event) {
    changeStatusText();
  });
  window.addEventListener('focus', async () => await changeStatusText());
  await changeStatusText()
});

