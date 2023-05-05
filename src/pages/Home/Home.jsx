import React, { Component } from 'react';
import IterateNode from './iterateNode';

class Home extends Component {
  constructor(props) {
    super(props);
    const db = new sqlite3.Database('QuintoClient.db');
    db.exec(fs.readFileSync('./QuintoClient.schema').toString());

    this.iterateNode = new IterateNode(db);
  }

  componentDidMount() {
    this.iterateNode.ws.addEventListener('open', () => {
      console.log('WebSocket connection established.');
      const message = {
        method: 'open_session',
        params: {},
      };
      this.iterateNode.ws.send(JSON.stringify(message));
    });
  }

  render() {
    return (
      <div>
        <h1>Welcome to Quinto!</h1>
      </div>
    );
  }
}

export default Home;

