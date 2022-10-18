import { useEffect, useRef, useState } from 'react';
import { GridLoader } from 'react-spinners';
import ResultsTable from 'components/ResultTable';
import TableList from 'components/TableList';
import ConnectionStatus from 'components/ConnectionStatus';
import { validateJson, isJson } from 'utils/validateJson.js';
import testJson1 from 'utils/test1.json';
import styles from './sqlRepl.module.scss';
/**
 * A simple SQL read-eval-print-loop
 * @param {{db: import("sql.js").Database}} props
 */

const ws = new WebSocket('wss://qa.quinto.games');
var primaryKeyList = [];
const SQLRepl = ({ db }) => {
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [reqMsg, setReqMsg] = useState('');
  const [tblList, setTblList] = useState([]);
  const [curTable, setCurTable] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(3);

  const exec = (sql) => {
    let results;
    try {
      results = db.exec(sql);
      setError(null);
    } catch (err) {
      setError(err);
      results = [];
    }
    return results;
  };
  useEffect(() => {
    getPrimaryKeys();
  }, [tblList]);
  const handleLoadDB = () => {
    setTblList(
      exec(
        "SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';"
      )
    );
    const initApiCall = { method: 'open_session' };
    setTimeout(() => ws.send(JSON.stringify(initApiCall)), 500);
  };

  const getPrimaryKeys = () => {
    if (!tblList.length || !db) return;

    for (let tbl of tblList[0].values) {
      const res = db.exec(`SELECT DISTINCT ii.name AS 'indexed-columns'
      FROM sqlite_schema AS m, pragma_index_list(m.name) AS il, pragma_index_info(il.name) AS ii
      WHERE m.type='table' and m.name = '${tbl[0]}' order by 1;`);
      const object = {};
      Object.defineProperty(object, `${tbl[0]}`, { value: res[0].values });
      primaryKeyList.push(object);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'sql-query') setResults(exec(e.target.value));
    if (e.target.name === 'request-message') setReqMsg(e.target.value);
  };

  const handleConnect = () => {
    setIsLoading(true);
    // const apiCall = { method: 'open_session' };
    ws.send(reqMsg);
  };

  const handleForceUpdate = async () => {
    try {
      const resultSQL = validateJson(testJson1, primaryKeyList);
      for (let item of resultSQL) await db.exec(item);
    } catch (err) {
      console.log(err);
    }
    setResults(exec(`SELECT * from ${curTable}`));
  };
  const handleDisconnect = () => {
    ws.close();
    setConnected(ws.readyState);
  };
  ws.onopen = (event) => {
    setConnected(ws.readyState);
  };
  ws.onmessage = async function (event) {
    setConnected(ws.readyState);
    if (!isJson(event.data)) {
      setError(event.data);
      setIsLoading(false);
      return;
    }
    const json = JSON.parse(event.data);
    if (!json.hasOwnProperty('result')) {
      setIsLoading(false);
      return;
    }
    console.log(json);
    try {
      const resultSQL = validateJson(json, primaryKeyList);
      if (db) {
        for (let item of resultSQL) await db.exec(item);
        setResults(exec(`SELECT * from ${curTable}`));
      }
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };
  ws.onerror = (event) => {
    setConnected(ws.readyState);
  };
  ws.onclose = (event) => {
    setConnected(ws.readyState);
  };
  return (
    <div className={styles.sqlRepl}>
      <div className='container'>
        <h1>Quinto Games</h1>
        <header>
          <textarea
            onChange={handleChange}
            name='sql-query'
            placeholder='Enter some SQL query. Ex: “select sqlite_version()”'
          ></textarea>

          <button onClick={handleLoadDB} className='filled'>
            Load Schema
          </button>
          <button
            onClick={handleConnect}
            className='filled'
            disabled={connected !== 1}
          >
            Send request
          </button>
          <button
            onClick={handleDisconnect}
            className='filled'
            disabled={connected !== 1}
          >
            Disconnect
          </button>

          <ConnectionStatus readyState={connected} />
          <textarea
            onChange={handleChange}
            name='request-message'
            placeholder='Enter messages to send request to the server'
            value={reqMsg}
          ></textarea>
        </header>
        {isLoading && (
          <div className='spinner'>
            <GridLoader color='#03b3ff' />
          </div>
        )}
        <pre className='error'>{(error || '').toString()}</pre>
        <main>
          {tblList.length ? (
            <TableList
              tblList={tblList}
              setCurTable={setCurTable}
              exec={exec}
              setResults={setResults}
            />
          ) : (
            <></>
          )}
          {results.map(({ columns, values }, i) => (
            <ResultsTable key={i} columns={columns} values={values} />
          ))}
        </main>
      </div>
    </div>
  );
};

export default SQLRepl;
