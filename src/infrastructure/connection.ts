import mysql from 'mysql2/promise';

export const connectMySql = async () => {
  return await mysql.createConnection({
    host: 'localhost',
    database: 'reversi',
    user: 'reversi',
    password: 'password',
  });
};
