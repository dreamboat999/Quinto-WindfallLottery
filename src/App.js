import sqlWasm from "!!file-loader?name=sql-wasm-[contenthash].wasm!sql.js/dist/sql-wasm.wasm"
import Home from "pages/Home"
import { useEffect, useState } from "react"
import { HashLoader } from "react-spinners"
import initSqlJs from "sql.js"
import "styles/global.scss"

export default function App() {
  const [db, setDb] = useState(null)
  const [error, setError] = useState(null)

  useEffect(async () => {
    try {
      const SQL = await initSqlJs({ locateFile: () => sqlWasm })
      fetch("./LotteryTest.db").then(async (res) => {
        const db = new SQL.Database(new Uint8Array(await res.arrayBuffer()))
        setDb(db)
      })
    } catch (err) {
      console.log(err)
      setError(err)
    }
  }, [])

  return (
    <div className="App">
      {error && "<pre>{error.toString()}</pre>"}
      {!db && (
        <div className="spinner">
          <HashLoader color="#03b3ff" />
        </div>
      )}
      <Home db={db} />
    </div>
  )
}
