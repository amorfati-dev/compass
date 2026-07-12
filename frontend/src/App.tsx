import { useState, useEffect } from 'react'
import './App.css'
import FireBar from './FireBar';
import ThesisCard from './ThesisCard';
import AddForm from './AddForm';
import type { HoldingsResponse, Thesis, DbPosition, Status } from './types';
import PositionsList from './PositionsList';
const FIRE_TARGET_MONTHLY = 3500;

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
  const [holdings, setHoldings] = useState<HoldingsResponse | null>(null);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);
  useEffect(() => {
    fetch('http://localhost:8000/holdings')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Backend antwortet mit ${response.status}`)
        }
        return response.json()
      })
      .then(data => setHoldings(data))
      .catch(error => setHoldingsError(error.message))
  }, []);

  const [theses, setTheses] = useState<Thesis[]>([])
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

    if (formData.number_of_shares) {
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
    }

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

  const handleDelete = (id: number, ticker: string) => {
    Promise.all([
      fetch(`http://localhost:8000/theses/${id}`, { method: 'DELETE' }),
      fetch(`http://localhost:8000/positions/${ticker}`, { method: 'DELETE' }),
    ])
      .then(() => {
        setTheses(theses.filter((thesis) => thesis.id !== id))
        setPositions(positions.filter((position) => position.ticker !== ticker))
      })
  }

  const [positions, setPositions] = useState<DbPosition[]>([])
  useEffect(() => {
    fetch('http://localhost:8000/positions')
      .then(response => response.json())
      .then((data) => {
        console.log(data)
        setPositions(data)
      })
  }, [])

  const monthlyDividends = holdings?.monthly_dividend_net ?? 0
  const annualDividends = monthlyDividends * 12

  return (
    <div className="app">
      <header className="app-header">
        <h1>Compass AI</h1>
        <p className="subtitle">My FIRE Cockpit</p>
        <div className="kpi-row">
          <div className="kpi">
            <span className="kpi-value">{annualDividends.toFixed(2)} €</span>
            <span className="kpi-label"> Dividenden / Jahr(trailing)</span>
          </div>
          <div className="kpi">
            <span className="kpi-value">{monthlyDividends.toFixed(2)} €</span>
            <span className="kpi-label"> Dividenden / Monat(trailing)</span>
          </div>
        </div>
      </header>

      {holdingsError ? (
        <p style={{ color: '#f87171', textAlign: 'center' }}>
          Holdings konnten nicht geladen werden: {holdingsError}
        </p>
      ) : holdings === null ? (
        <p style={{ textAlign: 'center' }}>Loading…</p>
      ) : (
        <>
          <FireBar monthlyDividends={monthlyDividends} target={FIRE_TARGET_MONTHLY} />
          <PositionsList positions={holdings.positions} />
        </>
      )}

      <AddForm formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} />

      <div className="thesis-list">
        {theses.map((thesis) => {
          const matchedPosition = positions.find((position) => position.ticker === thesis.ticker)
          return (
            <ThesisCard key={thesis.id} thesis={thesis} matchedPosition={matchedPosition} handleUpdate={handleUpdate} handleDelete={handleDelete} />
          )
        })}
      </div>
    </div>
    )
  } 

export default App;