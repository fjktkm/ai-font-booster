//importボタンの取得
const importButton_A = document.querySelector('#importA');
const importButton_B = document.querySelector('#importB');
var checkboxA = document.getElementById('checkbox-importA');
var checkboxB = document.getElementById('checkbox-importB');

const fusionButton_ = document.querySelector('#fusion');

//読み込んだフォントを表示するdiv
const fontDivA = document.querySelector('.font-display-A');
const fontDivB = document.querySelector('.font-display-B');

function getFontName(fontPath) {
  console.log(`getFontName called with path: ${fontPath}`); // 関数が呼び出されていることを確認
  return new Promise((resolve, reject) => {
    console.log(`Attempting to open font: ${fontPath}`);
    window.electronFontKit.open(fontPath)
      .then(font => {
        console.log(`Font successfully opened.`);
        const fontName = font.postscriptName;
        console.log(`Font loaded: ${fontName}`); // フォントの読み込みが完了したことを確認
        resolve(fontName);
      })
      .catch(error => {
        console.error(`Error opening font: ${error}`); // エラーが発生した場合は内容をログに出力
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
  console.log(fontName);

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

  // チェックボックスが存在すれば、チェック状態をtrueに設定
  if (checkboxA) {
    checkboxA.checked = true;
  }

  if (checkboxA.checked && checkboxB.checked) {
    fusionButton_.classList.remove('disabled');
  }

});

window.electron.ipcRenderer.on('selected-file-B', async (paths) => {
  console.log(paths);
  const fontPath = paths[0].replace(/\\/g, '/');

  //const fontName = await getFontName(fontPath);
  const fontName = "testB";
  console.log(fontName);

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

  // チェックボックスが存在すれば、チェック状態をtrueに設定
  if (checkboxB) {
    checkboxB.checked = true;
  }

  if (checkboxA.checked && checkboxB.checked) {
    fusionButton_.classList.remove('disabled');
  }
});