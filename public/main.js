console.log('Hello JavaScirpt');

const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const boardElement = document.getElementById('board');
const nextDiscElement = document.getElementById('next-disc-message');

const showBoard = async (turnCount) => {
  const response = await fetch(`/api/games/latest/turns/${turnCount}`);
  const responseBody = await response.json();
  // なぜ、awaitをつけるのか？
  // なぜ、awaitをつけないと、responseBodyがPromiseオブジェクトになるのか？
  // Answer: fetchはPromiseを返すため、awaitをつけないと、Promiseオブジェクトが返ってくる。
  const board = responseBody.board;
  const nextDisc = responseBody.nextDisc;
  // turnCount = responseBody.turnCount;

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
            await showBoard(nextTurnCount);
          }
        });
      }

      boardElement.appendChild(squareElement);
    });
  });
};

const showNextDiscMessage = (nextDisc) => {
  if (nextDisc) {
    const color = nextDisc === DARK ? '黒' : '白';
    nextDiscElement.textContent = `次は${color}の番です`;
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
