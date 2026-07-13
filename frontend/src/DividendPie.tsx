import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { HoldingPosition } from './types';

interface DividendPieProps {
    positions: HoldingPosition[];
}

// Schwelle: Positionen mit weniger Netto-Dividende landen in „Sonstige"
const MIN_DIVIDEND = 100;

const COLORS = [
    '#3d8b6d', '#5aa88a', '#2f6f4f', '#7cc4a8', '#4a90d9',
    '#6ba3e0', '#9b7fd4', '#b596e8', '#d4a24a', '#e0b86b',
    '#c96a5a', '#e08a7c', '#5ab5b0', '#7ccfc9', '#8a8fd4',
    '#a3a8e0', '#b5d45a', '#c9e07c', '#d45a9b', '#e07cb5',
];

// lange Fondsnamen fürs Tooltip eindampfen, damit die Prozentzahl nicht untergeht
function shorten(name: string): string {
    return name.length > 28 ? name.slice(0, 28).trimEnd() + '…' : name;
}

function DividendPie({ positions }: DividendPieProps) {
    // die Großen: eine Scheibe pro Position
    const big = positions.filter((position) => position.dividend_net > MIN_DIVIDEND);
    // die Kleinen: umgekehrte Bedingung, per reduce aufsummiert (JS-Version von Pythons sum)
    const small = positions.filter((position) => position.dividend_net <= MIN_DIVIDEND);
    const smallSum = small.reduce((acc, position) => acc + position.dividend_net, 0);

    const data = [
        ...big
            .sort((a, b) => b.dividend_net - a.dividend_net)
            .map((position) => ({ name: position.name, value: position.dividend_net })),
        { name: `Sonstige (${small.length} Pos.)`, value: smallSum },
    ];

    const total = data.reduce((acc, entry) => acc + entry.value, 0);

    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={130}
                        innerRadius={65}
                        paddingAngle={1}
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                // letzte Scheibe = „Sonstige" → neutrales Grau
                                fill={index === data.length - 1 ? '#4b5563' : COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value, name) => [
                            `${((Number(value) / total) * 100).toFixed(1)} % — ${Number(value).toFixed(2)} € / Jahr`,
                            shorten(String(name)),
                        ]}
                        contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #2a2a4a',
                            borderRadius: '8px',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default DividendPie;
