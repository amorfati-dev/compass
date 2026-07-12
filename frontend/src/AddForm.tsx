type FormState = {
    ticker: string; name: string; type: string; thesis: string
    kill_criterion: string; broker: string; number_of_shares: string
    entry_price: string; expected_dividend_per_share: string
  }

function AddForm({ formData, setFormData, handleSubmit }: {
    formData: FormState
    setFormData: (value: FormState) => void
    handleSubmit: () => void
  }) {
    return (
      <div className="add-form">
        <h2 className="add-form-title">Neue These hinzufügen</h2>
        <div className="add-form-grid">
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
        </div>
        <button className="submit-btn" onClick={handleSubmit}>Add Thesis</button>
      </div>
    )
  }
  export default AddForm