// Electron のモジュールを取得
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');

// メインウィンドウはグローバル参照で保持
// 空になれば自動的にガベージコレクションが働き、開放される
let mainWindow

let fontPathA
let fontPathB
let fontPathC

// Electron のウィンドウを生成する関数
function createWindow() {
    // ウィンドウ生成（横幅 800、高さ 600、フレームを含まないサイズ指定
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        useContentSize: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // 表示対象の HTML ファイルを読み込む
    mainWindow.loadFile('index.html')

    // ウィンドウを閉じた時に発生する処理
    mainWindow.on('closed', () => {
        // メインウィンドウの値を null にして、ガベージコレクタに開放させる
        mainWindow = null
    })
}

// Electronの初期化完了後に、ウィンドウ生成関数を実行
app.on('ready', createWindow)

app.on('window-all-closed', () => {
    // macOS の場合、アプリを完全に終了するのではなく
    // メニューバーに残す（ユーザーが Ctrl + Q を押すまで終了しない）ことが
    // 一般的であるため、これを表現する
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// アプリが実行された時に発生
app.on('activate', function () {
    // macOS の場合、アプリ起動処理（Dock アイコンクリック）時に
    // 実行ウィンドウが空であれば、
    // アプリ内にウィンドウを再作成することが一般的
    if (mainWindow === null) {
        createWindow()
    }
})

//フォントファイルの読み込み
ipcMain.on('open-file-dialog-A', (event) => {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Font Files', extensions: ['ttf', 'otf', 'ttc', 'otc'] }
        ]
    }).then(result => {
        if (!result.canceled) {
            //パスを格納
            fontPathA = result.filePaths;
            //Rendererプロセスにファイルのパスを送信
            mainWindow.webContents.send('selected-file-A', fontPathA);
        }
    }).catch(err => {
        console.log(err);
    });
});

ipcMain.on('open-file-dialog-B', (event) => {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Font Files', extensions: ['ttf', 'otf', 'ttc', 'otc'] }
        ]
    }).then(result => {
        if (!result.canceled) {
            //パスを格納
            fontPathB = result.filePaths;
            //Rendererプロセスにファイルのパスを送信
            mainWindow.webContents.send('selected-file-B', result.filePaths);
        }
    }).catch(err => {
        console.log(err);
    });
});

ipcMain.on('open-file-dialog-C', async (event) => {
    try {
        const result = await dialog.showSaveDialog(mainWindow, {
            defaultPath:  `${app.getPath('documents')}/export.ttf`,
            filters: [
                {
                    extensions: ['ttf'], // 拡張子の前にドット"."は不要です
                    name: 'TrueTypeフォント'
                }
            ],
            properties: ['showOverwriteConfirmation'] 
        });

        if (!result.canceled && fontPathC) {
            await fs.copyFile(fontPathC[0].replace(/\\/g, '/'), result.filePath);
            // コピーが成功した場合の処理をここに書く
            //event.sender.send('file-copied', result.filePath);
        }
    } catch (error) { // エラーオブジェクトがここで定義される
        console.error('An error occurred:', error);
        // エラー処理をここに書く
        //event.sender.send('file-copy-failed', error.message);
    }
})

ipcMain.handle('fusion-fonts', async (event) => {
    const url = 'http://localhost:8000';
    const formData = new URLSearchParams();

    //フォントのファイルパスをPOSTのBodyに追加
    formData.append('fontPathA', fontPathA);
    formData.append('fontPathB', fontPathB);

    try {
        // fetchを動的にインポートする
        const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

        //fetchでHTTP POSTリクエストを送る
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urleoncoded',
            },
            body: formData,
        });

        // 応答をJSONとして処理（もしJSONで応答が返ってくる場合）
        const data = await response.json();

        // 応答データを返す
        return data.result;

    } catch (error) {
        // エラーが発生した場合、エラー情報をログに出力
        console.error('Error sending POST request:', error);
        throw error;
    }
});

ipcMain.handle('fusion-fonts-mock', async (event) => {
    const mockResponseData = {
        result: fontPathA
    };


    // ダミーで3秒間待つ
    await new Promise(resolve => setTimeout(resolve, 3000));

    fontPathC = mockResponseData.result;

    return mockResponseData.result
});

