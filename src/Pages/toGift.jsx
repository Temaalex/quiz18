import { useEffect } from 'react';

const ToGift = () => {
  // Очистка localStorage происходит один раз при монтировании компонента
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div style={styles.centerWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>🎉 ПОБЕДА! 🎉</h1>

        <p style={styles.text}>
          Поздравляем с победой! Ты одолел босса!
          <br /><br />
          Вот секретный код от сундука с сокровищами:
        </p>
        <div style={styles.codeBox}>
          2367132
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
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
    
    maxWidth: '600px',
    width: '90%',
    
    fontFamily: "'Roboto Mono', monospace",
    color: '#ffffff',
  },
  title: {
    color: '#ffcc00',
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
    border: '2px dashed #ffcc00',
    color: '#ffcc00',
    fontFamily: "'Courier New', monospace",
    fontSize: '28px',
    fontWeight: 'bold',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '40px',
    wordBreak: 'break-all',
    minHeight: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default ToGift;
