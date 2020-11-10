const electronInstaller = require('electron-winstaller')
try {
    electronInstaller.createWindowsInstaller({
        appDirectory: './release-builds/r',
        outputDirectory: './release-builds',
        authors: 'Miron Loncaric',
        exe: 'Offline Diary.exe'
    });
    console.log('It worked!')
} catch (e) {
    console.log(e)
}