import { useState } from 'react';
import ResultsTable from 'components/ResultTable';
import TableList from 'components/TableList';
import validateJson from 'utils/validateJson.js';
import styles from './sqlRepl.module.scss';
/**
 * A simple SQL read-eval-print-loop
 * @param {{db: import("sql.js").Database}} props
 */

const SQLRepl = ({ db }) => {
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [tblList, setTblList] = useState([]);
  const [curTable, setCurTable] = useState();

  const exec = (sql) => {
    let results;
    try {
      results = db.exec(sql); // an array of objects is returned
      setError(null);
    } catch (err) {
      setError(err);
      results = [];
    }
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
    const ws = new WebSocket('wss://qa.quinto.games');
    const apiCall = {
      method: 'open_session',
    };
    ws.onopen = (event) => {
      console.log('WS OPENED');
      ws.send(JSON.stringify(apiCall));
    };

    ws.onmessage = function (event) {
      console.log('WS MESSAGE');
      const json = JSON.parse(event.data);
      try {
        // console.log(json);
        const resultSQL = validateJson(json);
        console.log(resultSQL);
        exec(resultSQL);
      } catch (err) {
        console.log(err);
      }
    };
  };

  return (
    <div className={styles.sqlRepl}>
      <div className='container'>
        <h1>Quinto Games</h1>
        <header>
          <textarea
            onChange={handleChange}
            placeholder='Enter some SQL. No inspiration ? Try “select sqlite_version()”'
          ></textarea>
          <button onClick={handleLoadDB} className='filled'>
            Load DB
          </button>
          <button onClick={handleConnect} className='filled'>
            Connect Server
          </button>
        </header>
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
