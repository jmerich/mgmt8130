const electron = require('electron');
console.log('Electron Type:', typeof electron);
console.log('Keys:', Object.keys(electron));
console.log('Has app?', !!electron.app);
console.log('Default?', !!electron.default);
if (electron.default) {
    console.log('Default Keys:', Object.keys(electron.default));
    console.log('Default Has app?', !!electron.default.app);
}
process.exit(0);
