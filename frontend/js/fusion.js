//fusionボタンの取得
const fusionButton = document.querySelector('input[type="button"][value="fusion"]');

//合成したフォントを表示するdiv
const fontDivC = document.querySelector('.font-display-C');


//イベントリスナーの追加
fusionButton.addEventListener('click', async () => {
    console.log('Button clicked!'); // これが表示されるか確認
    //処理中はボタンを無効化
    fusionButton.disabled = true;

    try {
        //ipcRendererを利用してメインプロセスにHTTPリクエストを飛ばすよう要求
        const response = await window.electron.ipcRenderer.invoke('fusion-fonts-mock');

        //成功した場合の処理
        console.log(response)
        const fontPath = response[0].replace(/\\/g, '/');

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

    } catch (error) {
        // エラー処理
        console.error('IPC request failed:', error);
    } finally {
        // 応答があったらボタンを再度有効化
        fusionButton.disabled = false;
    }
});