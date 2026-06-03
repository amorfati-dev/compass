import { useState, useEffect} from 'react'

const ThesisRow = () => {
  return (
    <div>
      <span>Ticker: OGZPY</span>
      <span>Name: Gazprom</span>
      <span>Thesis: OGZPY</span>
      <span>Type: aristocrat</span>
      <span>Status: watchout</span>
    </div>
  )
}


function App() {const [theses, setTheses] = useState([])
  useEffect(() => {
    fetch('http://localhost:8000/theses')
    .then(response => response.json())
    .then((data) => {console.log(data)
      setTheses(data)
    })
  }, [])
  return (
    <div>
      <h1>Compass AI</h1>
      <p>Mein FIRE-Cockpit</p>
      {theses.map((thesis) => (
      <div key={thesis.id}>
        <span>{thesis.ticker}</span>
        <span>{thesis.name}</span>
        <span>{thesis.thesis}</span>
        <span>{thesis.status}</span>
      </div>
      ))}
    </div>
  )
}

export default App;