import style from './resultTable.module.scss';
/**
 * Renders a single value of the array returned by db.exec(...) as a table
 * @param {import("sql.js").QueryExecResult} props
 */
const ResultsTable = ({ columns, values }) => {
  return (
    <div
      style={{ overflow: 'auto', height: '560px' }}
      className='scroll scroll--simple'
    >
      <table className={style.resultTable}>
        <thead>
          <tr>
            {columns.map((columnName, i) => (
              <th key={i}>{columnName}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {values.length ? (
            values.map((row, i) => (
              <tr key={i}>
                {row.map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))
          ) : (
            <h3>No results</h3>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
