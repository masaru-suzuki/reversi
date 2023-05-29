# API 設計メモ

## 対戦を開始する

「対戦」を登録する

POST /api/games

## 現在の盤面を表示する

指定したターン数の「ターン」を取得する=>最新のターンを取得する

GET /api/games/latest/turns/{turnCount}

レスポンスボディ

```json
{
  "turnCont": 1,
  "board": [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  "nextDisc": 1,
  "winnerDisc": 1
}
```

## 石を打つ

ターンを登録する

レスポンスボディ

```json
{
  "turnCont": 1,
  "move": {
    "x": 0,
    "y": 0
  }
}
```

## 自分の対戦結果を表示する

「対戦の一覧を取得する」

GET /api/games

レスポンスボディ

```json
{
  "games": [
    {
      "id": 1,
      "winnerDisc": 1,
      "startedAt": "YYYY-MM-DD hh:mm:ss"
    },
    {
      "id": 2,
      "winnerDisc": 0,
      "startedAt": "YYYY-MM-DD hh:mm:ss"
    }
  ]
}
```
