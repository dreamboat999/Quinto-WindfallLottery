import { useEffect, useState } from 'react';
import { GridLoader } from 'react-spinners';
import ResultsTable from 'components/ResultTable';
import TableList from 'components/TableList';
import ConnectionStatus from 'components/ConnectionStatus';
import validateJson from 'utils/validateJson.js';
import styles from './sqlRepl.module.scss';
/**
 * A simple SQL read-eval-print-loop
 * @param {{db: import("sql.js").Database}} props
 */

const ws = new WebSocket('wss://qa.quinto.games');

const SQLRepl = ({ db }) => {
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [tblList, setTblList] = useState([]);
  const [curTable, setCurTable] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(3);

  const exec = (sql) => {
    let results;
    try {
      results = db.exec(sql); // an array of objects is returned
      setError(null);
    } catch (err) {
      setError(err);
      results = [];
    }
    console.log(results);
    return results;
  };
  const handleLoadDB = () => {
    setTblList(
      exec(
        "SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';"
      )
    );
  };

  const handleChange = (e) => {
    setResults(exec(e.target.value));
    console.log(results);
  };

  const handleConnect = () => {
    setIsLoading(true);
    const apiCall = {
      method: 'open_session',
    };
    ws.send(JSON.stringify(apiCall));
  };
  const handleDisconnect = () => {
    ws.close();
    setConnected(ws.readyState);
  };
  ws.onopen = (event) => {
    console.log('WS OPENED');
    setConnected(ws.readyState);
  };
  ws.onmessage = async function (event) {
    console.log('WS MESSAGE');
    setConnected(ws.readyState);
    const json = JSON.parse(event.data);
    try {
      // console.log(json);
      const resultSQL = validateJson(json);
      console.log(resultSQL);
      for (let item of resultSQL) await db.exec(item);
      const binaryArray = db.export();
      console.log(binaryArray);
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
