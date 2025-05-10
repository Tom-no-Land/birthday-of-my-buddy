// 全体を即時実行関数で包んで、グローバル汚染を防ぐ
(function() {
    // おみくじの設定
    const TOTAL_ATTEMPTS = 3;  // 総回数
    let attemptCount = 0;      // 現在の挑戦回数

// DOM要素をグローバル変数として宣言
let drawButton, omikujiBox, resultArea, resultMessage, retryButton, giftButton, remainingCount, confettiContainer;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    drawButton = document.getElementById('drawButton');
    omikujiBox = document.getElementById('omikujiBox');
    resultArea = document.getElementById('resultArea');
    resultMessage = document.getElementById('resultMessage');
    retryButton = document.getElementById('retryButton');
    giftButton = document.getElementById('giftButton');
    remainingCount = document.getElementById('remainingCount');
    confettiContainer = document.getElementById('confettiContainer');
    
    // ローカルストレージから保存データを読み込む
    loadSavedData();
    
    // 初期状態を設定
    updateDisplay();
    
    // おみくじを引くボタンのイベントリスナー
    if (drawButton) {
        drawButton.addEventListener('click', handleDrawButtonClick);
    }
    
    // もう一回挑戦ボタンのイベントリスナー
    if (retryButton) {
        retryButton.addEventListener('click', handleRetryButtonClick);
    }
});

// おみくじを引くボタンのクリックハンドラ
function handleDrawButtonClick() {
    // ボタンを一時的に無効化
    drawButton.disabled = true;
    
    // おみくじ箱を振るアニメーション
    omikujiBox.classList.add('shake');
    
    // アニメーション終了後に結果を表示
    setTimeout(function() {
        omikujiBox.classList.remove('shake');
        attemptCount++;
        
        // データを保存
        saveData();
        
        showResult();
        
        // 残り回数を更新
        updateRemainingCount();
    }, 500);
}

// もう一回挑戦ボタンのクリックハンドラ
function handleRetryButtonClick() {
    // 結果をリセット
    resultArea.style.display = 'none';
    retryButton.style.display = 'none';
    
    // おみくじを引くボタンを再表示して有効化
    drawButton.style.display = 'inline-block';
    drawButton.disabled = false;
}

// データ保存関数
function saveData() {
    const data = {
        attemptCount: attemptCount,
        date: new Date().toDateString(),
        lastResult: attemptCount === TOTAL_ATTEMPTS ? 'win' : 'lose'
    };
    localStorage.setItem('birthdayOmikuji', JSON.stringify(data));
}

// データ読み込み関数
function loadSavedData() {
    const savedData = localStorage.getItem('birthdayOmikuji');
    if (savedData) {
        const data = JSON.parse(savedData);
        const today = new Date().toDateString();
        
        // 同じ日付のデータなら読み込む
        if (data.date === today) {
            attemptCount = data.attemptCount;
            
            // 前回の結果に応じて画面を復元
            if (data.lastResult === 'win') {
                // 大当たりの場合
                showWinResult(true); // 紙吹雪なしで表示
            } else if (attemptCount > 0 && attemptCount < TOTAL_ATTEMPTS) {
                // ハズレで、まだ挑戦可能な場合
                showLoseResult();
                // もう一回挑戦ボタンを表示
                retryButton.style.display = 'inline-block';
                // おみくじを引くボタンは非表示のまま
                drawButton.style.display = 'none';
            } else if (attemptCount === 0) {
                // まだ一度も引いていない場合
                drawButton.style.display = 'inline-block';
                drawButton.disabled = false;
                resultArea.style.display = 'none';
            }
        } else {
            // 日付が違う場合はリセット
            resetData();
            drawButton.style.display = 'inline-block';
            drawButton.disabled = false;
            resultArea.style.display = 'none';
        }
    } else {
        // データがない場合は初期状態
        drawButton.style.display = 'inline-block';
        drawButton.disabled = false;
        resultArea.style.display = 'none';
    }
}

// データリセット関数
function resetData() {
    attemptCount = 0;
    localStorage.removeItem('birthdayOmikuji');
}

// 表示更新関数
function updateDisplay() {
    const remaining = TOTAL_ATTEMPTS - attemptCount;
    remainingCount.textContent = remaining;
    
    // 全て使い切った場合のみボタンを完全に無効化
    if (remaining === 0 && attemptCount === TOTAL_ATTEMPTS) {
        drawButton.disabled = true;
        drawButton.style.display = 'none';
    }
}

// 結果を表示する関数
function showResult() {
    resultArea.style.display = 'block';
    
    // 3回目は必ず大当たり
    if (attemptCount === TOTAL_ATTEMPTS) {
        // 大当たりの処理
        showWinResult(false); // 紙吹雪あり
    } else {
        // ハズレの処理
        showLoseResult();
    }
}

// ハズレの結果を表示
function showLoseResult() {
    resultMessage.textContent = 'ザンネン😞';
    resultMessage.className = 'result-message lose';
    
    // もう一回挑戦ボタンを表示
    retryButton.style.display = 'inline-block';
    giftButton.style.display = 'none';
    
    // おみくじを引くボタンを非表示
    drawButton.style.display = 'none';
}

// 大当たりの結果を表示
function showWinResult(isFromCache = false) {
    resultMessage.innerHTML = '大当たり！🎉<br>お誕生日おめでとう！！！<br>素敵な28歳をお過ごしください！';
    resultMessage.className = 'result-message win';
    
    // プレゼント受け取りボタンを表示
    retryButton.style.display = 'none';
    giftButton.style.display = 'inline-block';
    
    // おみくじを引くボタンを非表示
    drawButton.style.display = 'none';
    
    // リロード後でなければ紙吹雪を表示
    if (!isFromCache) {
        createConfetti();
    }
    
    // 結果表示エリアを表示
    resultArea.style.display = 'block';
}

// 残り回数を更新する関数
function updateRemainingCount() {
    const remaining = TOTAL_ATTEMPTS - attemptCount;
    remainingCount.textContent = remaining;
    
    // 残り回数が0になったらボタンを無効化
    if (remaining === 0) {
        drawButton.disabled = true;
    }
}

// 紙吹雪を作成する関数
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45aaf2', '#f9ca24', '#ff6b6b', '#a55eea', '#26de81'];
    
    // 左側からのクラッカー
    for (let i = 0; i < 80; i++) {
        createConfettiPiece('left', colors, i);
    }
    
    // 右側からのクラッカー
    for (let i = 0; i < 80; i++) {
        createConfettiPiece('right', colors, i);
    }
    
    // 上から降ってくる紙吹雪
    for (let i = 0; i < 60; i++) {
        createConfettiPiece('top', colors, i);
    }
}

// 個別の紙吹雪を作成する関数
function createConfettiPiece(direction, colors, index) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // サイズのバリエーション
    const size = Math.random() * 15 + 5;
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';
    
    // 形のバリエーション（丸か四角）
    if (Math.random() > 0.5) {
        confetti.style.borderRadius = '50%';
    }
    
    // 初期位置と動きを設定
    if (direction === 'left') {
        confetti.style.left = '-10px';
        confetti.style.top = Math.random() * 100 + 'vh';
        confetti.style.animation = `shootFromLeft ${Math.random() * 2 + 1}s ease-out forwards`;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
    } else if (direction === 'right') {
        confetti.style.right = '-10px';
        confetti.style.top = Math.random() * 100 + 'vh';
        confetti.style.animation = `shootFromRight ${Math.random() * 2 + 1}s ease-out forwards`;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
    } else {
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.animation = `fallFromTop ${Math.random() * 3 + 2}s linear forwards`;
        confetti.style.animationDelay = Math.random() * 1 + 's';
    }
    
    confettiContainer.appendChild(confetti);
    
    // アニメーション終了後に削除
    confetti.addEventListener('animationend', function() {
        confetti.remove();
    });
}

})(); // 即時実行関数の終了