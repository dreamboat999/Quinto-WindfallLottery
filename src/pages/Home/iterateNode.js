/* IterateNode.js
**
** In JavaScript, objects are often represented using a notation called JSON (JavaScript Object Notation). JSON is a
** lightweight data interchange format that is easy for humans to read and write and easy for machines to parse and generate.
** 
** In this case, the IterateNode class is designed to process results that are passed to it in the form of a JSON object.
** This can be seen in the processResult method, which checks the type of the result parameter. If it is an array, the 
** method assumes that each element of the array represents a separate JSON object, and processes each of these objects 
** in turn. If the result parameter is not an array, the method assumes that it is a single JSON object and processes 
** that instead.
** 
** Inside the handleOperation method, the mode parameter is used to determine what type of operation is being performed. 
** This method expects the mode to be a string that represents the type of operation being performed, such as 'UPDATE',
** 'INSERT', 'DELETE', or 'UPSERT'. The data parameter is then used to extract the relevant information for the specified
** operation, such as the table name and the data to be inserted or updated.
** 
** Overall, the IterateNode class is designed to work with JSON objects that represent database operations, with each 
** object containing a mode property that specifies the type of operation to be performed, and a data property that 
** contains the relevant data for that operation.
*/

class IterateNode {
  constructor(db) {
    this.db = db;
    this.ws = new WebSocket('wss://qa.quinto.games');
    this.ws.addEventListener('open', this.onOpen.bind(this));
    this.ws.addEventListener('message', this.onMessage.bind(this));
    this.ws.addEventListener('close', this.onClose.bind(this));
    this.ws.addEventListener('error', this.onError.bind(this));
  }

  onOpen(event) {
    console.log('WebSocket connection established.');
    const message = {"method":"open_session","params": {}};
    this.ws.send(JSON.stringify(message));
  }

  onMessage(event) {
    console.log(`Message received: ${event.data}`);
    const json = JSON.parse(event.data);
    this.processResult(json);
  }

  onClose(event) {
    console.log('WebSocket connection closed.');
    // Your code to handle WebSocket close event
  }

  onError(event) {
    console.log(`WebSocket error: ${event.error}`);
    // Your code to handle WebSocket error event
  }
  
  async processResult(result) {
    if (Array.isArray(result)) {
      for (const obj of result) {
        const [mode, data] = Object.entries(obj)[0];
        await this.handleOperation(mode, data);
      }
    } else if (typeof result === 'object') {
      const [mode, data] = Object.entries(result)[0];
      await this.handleOperation(mode, data);
    }
  }

  async handleOperation(mode, data) {
    const tableName = Object.keys(data)[0];
  
    switch (mode.toUpperCase()) {
      case 'UPDATE':
        await this.handleUpdate(data);
        break;
      case 'INSERT':
        await this.handleInsert(data);
        break;
      case 'DELETE':
        await this.handleDelete(data);
        break;
      case 'UPSERT':
        await this.handleUpsert(data);
        break;
      default:
        throw new Error(`Invalid mode: ${mode}`);
    }
  }

  async handleUpdate(data) {
    const tableName = Object.keys(data)[0];
    const rows = Array.isArray(data[tableName]) ? data[tableName] : [data[tableName]];
    
    for (const row of rows) {
      await this.handleUpdateRow(tableName, row);
    }
  }
  
  async handleUpdateRow(tableName, row) {
    const primaryKey = this.getPrimaryKey(tableName, row);
    const existingRow = await this.getRow(tableName, primaryKey);
  
    if (!existingRow) {
      // row doesn't exist, do nothing
      return;
    }
  
    const updatedRow = { ...existingRow, ...row };
    await this.upsertRow(tableName, updatedRow);
  }
  
  async handleInsert(data) {
    const tableName = Object.keys(data)[0];
    const rows = Array.isArray(data[tableName]) ? data[tableName] : [data[tableName]];
  
    for (const row of rows) {
      await this.handleInsertRow(tableName, row);
    }
  }
  
  async handleInsertRow(tableName, row) {
    const columns = Object.keys(row);
    const values = Object.values(row);
  
    const sql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`;
    await this.db.prepare(sql).run(values);
  }
  
async handleDelete(data) {
    const tableName = Object.keys(data)[0];
    const whereClause = this.getWhereClause(tableName, data[tableName]);
  
    const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
    await this.db.prepare(sql).run();
  }

  async handleUpsert(data) {
    const tableName = Object.keys(data)[0];class IterateNode {
  constructor(db) {
    this.db = db;
  }

  async processResult(result) {
    if (Array.isArray(result)) {
      for (const obj of result) {
        const [mode, data] = Object.entries(obj)[0];
        await this.handleOperation(mode, data);
      }
    } else if (typeof result === 'object') {
      const [mode, data] = Object.entries(result)[0];
      await this.handleOperation(mode, data);
    }
  }

  async handleOperation(mode, data) {
    const tableName = Object.keys(data)[0];
  
    switch (mode.toUpperCase()) {
      case 'UPDATE':
        await this.handleUpdate(data);
        break;
      case 'INSERT':
        await this.handleInsert(data);
        break;
      case 'DELETE':
        await this.handleDelete(data);
        break;
      case 'UPSERT':
        await this.handleUpsert(data);
        break;
      default:
        throw new Error(`Invalid mode: ${mode}`);
    }
  }

  async handleUpdate(data) {
    const tableName = Object.keys(data)[0];
    const rows = Array.isArray(data[tableName]) ? data[tableName] : [data[tableName]];
    
    for (const row of rows) {
      await this.handleUpdateRow(tableName, row);
    }
  }
  
  async handleUpdateRow(tableName, row) {
    const primaryKey = this.getPrimaryKey(tableName, row);
    const existingRow = await this.getRow(tableName, primaryKey);
  
    if (!existingRow) {
      // row doesn't exist, do nothing
      return;
    }
  
    const updatedRow = { ...existingRow, ...row };
    await this.upsertRow(tableName, updatedRow);
  }
  
  async handleInsert(data) {
    const tableName = Object.keys(data)[0];
    const rows = Array.isArray(data[tableName]) ? data[tableName] : [data[tableName]];
  
    for (const row of rows) {
      await this.handleInsertRow(tableName, row);
    }
  }
  
  async handleInsertRow(tableName, row) {
    const columns = Object.keys(row);
    const values = Object.values(row);
  
    const sql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`;
    await this.db.prepare(sql).run(values);
  }
  
async handleDelete(data) {
    const tableName = Object.keys(data)[0];
    const whereClause = this.getWhereClause(tableName, data[tableName]);
  
    const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
    await this.db.prepare(sql).run();
  }

  async handleUpsert(data) {
    const tableName = Object.keys(data)[0];
    const rows = Array.isArray(data[tableName]) ? data[tableName] : [data[tableName]];
  
    for (const row of rows) {
      await this.handleUpsertRow(tableName, row);
    }
  }

  async handleUpsertRow(tableName, row) {
    const primaryKey = this.getPrimaryKey(tableName, row);
    const existingRow = await this.getRow(tableName, primaryKey);
  
    if (!existingRow) {
      await this.handleInsertRow(tableName, row);
    } else {
      const updatedRow = { ...existingRow, ...row };
      await this.upsertRow(tableName, updatedRow);
    }
  }

  async getRow(tableName, primaryKey) {
    const sql = `SELECT * FROM ${tableName} WHERE ${this.getPrimaryKeyClause(tableName)} = ?`;
    const result = await this.db.prepare(sql).get(primaryKey);
    return result;
  }

  async upsertRow(tableName, row) {
    const primaryKey = this.getPrimaryKey(tableName, row);
    const columns = Object.keys(row);
    const values = Object.values(row);
  
    const sql = `REPLACE INTO ${tableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`;
    await this.db.prepare(sql).run(values);
  }

  getPrimaryKey(tableName, row) {
    const primaryKeyColumns = this.getPrimaryKeyColumns(tableName);
    if (primaryKeyColumns.length === 1) {
      return row[primaryKeyColumns[0]];
    }
  
    return primaryKeyColumns.map(column => row[column]).join(',');
  }

  getPrimaryKeyColumns(tableName) {
    const tableSchema = this.getTableSchema(tableName);
    const primaryKey = tableSchema.find(column => column.pk);
    return primaryKey ? primaryKey.name.split(',') : [];
  }

  getPrimaryKeyClause(tableName) {
    const primaryKeyColumns = this.getPrimaryKeyColumns(tableName);
    if (primaryKeyColumns.length === 1) {
      return primaryKeyColumns[0];
    }
  
    return primaryKeyColumns.map(column => `${column} = ?`).join(' AND ');
  }

  getTableSchema(tableName) {
    const sql = `PRAGMA table_info(${tableName})`;
    const result = this.db.prepare(sql).all();
    return result;
  }

  getWhereClause(tableName, whereData) {
    const whereClause = [];
  
    for (const [key, value] of Object.entries(whereData)) {
      whereClause.push(`${key} = '${value}'`);
    }
  
    return whereClause.join(' AND ');
  }
}

module.exports = IterateNode;

    const rows = Array.isArray(data[tableName]) ? data[tableName] : [data[tableName]];
  
    for (const row of rows) {
      await this.handleUpsertRow(tableName, row);
    }
  }

  async handleUpsertRow(tableName, row) {
    const primaryKey = this.getPrimaryKey(tableName, row);
    const existingRow = await this.getRow(tableName, primaryKey);
  
    if (!existingRow) {
      await this.handleInsertRow(tableName, row);
    } else {
      const updatedRow = { ...existingRow, ...row };
      await this.upsertRow(tableName, updatedRow);
    }
  }

  async getRow(tableName, primaryKey) {
    const sql = `SELECT * FROM ${tableName} WHERE ${this.getPrimaryKeyClause(tableName)} = ?`;
    const result = await this.db.prepare(sql).get(primaryKey);
    return result;
  }

  async upsertRow(tableName, row) {
    const primaryKey = this.getPrimaryKey(tableName, row);
    const columns = Object.keys(row);
    const values = Object.values(row);
  
    const sql = `REPLACE INTO ${tableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`;
    await this.db.prepare(sql).run(values);
  }

  getPrimaryKey(tableName, row) {
    const primaryKeyColumns = this.getPrimaryKeyColumns(tableName);
    if (primaryKeyColumns.length === 1) {
      return row[primaryKeyColumns[0]];
    }
  
    return primaryKeyColumns.map(column => row[column]).join(',');
  }

  getPrimaryKeyColumns(tableName) {
    const tableSchema = this.getTableSchema(tableName);
    const primaryKey = tableSchema.find(column => column.pk);
    return primaryKey ? primaryKey.name.split(',') : [];
  }

  getPrimaryKeyClause(tableName) {
    const primaryKeyColumns = this.getPrimaryKeyColumns(tableName);
    if (primaryKeyColumns.length === 1) {
      return primaryKeyColumns[0];
    }
  
    return primaryKeyColumns.map(column => `${column} = ?`).join(' AND ');
  }

  getTableSchema(tableName) {
    const sql = `PRAGMA table_info(${tableName})`;
    const result = this.db.prepare(sql).all();
    return result;
  }

  getWhereClause(tableName, whereData) {
    const whereClause = [];
  
    for (const [key, value] of Object.entries(whereData)) {
      whereClause.push(`${key} = '${value}'`);
    }
  
    return whereClause.join(' AND ');
  }
}

export default IterateNode;

