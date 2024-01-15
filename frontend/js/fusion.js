//fusionボタンの取得
const fusionButton = document.querySelector('#fusion');
var exportButton_ = document.querySelector('#export');
var fusionProgress = document.querySelector('#fusion-prog');

//合成したフォントを表示するdiv
const fontDivC = document.querySelector('.font-display-C');


//イベントリスナーの追加
fusionButton.addEventListener('click', async () => {
    console.log('Button clicked!'); // これが表示されるか確認
    //処理中はボタンを無効化
    fusionButton.classList.add('disabled');
    // 初期化段階でindeterminateの状態にする
    fusionProgress.className = 'indeterminate';

    try {
        //ipcRendererを利用してメインプロセスにHTTPリクエストを飛ばすよう要求
        const response = await window.electron.ipcRenderer.invoke('fusion-fonts');

        //成功した場合の処理
        console.log(response)
        const fontPath = response.replace(/\\/g, '/');

        //const fontName = await getFontName(fontPath);
        const fontName = "testC";

        const newStyle = document.createElement('style');
        newStyle.appendChild(document.createTextNode(`
            @font-face {
                font-family: "${fontName}";
                src: url("file://${fontPath}") format("truetype"); /* フォーマットはフォントに応じて変更 */
            }`
        ))

        // スタイルをドキュメントに追加します。
        document.head.appendChild(newStyle);

        // HTML要素にフォントを適用します。
        fontDivC.style.fontFamily = fontName;

        exportButton_.removeAttribute('disabled');

    } catch (error) {
        // エラー処理
        console.error('IPC request failed:', error);
    } finally {
        // 応答があったらボタンを再度有効化
        fusionButton.classList.remove('disabled');
        // class名を変更
        fusionProgress.className = 'determinate';
        // styleのwidthを100%に設定
        fusionProgress.style.width = '100%';
    }
});

exportButton_.addEventListener('click', () => {
    window.electron.ipcRenderer.send('open-file-dialog-C');
});

//ファイル保存成功
window.electron.ipcRenderer.on('file-copied', (event, filePath) => {
    // MaterializeのToastを生成
    M.toast({ html: `フォントを保存しました`, displayLength: 4000 });
});

//ファイル保存失敗
window.electron.ipcRenderer.on('file-copy-error', (event, errorMessage) => {
    // エラーToastを生成
    M.toast({ html: `フォントの保存に失敗しました: ${errorMessage}`, displayLength: 4000 });
});