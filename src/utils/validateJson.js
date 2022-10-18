export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function sqlValueBuilder(data) {
  let keyArray = [],
    valueArray = [];
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const element = data[key];
      keyArray.push(key);
      valueArray.push(`'${element}'`);
    }
  }

  return [keyArray, valueArray];
}

function getKeys(record, primaryKeyList, table_name) {
  if (primaryKeyList.length == 0) return;
  for (const primaryKey of primaryKeyList) {
    if (primaryKey[table_name] != undefined) {
      return {
        value: record[primaryKey[table_name][0][0]],
        key: primaryKey[table_name][0][0],
      };
    }
  }
}

function getAllKeys(record, primaryKeyList, table_name) {
  let allKeys = [];
  let keyArray = [],
    valueArray = [];
  if (primaryKeyList.length == 0) return;
  for (const primaryKey of primaryKeyList) {
    if (primaryKey[table_name] != undefined) {
      for (const key of primaryKey[table_name]) {
        keyArray.push(key[0]);
        valueArray.push(record[key[0]]);
      }
    }
  }
  return [keyArray, valueArray];
}

export function validateJson(json, primaryKeyList) {
  if (!json.hasOwnProperty('result')) return 'No result key in the data';
  let resultSQL = [];
  let data = json.result;
  for (let x of data) {
    let sqlStr = '';
    switch (x.mode) {
      case 'INSERT':
        sqlStr += 'INSERT INTO';
        break;
      case 'UPDATE':
        sqlStr += 'UPDATE';
        break;
      case 'MERGE':
        sqlStr += 'INSERT INTO';
        break;
      case 'DELETE':
        break;
      case 'REMOVE':
        sqlStr += 'DELETE FROM';
        break;
    }
    let table_name = Object.keys(x).filter((item) => {
      if (item !== '_location_' && item !== 'mode') return true;
      else return false;
    })[0];

    sqlStr += ` ${table_name} `;
    if (x.mode === 'INSERT') {
      if (Array.isArray(x[table_name])) {
        let tempStr = '';
        for (let y of x[table_name]) {
          tempStr += sqlStr;
          tempStr += `(${sqlValueBuilder(y)[0].join(',')}) VALUES `;
          tempStr += `(${sqlValueBuilder(y)[1].join(',')});`;
        }
        sqlStr = tempStr;
      } else {
        sqlStr += `(${sqlValueBuilder(x[table_name])[0].join(',')}) VALUES `;
        sqlStr += `(${sqlValueBuilder(x[table_name])[1].join(',')});`;
      }
    } else if (x.mode === 'UPDATE') {
      sqlStr += 'SET ';
      if (Array.isArray(x[table_name])) {
        let tempStr = '';
        for (let y of x[table_name]) {
          let tempStr1 = sqlStr;

          console.log(tempStr);
          let keys = getKeys(y, primaryKeyList, table_name);
          if (keys == undefined) return;
          for (let i = 0; i < sqlValueBuilder(y)[0].length; i++) {
            if (sqlValueBuilder(y)[0][i] == keys.key) continue;
            tempStr1 += `${sqlValueBuilder(y)[0][i]} = ${
              sqlValueBuilder(y)[1][i]
            } `;
          }
          tempStr1 += 'WHERE ';
          tempStr1 += `${keys.key} = '${keys.value}';\n`;
          tempStr += tempStr1;
        }
        sqlStr = tempStr;
      } else {
        let keys = getKeys(x[table_name], primaryKeyList, table_name);

        for (let i = 0; i < sqlValueBuilder(x[table_name])[0].length; i++) {
          if (sqlValueBuilder(x[table_name])[0][i] == keys.key) continue;
          sqlStr += `${sqlValueBuilder(x[table_name])[0][i]} = ${
            sqlValueBuilder(x[table_name])[1][i]
          }, `;
        }
        sqlStr = sqlStr.slice(0, -2);
        sqlStr += ' WHERE ';
        sqlStr += `${keys.key} = '${keys.value}';\n`;
      }
    } else if (x.mode === 'MERGE') {
      if (Array.isArray(x[table_name])) {
        let tempStr = '';
        for (let y of x[table_name]) {
          tempStr += sqlStr;
          tempStr += `(${sqlValueBuilder(y)[0].join(',')}) VALUES `;
          tempStr += `(${sqlValueBuilder(y)[1].join(',')}) ON CONFLICT(`;
          let keys = getAllKeys(y, primaryKeyList, table_name);
          tempStr += keys[0].join(',') + ') DO UPDATE SET ';
          for (let key of keys[0]) {
            tempStr += `${key}=EXCLUDED.${key},`;
          }
          tempStr = tempStr.slice(0, -1) + ';\n';
        }
        sqlStr = tempStr;
      } else {
        sqlStr += `(${sqlValueBuilder(x[table_name])[0].join(',')}) VALUES `;
        sqlStr += `(${sqlValueBuilder(x[table_name])[1].join(
          ','
        )}) ON CONFLICT(`;

        let keys = getAllKeys(y, primaryKeyList, table_name);
        sqlStr += keys[0].join(',') + ') DO UPDATE SET ';
        for (let key of keys[0]) {
          sqlStr += `${key}=EXCLUDED.${key},`;
        }
        sqlStr = sqlStr.slice(0, -1) + ';\n';
      }
    } else if (x.mode === 'REMOVE') {
      sqlStr += 'WHERE ';
      if (Array.isArray(x[table_name])) {
        let tempStr = '';
        for (let y of x[table_name]) {
          tempStr += sqlStr;
          for (let i = 0; i < sqlValueBuilder(y)[0].length; i++) {
            tempStr += `${sqlValueBuilder(y)[0][i]} = ${
              sqlValueBuilder(y)[1][i]
            } AND `;
          }
          tempStr = tempStr.slice(0, -5) + ';\n';
        }
        sqlStr = tempStr;
      } else {
        for (let i = 0; i < sqlValueBuilder(x[table_name])[0].length; i++) {
          sqlStr += `${sqlValueBuilder(x[table_name])[0][i]} = ${
            sqlValueBuilder(x[table_name])[1][i]
          } AND `;
        }
        sqlStr = sqlStr.slice(0, -5) + ';\n';
      }
    }
    // console.log(sqlStr);
    resultSQL.push(sqlStr);
  }
  return resultSQL;
}
