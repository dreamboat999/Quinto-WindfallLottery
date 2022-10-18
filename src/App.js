import React, { useState, useEffect } from 'react';
import initSqlJs from 'sql.js';
import SQLRepl from 'pages/SQLRepl/';
import { GridLoader } from 'react-spinners';
import sqlWasm from '!!file-loader?name=sql-wasm-[contenthash].wasm!sql.js/dist/sql-wasm.wasm';
import 'styles/global.scss';

export default function App() {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);

  useEffect(async () => {
    try {
      const SQL = await initSqlJs({ locateFile: () => sqlWasm });
      fetch('./LotteryTest.db').then(async (res) => {
        const db = new SQL.Database(new Uint8Array(await res.arrayBuffer()));
        setDb(db);
      });
    } catch (err) {
      console.log(err);
      setError(err);
    }
  }, []);

  return (
    <div className='App'>
      {error && '<pre>{error.toString()}</pre>'}
      {!db && (
        <div className='spinner'>
          <GridLoader color='#03b3ff' />
        </div>
      )}
      <SQLRepl db={db} />
    </div>
  );
}
