console.log('Hello JavaScirpt');

const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const WINNER_DRAW = 0;
const WINNER_DARK = 1;
const WINNER_LIGHT = 2;

const boardElement = document.getElementById('board');
const nextDiscElement = document.getElementById('next-disc-message');
const warningMessageElement = document.getElementById('warning-message');

const showBoard = async (turnCount, previousDisc) => {
  const response = await fetch(`/api/games/latest/turns/${turnCount}`);
  const responseBody = await response.json();
  // なぜ、awaitをつけるのか？
  // なぜ、awaitをつけないと、responseBodyがPromiseオブジェクトになるのか？
  // Answer: fetchはPromiseを返すため、awaitをつけないと、Promiseオブジェクトが返ってくる。
  const board = responseBody.board;
  const nextDisc = responseBody.nextDisc;
  const winnerDisc = responseBody.winnerDisc;
  // turnCount = responseBody.turnCount;

  showWarningMessage(previousDisc, nextDisc, winnerDisc);

  showNextDiscMessage(nextDisc);

  // 版を初期化
  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }

  board.forEach((line, y) => {
    line.forEach((square, x) => {
      // <div class="square"></div>
      const squareElement = document.createElement('div');
      squareElement.classList.add('square');

      if (square !== EMPTY) {
        // <div class="square dark"></div>
        const stoneElement = document.createElement('div');
        stoneElement.className = `stone ${square === DARK ? 'dark' : 'light'}`;

        squareElement.appendChild(stoneElement);
      } else {
        squareElement.addEventListener('click', async () => {
          const nextTurnCount = turnCount + 1;
          const registerTurnResponse = await registerTurn(nextTurnCount, nextDisc, x, y);

          if (registerTurnResponse.ok) {
            // なぜ、awaitをつけるのか？
            await showBoard(nextTurnCount, nextDisc);
          }
        });
      }

      boardElement.appendChild(squareElement);
    });
  });
};

const discToString = (disc) => (disc === DARK ? '黒' : '白');

const showWarningMessage = (previousDisc, nextDisc, winnerDisc) => {
  const message = warningMessage(previousDisc, nextDisc, winnerDisc);

  warningMessageElement.textContent = message;

  if (message === null) {
    warningMessageElement.style.display = 'none';
  } else {
    warningMessageElement.style.display = 'block';
  }
};

const warningMessage = (previousDisc, nextDisc, winnerDisc) => {
  if (nextDisc !== null) {
    if (previousDisc === nextDisc) {
      const skippedDisc = nextDisc === DARK ? LIGHT : DARK;
      return `${discToString(skippedDisc)}の番はスキップです`;
    } else {
      return null;
    }
  } else {
    if (winnerDisc === WINNER_DRAW) {
      return '引き分けです';
    } else {
      return `${discToString(winnerDisc)}の勝ちです`;
    }
  }
};

const showNextDiscMessage = (nextDisc) => {
  if (nextDisc) {
    nextDiscElement.textContent = `次は${discToString(nextDisc)}の番です`;
  } else {
    nextDiscElement.textContent = '';
  }
};

const registerGame = async () => {
  await fetch('/api/games', {
    method: 'POST',
  });
};

async function registerTurn(turnCount, disc, x, y) {
  const requestBody = {
    turnCount,
    move: {
      disc,
      x,
      y,
    },
  };

  return await fetch('/api/games/latest/turns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
}

const main = async () => {
  await registerGame();
  await showBoard(0);
};

main();
