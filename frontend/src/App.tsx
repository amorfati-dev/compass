import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [theses, setTheses] = useState([])
  useEffect(() => {
    fetch('http://localhost:8000/theses')
      .then(response => response.json())
      .then((data) => {
        console.log(data)
        setTheses(data)
      })
  }, [])
  return (
    <div>
      <h1>Compass AI</h1>
      <p>Mein FIRE-Cockpit</p>
      {theses.map((thesis) => (
        <div className="thesis-card" key={thesis.id}>
          <div className="thesis-header">
            <span className="thesis-ticker">{thesis.ticker}</span>
            <span className={`thesis-status status-${thesis.status}`}>{thesis.status}</span>
          </div>
          <h3 className="thesis-name">{thesis.name}</h3>
          <p className="thesis-text">{thesis.thesis}</p>
        </div>
      ))}
    </div>
  )
}

export default App;