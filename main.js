// Modules to control application life and create native browser window
const {app, BrowserWindow, globalShortcut, Tray} = require('electron')
const path = require('path')
const util = require('util');
const applescript = require('applescript');
let micIsMute = false;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
  })

  mainWindow.loadFile('index.html')
  mainWindow.on("close", ev => {
    ev.sender.hide();
    ev.preventDefault(); // prevent quit process
  });
}
let tray;
app.whenReady().then(async () => {
  micIsMute = await checkMicMute();
  const trayImage = micIsMute ? 'mic-off.png' : 'mic-on.png';
  tray = new Tray(path.join(__dirname, trayImage));

  const ret = globalShortcut.register('Control+A', async () => {
    console.log('Control+A is pressed')
    if(micIsMute) {
      micControl(100);
      micIsMute = false;
      console.log('mic unmuted ✅');
      tray.setImage(path.join(__dirname, 'mic-on.png'));
    } else {
      micControl(0);
      micIsMute = true;
      console.log('mic muted 🚫');
      tray.setImage(path.join(__dirname, 'mic-off.png'));
    }
  })
  

  if (!ret) {
    console.log('registration failed')
  }

  console.log(globalShortcut.isRegistered('Control+A'))

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('CommandOrControl+X')

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})





function micControl(volume) {
  applescript.execString(`
    tell application "System Events"

      set volume input volume ${volume}

    end tell
  `, (err, rtn) => {
    if (err) {
      // Something went wrong!
      console.log('got error:', error);
    }
    if (Array.isArray(rtn)) {
      for (const songName of rtn) {
        console.log(songName);
      }
    }
  });
}

async function checkMicMute() {
  if(await getMicStatus() === 0) {
    console.log('mic mute: ', true);
    return true;
  } else {
    console.log('mic mute: ', false);
    return false;
  }
}

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

function changeMicIcion() {
  if(micIsMute) {
    tray.setImage(path.join(__dirname, 'mic-on.png'));
  } else {
    tray.setImage(path.join(__dirname, 'mic-on.png'));
  }
}

module.exports = {checkMicMute}
