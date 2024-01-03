const textA = document.querySelector('.font-display-A');
const textB = document.querySelector('.font-display-B');
const textC = document.querySelector('.font-display-C');
const inputDisplay = document.querySelector('#display');

// input要素のテキストが変更された際に変更を反映する関数
function updateTexts(event) {
    const newText = event.target.value;
    textA.textContent = newText;
    textB.textContent = newText;
    textC.textContent = newText;
}

// input要素にイベントリスナーを追加
inputDisplay.addEventListener('input', updateTexts);