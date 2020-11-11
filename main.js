const path = require('path')
const url = require('url')
const Datastore = require('nedb')
const { app, BrowserWindow, ipcMain } = require('electron')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const basePath = path.join(app.getPath('userData'), 'DiaryApp')
const dbFile = path.join(basePath, 'entries.db')
const pwFile = path.join(basePath, 'password.db')

const algorithm = 'aes-256-cbc'
const secret = 'superSecretKey'
const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32)

// Squirrel
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

const entries = new Datastore({
	filename: dbFile,
	autoload: true,
	afterSerialization(plaintext) {
		const iv = crypto.randomBytes(16)
		const aes = crypto.createCipheriv(algorithm, key, iv)
		let ciphertext = aes.update(plaintext)
		ciphertext = Buffer.concat([iv, ciphertext, aes.final()])
		return ciphertext.toString('base64')
	},
	beforeDeserialization(ciphertext) {
		const ciphertextBytes = Buffer.from(ciphertext, 'base64')
		const iv = ciphertextBytes.slice(0, 16)
		const data = ciphertextBytes.slice(16)
		const aes = crypto.createDecipheriv(algorithm, key, iv)
		let plaintextBytes = Buffer.from(aes.update(data))
		plaintextBytes = Buffer.concat([plaintextBytes, aes.final()])
		return plaintextBytes.toString()
	}
})
const password = new Datastore({
	filename: pwFile
})

let mainWindow

let isDev = false

if (
	process.env.NODE_ENV !== undefined &&
	process.env.NODE_ENV === 'development'
) {
	isDev = true
}

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 800,
		show: false,
		icon: `${__dirname}/assets/icon.png`,
		webPreferences: {
			nodeIntegration: true,
		},
	})

	let indexPath

	if (isDev && process.argv.indexOf('--noDevServer') === -1) {
		indexPath = url.format({
			protocol: 'http:',
			host: 'localhost:8080',
			slashes: true,
		})
	} else {
		indexPath = url.format({
			protocol: 'file:',
			pathname: path.join(__dirname, 'dist', 'index.html'),
			slashes: true,
		})
	}

	mainWindow.loadURL(indexPath)

	// Don't show until we are ready and loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	})

	mainWindow.on('closed', () => (mainWindow = null))

}

ipcMain.on('new-entry', (event, arg) => {

	const { emoji, content } = arg
	
	// date and time
	const time = new Date()
	const dd = String(time.getDate())
	const mm = String(time.getMonth())
	const yyyy = time.getFullYear()
	const minutes = time.getMinutes()
	const hours = time.getHours()

	entries.loadDatabase(() => {

		entries.insert({ emoji, text:content, time, date:`${dd}/${mm+1}/${yyyy} ${hours}:${minutes}` })

		entries.find({}, (err, docs) => {
			mainWindow.webContents.send('handle-load-entries', docs)
		})
	})

})
ipcMain.on('load-entries', (event, arg) => {

	entries.loadDatabase(() => {
		
		const stuff = []
		entries.find({}, (err, docs) => {

			event.sender.send('handle-load-entries', docs)

		})

	})

})
ipcMain.on('pw-exists', (event, arg) => {

	password.loadDatabase(() => {

		password.findOne({}, (err, docs) => {
			
			if (docs) event.sender.send('pw-exists', { pwExists: true, name:docs.name })
			else event.sender.send('pw-exists', false)

		})

	})

})

ipcMain.on('set-pw', (event, arg) => {

	bcrypt.genSalt(10, (err, salt) => {

		bcrypt.hash(arg.pwd, salt, (err, hash) => {

			password.loadDatabase(() => {
				password.insert({ pwd:hash, name:arg.name })
			})

			event.sender.send('set-pw', 'success')

		})

	})

})

ipcMain.on('check-pw', (event, arg) => {

	password.loadDatabase(() => {

		password.findOne({}, (err, docs) => {

			bcrypt.compare(arg, docs.pwd, (err, result) => {

				if (result === true) { 
					event.sender.send('check-pw', true)
				}
				else event.sender.send('check-pw', false)

			})

		})

	})

})

app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createMainWindow()
	}
})

// Stop error
app.allowRendererProcessReuse = true
