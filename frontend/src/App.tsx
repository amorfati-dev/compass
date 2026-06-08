import { useState, useEffect } from 'react'
import './App.css'

type Status = 'unreviewed' | 'thesis_valid' | 'watchout' | 'thesis_broken'

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

  const [formData, setFormData] = useState({
    ticker: '',
    name: '',
    type: 'aristocrat',
    thesis: '',
    kill_criterion: ''
  })

  const handleSubmit = () => {
    fetch('http://localhost:8000/theses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then((NewThesis) => {
      console.log(NewThesis)
      setTheses([...theses, NewThesis])
    })
  }

  const handleUpdate = (id:number, newStatus:Status) => {
    fetch(`http://localhost:8000/theses/${id}?new_status=${newStatus}`, {
      method: 'PATCH',
    })
    .then(() => {
      setTheses(theses.map((thesis) => thesis.id === id ? { ...thesis, status: newStatus } : thesis))
    })
  }

  const handleDelete = (id:number) => {
    fetch(`http://localhost:8000/theses/${id}`, {
      method: 'DELETE'
    })
    .then(() => {
      setTheses(theses.filter((thesis) => thesis.id !== id))
    })
  }

  return (
    <div>
      <h1>Compass AI</h1>
      <p>My FIRE Cockpit</p>
      <input
        type="text"
        placeholder="Ticker Symbol"
        value={formData.ticker}
        onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
      />
      <input
        type="text"
        placeholder="Company Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
      >
        <option value="aristocrat">Aristocrat</option>
        <option value="king">King</option>
        <option value="turnaround">Turnaround</option>
        <option value="etf">ETF</option>
        <option value="cash">Cash</option>
        <option value="fonds">Fonds</option>
        <option value="bonds">Bonds</option>
        <option value="commodities">Commodities</option>
        <option value="other">Other</option>
      </select>
      <input
        type="text"
        placeholder="Thesis"
        value={formData.thesis}
        onChange={(e) => setFormData({ ...formData, thesis: e.target.value })}
      />
      <input
        type="text"
        placeholder="Kill-Criterion"
        value={formData.kill_criterion}
        onChange={(e) => setFormData({ ...formData, kill_criterion: e.target.value })}
      />
      <button onClick={handleSubmit}>Add Thesis</button>
      {theses.map((thesis) => (
        <div className="thesis-card" key={thesis.id}>
          <button onClick={() => handleDelete(thesis.id)}>Delete</button>
          <div className="thesis-header">
            <select value={thesis.status} onChange={(e) => handleUpdate(thesis.id, e.target.value as Status)}>
              <option value="unreviewed">Unreviewed</option>
              <option value="thesis_valid">Thesis Valid</option>
              <option value="watchout">Watchout</option>
              <option value="thesis_broken">Thesis Broken</option>
            </select>
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