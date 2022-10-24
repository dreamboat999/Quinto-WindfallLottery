import { useEffect, useState } from 'react';
import { HashLoader } from 'react-spinners';
import ResultsTable from 'components/ResultTable';
import TableList from 'components/TableList';
import ConnectionStatus from 'components/ConnectionStatus';
import { validateJson, isJson } from 'utils/validateJson.js';
import styles from './home.module.scss';
const ws = new WebSocket('wss://qa.quinto.games');
var primaryKeyList = [];

const Logo = () => {
  return <img src='assets/imgs/logo.png' style={{ width: '170px' }} alt='logo' />;
};

const GoldCup = () => {
  return (
    <img
      src='assets/imgs/gold-cup.png'
      style={{ position: 'absolute', width: '20rem', left: '0px', bottom: '0px', zIndex: '-1' }}
      alt='goldcup'
    />
  );
};

const Rocket = () => {
  return (
    <img
      src='assets/imgs/rocket.png'
      style={{ position: 'absolute', width: '20rem', right: '0px', bottom: '0px', zIndex: '-1' }}
      alt='rocket'
    />
  );
};
const SearhIcon = () => {
  return <img src='assets/imgs/icon-search.svg' alt='search' />;
};
const SendIcon = () => {
  return <img src='assets/imgs/icon-send.svg' alt='send' />;
};
const Home = ({ db }) => {
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
    if (reqMsg) ws.send(reqMsg);
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
    <div className={styles.home}>
      <header style={{ backgroundImage: 'url(/assets/imgs/bg-pattern-header.svg)' }}>
        <div className='header-content'>
          <Logo />
          <ConnectionStatus readyState={connected} />
        </div>
      </header>

      {isLoading && (
        <div className='spinner'>
          <HashLoader color='#03b3ff' />
        </div>
      )}

      <main>
        <div className='container'>
          <div className='top-menu'>
            <div className='input-control'>
              <SearhIcon />
              <input
                onChange={handleChange}
                name='sql-query'
                placeholder='Enter some SQL query. Ex: “select sqlite_version()”'
                spellCheck='false'></input>
            </div>
            <div className='input-control'>
              <SendIcon />
              <input
                onChange={handleChange}
                name='request-message'
                placeholder='Enter messages to send request to the server'
                spellCheck='false'
                value={reqMsg}
              />
            </div>

            <div className='button-group'>
              <button onClick={handleLoadDB} className='filled' disabled={isDBLoaded === true}>
                Load Schema
              </button>
              <button onClick={handleSendReqest} className='filled' disabled={connected !== 1}>
                Send Request
              </button>
              <button onClick={handleDisconnect} className='filled' disabled={connected !== 1}>
                Disconnect
              </button>
            </div>
          </div>
          <pre className='error'>{(error || '').toString()}</pre>
          <section>
            {tblList.length ? (
              <TableList tblList={tblList} setCurTable={setCurTable} exec={exec} setResults={setResults} />
            ) : (
              <></>
            )}
            {results.map(({ columns, values }, i) => (
              <ResultsTable key={i} columns={columns} values={values} />
            ))}
          </section>
        </div>
      </main>
      <GoldCup />
      <Rocket />
    </div>
  );
};

export default Home;
