const gamesTableBodyElement = document.getElementById('games-table-body');

const showGames = async () => {
  const response = await fetch('/api/games');
  const responseBody = await response.json();
  const games = responseBody.games;

  while (gamesTableBodyElement.firstChild) {
    gamesTableBodyElement.removeChild(gamesTableBodyElement.firstChild);
  }

  games.forEach((game) => {
    const trElement = document.createElement('tr');

    const appendTdElement = (text) => {
      const tdElement = document.createElement('td');
      tdElement.textContent = text;
      trElement.appendChild(tdElement);
    };

    appendTdElement(game.darkMoveCount);
    appendTdElement(game.lightMoveCount);
    appendTdElement(game.winnerDisc);
    appendTdElement(game.startedAt);
    appendTdElement(game.endAt);

    gamesTableBodyElement.appendChild(trElement);
  });
};

showGames();
