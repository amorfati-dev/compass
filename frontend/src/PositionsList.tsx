import type { HoldingPosition } from './types';

interface PositionsListProps {
    positions: HoldingPosition[];
}

function PositionsList({ positions }: PositionsListProps) {
    const sorted = [...positions].sort((a, b) => b.dividend_net - a.dividend_net);
    return (
        <table className="positions-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Wert</th>
                    <th>Dividende (netto)</th>
                    <th>Rendite</th>
                    <th>Yield on Cost</th>
                </tr>
            </thead>
            <tbody>
                {sorted.map((position) => {
                    const yieldPercent = position.current_value === 0 ? 0 :position.dividend_net / position.current_value * 100;
                    const yieldOnCost = position.purchase_value === 0 ? 0 :position.dividend_net / position.purchase_value * 100;
                    return (
                        <tr key={position.isin}>
                            <td>{position.name}</td>
                            <td>{position.current_value.toFixed(2)} €</td>
                            <td>{position.dividend_net.toFixed(2)} €</td>
                            <td>{yieldPercent.toFixed(1)} %</td>
                            <td>{yieldOnCost.toFixed(1)} %</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}
export default PositionsList;