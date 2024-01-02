//importボタンの取得
const importButton_A = document.querySelector('input[type="button"][value="importA"]');
const importButton_B = document.querySelector('input[type="button"][value="importB"]');

//読み込んだフォントを表示するdiv
const fontDivA = document.querySelector('.font-display-A');
const fontDivB = document.querySelector('.font-display-B');

function getFontName(fontPath) {
    return new Promise((resolve, reject) => {
        window.fontkit.open(fontPath).then(font => {
            const fontName = font.postscriptName;
            resolve(fontName);
        }).catch(error => {
            reject(error);
        });
    });
}

//イベントリスナーの追加
importButton_A.addEventListener('click', () => {
    // ipcRendererを利用してメインプロセスにファイルウィザードを開くよう指示
    window.electron.ipcRenderer.send('open-file-dialog-A');
});

importButton_B.addEventListener('click', () => {
    // ipcRendererを利用してメインプロセスにファイルウィザードを開くよう指示
    window.electron.ipcRenderer.send('open-file-dialog-B');
});


//ファイルが選択された時の処理
window.electron.ipcRenderer.on('selected-file-A', async (paths) => {
    console.log(paths);
    const fontPath = paths[0].replace(/\\/g, '/');

    //const fontName = await getFontName(fontPath);
    const fontName = "testA";

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
    fontDivA.style.fontFamily = fontName;
});

window.electron.ipcRenderer.on('selected-file-B', async (paths) => {
    console.log(paths);
    const fontPath = paths[0].replace(/\\/g, '/');

    //const fontName = await getFontName(fontPath);
    const fontName = "testB";

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
    fontDivB.style.fontFamily = fontName;
});