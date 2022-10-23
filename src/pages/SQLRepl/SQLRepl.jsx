import { useEffect, useRef, useState } from 'react';
import { HashLoader } from 'react-spinners';
import ResultsTable from 'components/ResultTable';
import TableList from 'components/TableList';
import ConnectionStatus from 'components/ConnectionStatus';
import { validateJson, isJson } from 'utils/validateJson.js';
import testJson from 'utils/test.json';
import styles from './sqlRepl.module.scss';
/**
 * A simple SQL read-eval-print-loop
 * @param {{db: import("sql.js").Database}} props
 */

const ws = new WebSocket('wss://qa.quinto.games');
var primaryKeyList = [];
const Logo = () => {
  return <img src='assets/imgs/logo.png' alt='logo' style={{ width: '150px' }} />;
};
const GoldCup = () => {
  return (
    <img
      src='assets/imgs/goldcup.png'
      style={{ position: 'absolute', width: '20vh', left: '0px', bottom: '0px', zIndex: '-1' }}
      alt='goldcup'
    />
  );
};
const Rocket = () => {
  return (
    <img
      src='assets/imgs/rocket.png'
      style={{ position: 'absolute', width: '50vh', right: '0px', bottom: '0px', zIndex: '-1' }}
      alt='rocket'
    />
  );
};
const SQLRepl = ({ db }) => {
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [reqMsg, setReqMsg] = useState('');
  const [tblList, setTblList] = useState([]);
  const [curTable, setCurTable] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(3);
  const [isDBLoaded, setIsDBLoaded] = useState(false);

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
    // handleTest();
  }, [tblList]);
  const handleLoadDB = () => {
    setIsLoading(true);

    setTblList(exec("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';"));
    const initApiCall = { method: 'open_session' };
    setTimeout(() => {
      ws.send(JSON.stringify(initApiCall));
    }, 500);
    setIsDBLoaded(true);
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

  const handleSendReqest = () => {
    // const apiCall = { method: 'open_session' };
    if (reqMsg) ws.send(reqMsg);
  };

  const handleTest = async () => {
    try {
      const resultSQL = validateJson(testJson, primaryKeyList);
      for (let item of resultSQL) await db.exec(item);
      console.log(resultSQL);
    } catch (err) {
      console.log(err);
    }
    // setResults(exec(`SELECT * from ${curTable}`));
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
    // console.log(event.data);
    console.log(json);
    try {
      const resultSQL = validateJson(json, primaryKeyList);
      console.log(resultSQL);
      if (db) {
        for (let item of resultSQL) {
          try {
            await db.exec(item);
          } catch (error) {
            console.log(item);
            console.log(error);
          }
        }
        curTable && setResults(exec(`SELECT * from ${curTable}`));
      }
    } catch (err) {
      console.log(json);
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
        <header>
          <Logo />
          <ConnectionStatus readyState={connected} />
          <div className='top-menu'>
            <textarea
              onChange={handleChange}
              name='sql-query'
              placeholder='Enter some SQL query. Ex: “select sqlite_version()”'
            />
            <div className='button-group'>
              <button onClick={handleLoadDB} className='filled' disabled={isDBLoaded === true}>
                Load Schema
              </button>
              <button onClick={handleSendReqest} className='filled' disabled={connected !== 1}>
                Send request
              </button>
              <button onClick={handleDisconnect} className='filled' disabled={connected !== 1}>
                Disconnect
              </button>
            </div>
          </div>
          <textarea
            onChange={handleChange}
            name='request-message'
            placeholder='Enter messages to send request to the server'
            value={reqMsg}
          />
        </header>

        {isLoading && (
          <div className='spinner'>
            <HashLoader color='#03b3ff' />
          </div>
        )}
        <pre className='error'>{(error || '').toString()}</pre>
        <main>
          {tblList.length ? (
            <TableList tblList={tblList} setCurTable={setCurTable} exec={exec} setResults={setResults} />
          ) : (
            <></>
          )}
          {results.map(({ columns, values }, i) => (
            <ResultsTable key={i} columns={columns} values={values} />
          ))}
        </main>
      </div>
      <Rocket />
    </div>
  );
};

export default SQLRepl;
