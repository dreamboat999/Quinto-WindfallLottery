import { useEffect, useState } from 'react';
import { GoogleLogin } from 'react-google-login';
import { HashLoader } from 'react-spinners';
import ResultsTable from 'components/ResultTable';
import TableList from 'components/TableList';
import ConnectionStatus from 'components/ConnectionStatus';
import { validateJson, isJson } from 'utils/validateJson.js';
import { MainLayout } from 'layouts/MainLayout';
import styles from './home.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { setConnectedStatus } from 'slices/quintoSlices';
const ws = new WebSocket('wss://qa.quinto.games');
var primaryKeyList = [];

const Home = ({ db }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [reqMsg, setReqMsg] = useState('');
  const [tblList, setTblList] = useState([]);
  const [curTable, setCurTable] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isDBLoaded, setIsDBLoaded] = useState(false);
  const connected = useSelector((state) => state.quintoSlices.connected);
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
    setTblList(
      exec(
        "SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%';"
      )
    );
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
    dispatch(setConnectedStatus(ws.readyState));
  };

  ws.onopen = (event) => {
    dispatch(setConnectedStatus(ws.readyState));
  };
  ws.onmessage = async function (event) {
    dispatch(setConnectedStatus(ws.readyState));
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
    dispatch(setConnectedStatus(ws.readyState));
  };
  ws.onclose = (event) => {
    dispatch(setConnectedStatus(ws.readyState));
  };
  return (
    <MainLayout className={styles.home} title='Homepage'>
      {isLoading && (
        <div className='spinner'>
          <HashLoader color='#03b3ff' />
        </div>
      )}

      <main>
        <div className='container'>
          <div className='top-menu'>
            <div className='input-control'>
              <img src='assets/imgs/icon-search.svg' alt='search' />;
              <input
                onChange={handleChange}
                name='sql-query'
                placeholder='Enter some SQL query. Ex: “select sqlite_version()”'
                spellCheck='false'
              ></input>
            </div>
            <div className='input-control'>
              <img src='assets/imgs/icon-send.svg' alt='send' />
              <input
                onChange={handleChange}
                name='request-message'
                placeholder='Enter messages to send request to the server'
                spellCheck='false'
                value={reqMsg}
              />
            </div>

            <div className='button-group'>
              <button
                onClick={handleLoadDB}
                className='filled'
                disabled={isDBLoaded === true}
              >
                Load Schema
              </button>
              <button
                onClick={handleSendReqest}
                className='filled'
                disabled={connected !== 1}
              >
                Send Request
              </button>
              <button
                onClick={handleDisconnect}
                className='filled'
                disabled={connected !== 1}
              >
                Disconnect
              </button>
            </div>
          </div>
          <pre className='error'>{(error || '').toString()}</pre>
          <section>
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
          </section>
        </div>
      </main>
      {/* <GoldCup /> */}
      {/* <Rocket /> */}
    </MainLayout>
  );
};

export default Home;
