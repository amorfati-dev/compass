import { useState, useEffect } from 'react'
import './App.css'

type Status = 'unreviewed' | 'thesis_valid' | 'watchout' | 'thesis_broken'

  const emptyForm = {
    ticker: '',
    name: '',
    type: 'aristocrat',
    thesis: '',
    kill_criterion: '',
    broker: '',
    number_of_shares: '',
    entry_price: '',
    expected_dividend_per_share: '',
 };

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

  const [formData, setFormData] = useState(emptyForm)

  const handleSubmit = () => {
    fetch('http://localhost:8000/theses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ticker: formData.ticker,
        name: formData.name,
        type: formData.type,
        thesis: formData.thesis,
        kill_criterion: formData.kill_criterion})
    })
      .then(response => response.json())
      .then((NewThesis) => {
        console.log(NewThesis)
        setTheses([...theses, NewThesis])
      })
    fetch('http://localhost:8000/positions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({broker: formData.broker,
        ticker: formData.ticker,
        type: formData.type,
        name: formData.name,
        number_of_shares: Number(formData.number_of_shares),
        entry_price: Number(formData.entry_price),
        expected_dividend_per_share: Number(formData.expected_dividend_per_share)})
    })
      .then(response => response.json())
      .then((NewPosition) => {
        console.log(NewPosition)
        setPositions([...positions, NewPosition])
      })
    setFormData(emptyForm);
  }

  const handleUpdate = (id: number, newStatus: Status) => {
    fetch(`http://localhost:8000/theses/${id}?new_status=${newStatus}`, {
      method: 'PATCH',
    })
      .then(() => {
        setTheses(theses.map((thesis) => thesis.id === id ? { ...thesis, status: newStatus } : thesis))
      })
  }

  const handleDelete = (id: number) => {
    fetch(`http://localhost:8000/theses/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setTheses(theses.filter((thesis) => thesis.id !== id))
      })
  }

  const [positions, setPositions] = useState([])
  useEffect(() => {
    fetch('http://localhost:8000/positions')
      .then(response => response.json())
      .then((data) => {
        console.log(data)
        setPositions(data)
      })
  }, [])

  const annualDividends = positions.reduce((acc, position) => acc + position.expected_dividend_per_share * position.number_of_shares, 0)
  const monthlyDividends = annualDividends / 12
  const progressPercent = Math.min((monthlyDividends / 3500) * 100, 100)

  return (
    <div>
      <h1>Compass AI</h1>
      <p>My FIRE Cockpit</p>
      <p>Erwartete Dividenden: {annualDividends.toFixed(2)} € / year</p>
      <p>Erwartete Dividenden: {monthlyDividends.toFixed(2)} € / months</p>

      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div style={{
          background: '#1e2235',
          borderRadius: '999px',
          height: '36px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #2f6f4f, #3d8b6d)',
            width: `${progressPercent}%`,
            height: '100%',
            borderRadius: '999px',
            transition: 'width 0.8s ease'
          }} />
          <span style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            {monthlyDividends.toFixed(2)} € / 3.500 € ({progressPercent.toFixed(1)} %)
          </span>
        </div>
      </div>
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
      <input
        type = "text"
        placeholder="Broker"
        value={formData.broker}
        onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
      />
      <input
        type="number"
        placeholder="Number of Shares"
        value={formData.number_of_shares}
        onChange={(e) => setFormData({ ...formData, number_of_shares: e.target.value })}
      />
      <input
        type="number"
        placeholder="Entry Price"
        value={formData.entry_price}
        step="0.01"
        onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
      />
      <input
        type="number"
        placeholder="Expected Dividend per Share"
        value={formData.expected_dividend_per_share}
        step="0.01"
        onChange={(e) => setFormData({ ...formData, expected_dividend_per_share: e.target.value })}
      />
      <button onClick={handleSubmit}>Add Thesis</button>
      {theses.map((thesis) => {
        const matchedPosition = positions.find((position) => position.ticker === thesis.ticker)
        return (
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
          <p>{matchedPosition?.number_of_shares} Stück bei {matchedPosition?.entry_price} €</p>
        </div>
      )})}
    </div>  
  )
}

export default App;