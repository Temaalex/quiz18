import { useState, useEffect } from 'react';

const ToErrorBoss = () => {
  const [deletedLevel, setDeletedLevel] = useState(null);

  useEffect(() => {
    // Читаем, какой уровень был удалён
    const deleted = localStorage.getItem('deletedLevel');
    if (deleted) {
      setDeletedLevel(deleted);
      // Очищаем временный ключ, чтобы при следующем заходе не показывался старый
      localStorage.removeItem('deletedLevel');
    }
  }, []);

  return (
    <div style={styles.centerWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>💀 ПОРАЖЕНИЕ 💀</h1>

        <p style={styles.text}>
          Босс оказался сильнее. Тебе нужно вернуться и заново найти путь к нему.
        </p>

        <div style={styles.codeBox}>
          {deletedLevel
            ? `Вернись к QR ${deletedLevel}`
            : 'Прогресс не изменён'}
        </div>
      </div>
    </div>
  );
};

const styles = {
  centerWrapper: {
    margin: "20px",
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  container: {
    padding: '40px',
    border: '2px solid #ffffff',
    backgroundColor: '#000000',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 0 30px rgba(255, 68, 68, 0.3)',
    maxWidth: '600px',
    width: '90%',
    fontFamily: "'Roboto Mono', monospace",
    color: '#ffffff',
  },
  title: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  text: {
    fontSize: '18px',
    lineHeight: '1.5',
    marginBottom: '30px',
    color: '#cccccc',
  },
  codeBox: {
    backgroundColor: '#1a1a2e',
    border: '2px dashed #ff4444',
    color: '#ff4444',
    fontFamily: "'Courier New', monospace",
    fontSize: '20px',
    fontWeight: 'bold',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default ToErrorBoss;
