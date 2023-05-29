console.log('Hello JavaScirpt');

const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const boardElement = document.getElementById('board');

const showBoard = async () => {
  const turnCount = 0;
  const response = await fetch(`/api/games/latest/turns/${turnCount}`);
  const boardResponse = await response.json();
  // なぜ、awaitをつけるのか？
  // なぜ、awaitをつけないと、boardResponseがPromiseオブジェクトになるのか？
  // Answer: fetchはPromiseを返すため、awaitをつけないと、Promiseオブジェクトが返ってくる。
  const board = boardResponse.board;

  board.forEach((line) => {
    line.forEach((square) => {
      // <div class="square"></div>
      const squareElement = document.createElement('div');
      squareElement.classList.add('square');

      if (square !== EMPTY) {
        // <div class="square dark"></div>
        const stoneElement = document.createElement('div');
        stoneElement.className = `stone ${square === DARK ? 'dark' : 'light'}`;

        squareElement.appendChild(stoneElement);
      }

      boardElement.appendChild(squareElement);
    });
  });
};

const registerGame = async () => {
  await fetch('/api/games', {
    method: 'POST',
  });
};

const main = async () => {
  await registerGame();
  await showBoard();
};

main();
