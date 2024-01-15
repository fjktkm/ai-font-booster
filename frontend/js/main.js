// Electron のモジュールを取得
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const { createReadStream, writeFileSync } = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// メインウィンドウはグローバル参照で保持
// 空になれば自動的にガベージコレクションが働き、開放される
let mainWindow

let fontPathA
let fontPathB
let fontPathC

let externalProcess = null;

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
app.on('ready', () => {
    createWindow();

    let externalExePath;

    // アプリケーションがビルドされてパッケージされているかどうかのチェック
    if (app.isPackaged) {
        // ビルドされたアプリの場合、resourcesディレクトリの下にserverディレクトリがある
        externalExePath = path.join(process.resourcesPath, 'server', 'main.exe');

        // 別のEXEを実行する
        externalProcess = execFile(externalExePath, (error, stdout, stderr) => {
            if (error) {
                throw error;
            }
            console.log(stdout);
        });
    }
});

app.on('window-all-closed', () => {
    // 外部プロセスが存在していれば終了する
    if (externalProcess !== null) {
        externalProcess.kill(); // プロセスを終了
        externalProcess = null;
    }
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
            defaultPath: `${app.getPath('documents')}/export.ttf`,
            filters: [
                {
                    extensions: ['ttf'], // 拡張子の前にドット"."は不要です
                    name: 'TrueTypeフォント'
                }
            ],
            properties: ['showOverwriteConfirmation']
        });

        if (!result.canceled && fontPathC) {
            await fs.copyFile(fontPathC.replace(/\\/g, '/'), result.filePath);
            // コピーが成功した場合の処理をここに書く
            mainWindow.webContents.send('file-copied', result.filePath);
        }
    } catch (error) { // エラーオブジェクトがここで定義される
        console.error('An error occurred:', error);
        // エラー処理をここに書く
        mainWindow.webContents.send('file-copy-failed', error.message);
    }
})

ipcMain.handle('fusion-fonts', async (event) => {
    const url = 'http://127.0.0.1:50113/merge-fonts/';

    try {
        // fetchを動的にインポートする
        const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

        // form-dataを動的にインポートする
        const FormData = await import('form-data').then(module => module.default);
        const formData = new FormData();

        // フォントファイルを追加
        formData.append('font1', createReadStream(fontPathA[0].replace(/\\/g, '/')), {
            filename: 'font1.ttf',
            contentType: 'font/ttf'
        });
        formData.append('font2', createReadStream(fontPathB[0].replace(/\\/g, '/')), {
            filename: 'font2.ttf',
            contentType: 'font/ttf'
        });

        // POSTリクエストを送信
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        if (response.ok) {
            // ArrayBufferとしてレスポンスを取得し、Bufferに変換
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            let savePath;

            // ダウンロードしたフォントファイルを保存するパス
            if (app.isPackaged) {
                savePath = path.join(process.resourcesPath, 'merged_font.ttf');
            }
            else {
                savePath = path.join(__dirname, '..', 'merged_font.ttf');
            }


            // マージされたフォントファイルを保存
            writeFileSync(savePath, buffer);

            // 保存したファイルのパスを返す
            console.log(savePath);
            fontPathC = savePath;
            return savePath;

        } else {
            const errorText = await response.text();
            throw new Error(`サーバーからの応答状況: ${response.status}\n${errorText}`);
        }

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

