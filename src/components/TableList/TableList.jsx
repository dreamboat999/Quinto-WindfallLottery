import { useState } from 'react';
import style from './tableList.module.scss';

const TableList = ({ tblList, setCurTable, exec, setResults }) => {
  const [activeItem, setActiveItem] = useState('');
  let tableList = [];

  if (tblList.length) if ('values' in tblList[0]) tableList = tblList[0].values;

  const handleClick = (table) => {
    setCurTable(table);
    setResults(exec(`select * from ${table}`));
    setActiveItem(table);
  };
  return (
    <ul className={style.tableList}>
      {tableList.map((table, i) => (
        <li
          key={i}
          value={table}
          onClick={() => handleClick(table)}
          className={`${activeItem === table ? 'active' : ''}`}>
          {table}
        </li>
      ))}
    </ul>
  );
};

export default TableList;
