import './App.css';

type Status = 'unreviewed' | 'thesis_valid' | 'watchout' | 'thesis_broken'
type Thesis = { id: number; ticker: string; name: string; thesis: string; status: Status }
type Position = { number_of_shares: number; entry_price: number }

function ThesisCard({ thesis, matchedPosition, handleUpdate, handleDelete }: {
    thesis: Thesis
    matchedPosition: Position | undefined
    handleUpdate: (id: number, newStatus: Status) => void
    handleDelete: (id: number) => void
  }) {
    return (
        <div className="thesis-card">
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
        {matchedPosition && (
          <p>{matchedPosition.number_of_shares} Stück bei {matchedPosition.entry_price} €</p>
        )}
      </div> 
    )
  }
  export default ThesisCard 