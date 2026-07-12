import './App.css';

type Status = 'unreviewed' | 'thesis_valid' | 'watchout' | 'thesis_broken'
type Thesis = { id: number; ticker: string; name: string; thesis: string; status: Status }
type Position = { number_of_shares: number; entry_price: number }

function ThesisCard({ thesis, matchedPosition, handleUpdate, handleDelete }: {
    thesis: Thesis
    matchedPosition: Position | undefined
    handleUpdate: (id: number, newStatus: Status) => void
    handleDelete: (id: number, ticker: string) => void
  }) {
    return (
        <div className="thesis-card">
          <div className="thesis-header">
            <div className="thesis-header-left">
              <span className="thesis-ticker">{thesis.ticker}</span>
              <span className={`thesis-status status-${thesis.status}`}>
                {thesis.status.replace('_', ' ')}
              </span>
            </div>
            <button className="delete-btn" onClick={() => handleDelete(thesis.id, thesis.ticker)}>
              Delete
            </button>
          </div>

          <h3 className="thesis-name">{thesis.name}</h3>
          <p className="thesis-text">{thesis.thesis}</p>

          {matchedPosition && (
            <p className="thesis-position">
              {matchedPosition.number_of_shares} Stück bei {matchedPosition.entry_price} €
            </p>
          )}

          <div className="thesis-footer">
            <select
              className="status-select"
              value={thesis.status}
              onChange={(e) => handleUpdate(thesis.id, e.target.value as Status)}
            >
              <option value="unreviewed">Unreviewed</option>
              <option value="thesis_valid">Thesis Valid</option>
              <option value="watchout">Watchout</option>
              <option value="thesis_broken">Thesis Broken</option>
            </select>
          </div>
        </div>
    )
  }
  export default ThesisCard 