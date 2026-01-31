const { app, BrowserWindow, screen } = require('electron');

console.log('='.repeat(80));
console.log('MINIMAL ELECTRON TEST - Si ce test ne montre rien, Electron a un problème');
console.log('='.repeat(80));

app.whenReady().then(() => {
  console.log('[TEST] Electron is ready');
  console.log('[TEST] Node version:', process.version);
  console.log('[TEST] Electron version:', process.versions.electron);
  console.log('[TEST] Chrome version:', process.versions.chrome);
  console.log('[TEST] Platform:', process.platform);
  
  const displays = screen.getAllDisplays();
  console.log('[TEST] Number of displays:', displays.length);
  
  const primaryDisplay = screen.getPrimaryDisplay();
  console.log('[TEST] Primary display:', primaryDisplay.bounds);
  console.log('[TEST] Work area:', primaryDisplay.workArea);
  
  // CREATE A BRIGHT GREEN WINDOW THAT CANNOT BE MISSED
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    x: 100,
    y: 100,
    frame: true,               // WITH FRAME
    transparent: false,        // NOT TRANSPARENT
    backgroundColor: '#00ff41', // BRIGHT GREEN
    alwaysOnTop: true,
    skipTaskbar: false,        // SHOW IN TASKBAR
    title: 'ELECTRON TEST - YOU SHOULD SEE THIS!',
  });

  // LOAD BLANK PAGE WITH BIG TEXT
  win.loadURL('data:text/html,<html><body style="background: #00ff41; display: flex; align-items: center; justify-content: center; margin: 0; font-family: monospace;"><h1 style="font-size: 48px; color: black;">ELECTRON WORKS! ✅</h1></body></html>');
  
  win.webContents.on('did-finish-load', () => {
    console.log('[TEST] ✅ Window loaded successfully');
    console.log('[TEST] Window is visible:', win.isVisible());
    console.log('[TEST] Window bounds:', win.getBounds());
    console.log('[TEST] Window focused:', win.isFocused());
    console.log('='.repeat(80));
    console.log('>>> CHECK YOUR SCREEN FOR A BRIGHT GREEN WINDOW <<<');
    console.log('>>> OR CHECK YOUR TASKBAR / ALT+TAB <<<');
    console.log('='.repeat(80));
  });

  // FLASH THE WINDOW TO GET ATTENTION
  setTimeout(() => {
    console.log('[TEST] Flashing window...');
    win.flashFrame(true);
    win.focus();
    win.moveTop();
  }, 1000);

  // LOG EVERY 3 SECONDS
  setInterval(() => {
    console.log(`[TEST] Window still exists: ${!win.isDestroyed()}, visible: ${win.isVisible()}`);
  }, 3000);
});

app.on('window-all-closed', () => {
  console.log('[TEST] All windows closed');
  app.quit();
});

console.log('[TEST] App starting...');