import { useState, useEffect } from 'react'
import './App.css'
import FireBar from './FireBar';
import ThesisCard from './ThesisCard';
import AddForm from './AddForm';

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

      <FireBar monthlyDividends={monthlyDividends} progressPercent={progressPercent} />
 
      <AddForm formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} />
      {theses.map((thesis) => {
        const matchedPosition = positions.find((position) => position.ticker === thesis.ticker)
        return (
        <ThesisCard key={thesis.id} thesis={thesis} matchedPosition={matchedPosition} handleUpdate={handleUpdate} handleDelete={handleDelete} />
      )})}  
    </div>
    )
  } 

export default App;