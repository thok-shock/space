export default function HealthBar({ health, maxHealth }) {
    const percentage = (health / maxHealth) * 100;
  
    const getBarColor = () => {
      if (percentage > 60) return 'limegreen';
      if (percentage > 30) return 'gold';
      return 'crimson';
    };
  
    return (
      <div style={{
        width: '100%',
        backgroundColor: '#444',
        zIndex: 9999
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: getBarColor(),
          transition: 'width 0.3s ease-in-out'
        }} />
      </div>
    );
  }