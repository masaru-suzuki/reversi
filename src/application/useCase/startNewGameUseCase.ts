import { TurnRepository } from '../../domain/model/turn/turnRepository';
import { GameRepository } from '../../domain/model/game/gameRepository';
import { connectMySql } from '../../infrastructure/connection';
import { firstTurn } from '../../domain/model/turn/turn';
import { Game } from '../../domain/model/game/game';
import { ApplicationError } from '../error/applicationError';

// TurnMySQLRepositoryをインスタンス化しているので、サービスクラスがinfrastructure層に依存していることとなる
// 解決策として、Dependency Injectionを使う
// 依存性の注入とは、クラスの外部から依存するオブジェクトを渡すことで、クラス内部で依存オブジェクトを生成しないようにすること
// connectMySqlはinfrastructure層に依存しているが、リポジトリへのconnectMySql依存は解消できている
// GameServiceのデータの参照先が変わったとしても、GameServiceのコードは変更する必要がない
// 依存性の注入を行うことで、コードの変更に強いコードを書くことができる

export class StartNewGameUseCase {
  constructor(private _turnRepository: TurnRepository, private _gameRepository: GameRepository) {}
  async run() {
    const now = new Date();
    const conn = await connectMySql();

    try {
      await conn.beginTransaction();

      // 新しいゲームの作成
      const newGame = new Game(undefined, now);

      const game = await this._gameRepository.save(conn, newGame);

      if (!game) throw new ApplicationError('LatestGameNotFound', 'Latest game not found');
      if (!game.id) throw new Error('game.id not exists');

      // ターンの初期化
      const turn = firstTurn(game.id, now);

      // ターンの保存
      await this._turnRepository.save(conn, turn);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}
