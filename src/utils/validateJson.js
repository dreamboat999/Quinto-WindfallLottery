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
        break;
      case 'DELETE':
        break;
      case 'REMOVE':
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
        console.log(x[table_name]);

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
    }
    resultSQL.push(sqlStr);
  }

  // console.log(resultSQL);
  return resultSQL;
}

// validateJson({
//   result: [
//     {
//       mode: 'UPDATE',
//       client_balances: [
//         {
//           exchange_rate: 1.002,
//           currency_type: 'CHF',
//         },
//         {
//           exchange_rate: 0.9835,
//           currency_type: 'EUR',
//         },
//         {
//           exchange_rate: 110.61,
//           currency_type: 'BCH',
//         },
//         {
//           exchange_rate: 1.0,
//           currency_type: 'USD',
//         },
//         {
//           exchange_rate: 0.7639,
//           currency_type: 'CAD',
//         },
//         {
//           exchange_rate: 6.225,
//           currency_type: 'DOT',
//         },
//         {
//           exchange_rate: 1.0,
//           currency_type: 'USDT',
//         },
//         {
//           exchange_rate: 0.05988,
//           currency_type: 'DOGE',
//         },
//         {
//           exchange_rate: 0.6305,
//           currency_type: 'AUD',
//         },
//         {
//           exchange_rate: 19560.38,
//           currency_type: 'BTC',
//         },
//         {
//           exchange_rate: 0.0006984,
//           currency_type: 'KRW',
//         },
//         {
//           exchange_rate: 0.006712,
//           currency_type: 'JPY',
//         },
//         {
//           exchange_rate: 1.143,
//           currency_type: 'GBP',
//         },
//         {
//           exchange_rate: 274.07,
//           currency_type: 'BNB',
//         },
//         {
//           exchange_rate: 0.4783,
//           currency_type: 'XRP',
//         },
//         {
//           exchange_rate: 1330.4,
//           currency_type: 'ETH',
//         },
//         {
//           exchange_rate: 52.82,
//           currency_type: 'ZEC',
//         },
//         {
//           exchange_rate: 1.0,
//           currency_type: 'USDC',
//         },
//         {
//           exchange_rate: 51.89,
//           currency_type: 'LTC',
//         },
//         {
//           exchange_rate: 0.9999,
//           currency_type: 'BUSD',
//         },
//         {
//           exchange_rate: 0.3726,
//           currency_type: 'ADA',
//         },
//       ],
//       _location_: 'accounting.currency.UpdateExchangeRates(137)',
//     },
//     {
//       mode: 'UPDATE',
//       client_balances: {
//         withdrawal_fee: 0.00001,
//         exchange_rate: 19560.38,
//         currency_type: 'BTC',
//       },
//       _location_: 'accounting.currency.UpdateExchangeRates(101)',
//     },
//   ],
// });
// validateJson({
//   result: [
//     {
//       site_info: {
//         status: 'OPEN',
//         name: 'QA',
//         msg: null,
//         id: 1,
//       },
//       mode: 'INSERT',
//       _location_: 'member.open_session(89)',
//     },
//     {
//       mode: 'INSERT',
//       client: {
//         user_name: 'OBSERVER',
//         state: 'observer',
//         session_key: 343,
//         ping: 1665952492899,
//       },
//       _location_: 'member.open_session(99)',
//     },
// {
//   mode: 'INSERT',
//   client_balances: [
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'NONE',
//       seq_nbr: 1,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'HOUSE',
//       faucet: 0,
//       exchange_rate: 1,
//       emergency_addr: null,
//       description: 'Quintoshis',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'QVC',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 2,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'FIAT',
//       faucet: 0,
//       exchange_rate: 1,
//       emergency_addr: null,
//       description: 'US Dollar',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'USD',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 3,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'FIAT',
//       faucet: 0,
//       exchange_rate: 0.6233,
//       emergency_addr: null,
//       description: 'Australian Dollar',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'AUD',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 4,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'FIAT',
//       faucet: 0,
//       exchange_rate: 0.7305,
//       emergency_addr: null,
//       description: 'Canadian Dollar',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'CAD',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 5,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'FIAT',
//       faucet: 0,
//       exchange_rate: 0.9726,
//       emergency_addr: null,
//       description: 'Euro',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'EUR',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 6,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'FIAT',
//       faucet: 0,
//       exchange_rate: 1.124,
//       emergency_addr: null,
//       description: 'Pound Sterling',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'GBP',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 7,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'FIAT',
//       faucet: 0,
//       exchange_rate: 0.0006956,
//       emergency_addr: null,
//       description: 'Korean Won',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'KRW',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 8,
//       scale: 0,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'FIAT',
//       faucet: 0,
//       exchange_rate: 0.006721,
//       emergency_addr: null,
//       description: 'Japanese Yen',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'JPY',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 9,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'FIAT',
//       faucet: 0,
//       exchange_rate: 0.9943,
//       emergency_addr: null,
//       description: 'Swiss Franc',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'CHF',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 10,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 1,
//       emergency_addr: null,
//       description: 'USD Coin',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'USDC',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 11,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 1,
//       emergency_addr: null,
//       description: 'Tether',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'USDT',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 12,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 1,
//       emergency_addr: null,
//       description: 'Binance USD',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'BUSD',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: 0.00001017,
//       withdrawable: 0,
//       status: 'ACTIVE',
//       seq_nbr: 13,
//       scale: 8,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 19301.28,
//       emergency_addr: null,
//       description: 'Bitcoin',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'BTC',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 14,
//       scale: 8,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 110.24,
//       emergency_addr: null,
//       description: 'Bitcoin Cash',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'BCH',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 15,
//       scale: 8,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 1307.64,
//       emergency_addr: null,
//       description: 'Ethereum',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'ETH',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 16,
//       scale: 8,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 273,
//       emergency_addr: null,
//       description: 'Binance Coin',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'BNB',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 17,
//       scale: 8,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 0.4776,
//       emergency_addr: null,
//       description: 'Ripple',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'XRP',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 18,
//       scale: 8,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 0.3702,
//       emergency_addr: null,
//       description: 'Cardano',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'ADA',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 19,
//       scale: 8,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 0.05918,
//       emergency_addr: null,
//       description: 'Dogecoin',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'DOGE',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 20,
//       scale: 8,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 51.49,
//       emergency_addr: null,
//       description: 'Litecoin',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'LTC',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 21,
//       scale: 8,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 6.211,
//       emergency_addr: null,
//       description: 'Polkadot',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'DOT',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'ACTIVE_WAGER',
//       seq_nbr: 22,
//       scale: 8,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'CRYPTO',
//       faucet: 0,
//       exchange_rate: 51.85,
//       emergency_addr: null,
//       description: 'Zcash',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'ZEC',
//       balance: 0,
//       address_available: false,
//     },
//     {
//       withdrawal_fee: null,
//       withdrawable: 0,
//       status: 'INACTIVE',
//       seq_nbr: 23,
//       scale: 2,
//       'permanent ': false,
//       min_withdrawal: null,
//       fund_type: 'POKER',
//       faucet: 0,
//       exchange_rate: null,
//       emergency_addr: null,
//       description: 'Lammer',
//       deposit_qrcode: null,
//       deposit_credit: 0,
//       deposit_address: null,
//       currency_type: 'LMR',
//       balance: 0,
//       address_available: false,
//     },
//   ],
//   _location_: 'member.MemberProcSingle(515)',
// },
//     {
//       tabs: [
//         {
//           tab_name: 'LOTTERY',
//           tab_descr: 'Lottery',
//           ref_id: '4971973988617027584',
//           parent_name: 'BASE',
//           ord: 4,
//         },
//       ],
//       mode: 'INSERT',
//       _location_: 'base.SingleQueries(98)',
//     },
//     {
//       subscriptions: {
//         ref_id: '4971973988617027584',
//         parent_id: '-9223372036854775808',
//       },
//       mode: 'INSERT',
//       _location_: 'member.subscription.subscribe(242)',
//     },
//     {
//       tabs: [
//         {
//           tab_name: 'EASY4',
//           tab_descr: 'Easy 4 Lottery',
//           ref_id: '4976477588244398080',
//           prize_title: 'EST. JACKPOT',
//           prize_amt: '363,000',
//           parent_name: 'LOTTERY',
//           ord: 0,
//         },
//         {
//           tab_name: 'FAUCET',
//           tab_descr: 'Quinto Faucet Lottery',
//           ref_id: '4980981187871768576',
//           prize_title: 'EST. JACKPOT',
//           prize_amt: '1,000',
//           parent_name: 'LOTTERY',
//           ord: 1,
//         },
//         {
//           tab_name: 'WINDFALL',
//           tab_descr: 'Windfall Lottery',
//           ref_id: '4985484787499139072',
//           prize_title: 'EST. JACKPOT',
//           prize_amt: '45,000',
//           parent_name: 'LOTTERY',
//           ord: 2,
//         },
//         {
//           tab_name: 'LOTTO',
//           tab_descr: '5:55 LOTTO',
//           ref_id: '4989988387126509568',
//           prize_title: 'EST. JACKPOT',
//           prize_amt: '634,000',
//           parent_name: 'LOTTERY',
//           ord: 3,
//         },
//         {
//           tab_name: 'QUINTO',
//           tab_descr: 'Quinto Lottery',
//           ref_id: '4994491986753880064',
//           prize_title: 'EST. JACKPOT',
//           prize_amt: '21,000,000',
//           parent_name: 'LOTTERY',
//           ord: 4,
//         },
//         {
//           tab_name: 'SUPER10',
//           tab_descr: 'Super10 Lottery',
//           ref_id: '4998995586381250560',
//           prize_title: 'EST. JACKPOT',
//           prize_amt: '640,000',
//           parent_name: 'LOTTERY',
//           ord: 5,
//         },
//       ],
//       mode: 'INSERT',
//       _location_: 'games.lottery.LotteryProcs(1313)',
//     },
//     {
//       subscriptions: {
//         ref_id: '4985484787499139072',
//         parent_id: '4971973988617027584',
//       },
//       mode: 'INSERT',
//       _location_: 'member.subscription.subscribe(242)',
//     },
//     {
//       mode: 'INSERT',
//       lottery_games: {
//         total_tickets: 10000,
//         tickets: 9952,
//         remaining: 48,
//         prize_payout: 225000,
//         pool_fee: 1,
//         picks: null,
//         members: 580,
//         max_picks: 1000,
//         max_games: 1,
//         jackpot_amt: 45000,
//         game_time: 'Unknown',
//         game_status: 'OPEN',
//         game_seed: 'NOT YET REVEALED',
//         game_pick: null,
//         game_nbr: 2,
//         game_name: 'Windfall Lottery',
//         game_id: '4986610687405981698',
//         game_draw: null,
//         def_id: '4985484787499139072',
//         checksum: null,
//         buyin_allowed: true,
//         buyin: 25,
//         allow_pools: true,
//       },
//       _location_: 'games.lottery.LotteryProcs(2201)',
//     },
//     {
//       subscriptions: {
//         ref_id: '4986610687405981698',
//         parent_id: '4985484787499139072',
//       },
//       mode: 'INSERT',
//       _location_: 'member.subscription.subscribe(242)',
//     },
//     {
//       mode: 'INSERT',
//       lottery_pools: [
//         {
//           user_min: 0,
//           user_max: 0,
//           tickets: 31,
//           private: false,
//           pool_time: '2022-10-14 17:26:18.961',
//           pool_ref: '796o–rJnS',
//           pool_name: 'Game #2 Windfall Lottery Pool',
//           pool_id: '4987736587312824340',
//           picks: 31,
//           min_picks: 1,
//           members: 31,
//           max_picks: 1,
//           is_open: true,
//           is_member: false,
//           game_id: '4986610687405981698',
//           def_id: '4985484787499139072',
//           creator: 'Quinto Games',
//         },
//       ],
//       _location_: 'games.lottery.LotteryProcs(1483)',
//     },
//   ],
// });