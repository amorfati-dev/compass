function FireBar() { monthlyDividends, progressPercent }: { monthlyDividends: number, progressPercent: number }) {
    return ( 
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
    )}

    export default FireBar;