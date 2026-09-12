import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BD from './bd.json';

// --- Стили (без изменений, кроме удаления дубликатов) ---
const mainWrapperStyle = {
  margin: "20px",
  border: '2px solid #ffffff',
  backgroundColor: '#000000',
  borderRadius: '15px',
  overflow: "hidden",
  position: "absolute",
  zIndex: "99"
};

const styleText = {
  color: '#ffffff',
  fontFamily: "'Roboto Mono', monospace",
  fontWeight: '600',
  fontSize: '20px',
  margin: '5px',
  textAlign: 'center',
};

const wordsStyle = {
  border: '2px solid #ffffff',
  backgroundColor: '#000000',
  color: '#ffffff',
  borderRadius: '7px',
  textAlign: 'center',
  fontFamily: "'Roboto Mono', monospace",
  fontWeight: '600',
  fontSize: '20px',
  width: '30px',
  height: '30px',
  margin: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const wrapperStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  padding: '10px',
  justifyContent: 'center',
};

const buttonStyle = {
  ...wordsStyle,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: '0.5',
  cursor: 'not-allowed',
};

const gameOverButtonStyle = {
  ...buttonStyle,
  opacity: '0.3',
  cursor: 'not-allowed',
  filter: 'grayscale(1)',
};

const hintStyle = {
  ...styleText,
  fontSize: '16px',
  color: '#cccccc',
  marginBottom: '10px',
};

const energyTextStyle = {
  ...styleText,
  fontSize: '25px',
  color: '#cccccc',
  marginBottom: '10px',
  margin: 0,
  fontWeight: 'bold',
  marginLeft: '10px',
  marginRight: '10px'
};

const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');

const GallowsGame = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Проверка на бан/ошибку
  useEffect(() => {
    if (localStorage.getItem('check') !== null) {
      navigate('/toError');
    }
  }, [navigate]);

  const progressContainerRef = useRef(null);

  // Парсинг ключа уровня
  const pathParts = location.pathname.split('/').filter(Boolean);
  const key = Number(pathParts[pathParts.length - 1]);
  
  const currentWord = useMemo(
    () => BD.gallowGame[key - 1]?.gallowWord || [],
    [key]
  );

  const hint = useMemo(
    () => BD.gallowGame[key - 1]?.hint || '',
    [key]
  );

  const [energy, setEnergy] = useState(100);
  const [gameStatus, setGameStatus] = useState('Энергия:');
  const [usedLetters, setUsedLetters] = useState(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [visible, setVisible] = useState(() => currentWord.map(() => false));
  
  // Состояние пройденных уровней. Хранит строки вида "qWG-1", "qWG-2"...
  const [completedLevels, setCompletedLevels] = useState(new Set());

  // Загрузка прогресса из localStorage при старте
  useEffect(() => {
    const savedProgress = new Set(Object.keys(localStorage).filter(k => localStorage.getItem(k) === 'true'));
    setCompletedLevels(savedProgress);
  }, []);

  useEffect(() => {
    setUsedLetters(new Set());
  }, [currentWord]); // Лучше зависеть от слова, а не от count

  // Функция перехода к боссу
  function toBoss() {
    // Проверяем, есть ли в localStorage все 30 уровней
    let allCompleted = true;
    for (let i = 1; i <= 30; i++) {
      if (localStorage.getItem(`qWG-${i}`) !== 'true') {
        allCompleted = false;
        break;
      }
    }

    if (allCompleted) {
      navigate('/toBoss');
    } else {
      console.log("Не все уровни пройдены");
    }
  }

  // Логика победы
  useEffect(() => {
    const isWon = visible.every(v => v);
    
    // Формируем ключ текущего уровня
    const currentLevelKey = `qWG-${key}`;

    if (isWon && gameStatus !== 'Правильно, следуй дальше!') {
      // 1. Сохраняем в localStorage
      localStorage.setItem(currentLevelKey, 'true');
      
      // 2. Обновляем локальный стейт (чтобы прогресс отобразился мгновенно)
      setCompletedLevels(prev => new Set([...prev, currentLevelKey]));
      
      setGameStatus('Правильно, следуй дальше!');
      
      // 3. Проверяем условие для босса
      toBoss();
    }
  }, [visible, key, gameStatus]);

  useEffect(() => {
    if (energy <= 0 && gameStatus !== 'Конец игры') {
      setGameStatus('Конец игры');
      navigate('/toError');
      localStorage.setItem('check', location.pathname.slice(1));
    }
  }, [energy, gameStatus]);

  function checkLetter(letter) {
    if (gameStatus.includes('Конец') || usedLetters.has(letter)) return;

    setUsedLetters(prev => new Set(prev).add(letter));

    const foundIndices = currentWord
      .map((wordLetter, idx) => wordLetter === letter ? idx : -1)
      .filter(idx => idx !== -1);

    if (foundIndices.length > 0) {
      setVisible(prev =>
        prev.map((val, idx) => foundIndices.includes(idx) ? true : val)
      );
    } else {
      setEnergy(prev => Math.max(prev - 20, 0));
      setIsAnimating(true);
    }
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const getEnergyClass = () => {
    if (energy > 50) return 'green';
    if (energy > 20) return 'yellow';
    return 'red';
  };

  const [isProgressVisible, setIsProgressVisible] = useState(false);

  const toggleProgress = () => {
    setIsProgressVisible(prev => !prev);
  };

  return (
    <div style={mainWrapperStyle}>
      {/* Кнопка прогресса */}
      <button onClick={toggleProgress} className='buttonProgress'>
        Прогресс
      </button>

      {/* Блок отображения прогресса */}
      {isProgressVisible && (
        <div ref={progressContainerRef} className='textProgressDisplay' style={{ margin: '10px 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[...Array(30)].map((_, i) => {
            const levelNum = i + 1;
            const levelKey = `qWG-${levelNum}`;
            
            // Теперь ключи совпадают: и в localStorage, и в Set хранятся как "qWG-1"
            const isCompleted = completedLevels.has(levelKey);
            
            return (
              <div
                key={levelKey} // Используем уникальный ключ
                className='textProgress'
                style={{
                  ...wordsStyle,
                  backgroundColor: isCompleted ? '#30b830' : '#000000', // Зеленый если пройден
                  color: isCompleted ? '#000000' : '#ffffff',          // Черный текст на зеленом
                  cursor: isCompleted ? 'default' : 'not-allowed'      // Опционально: нельзя кликнуть на пройденные
                }}
              >
                {levelNum}
              </div>
            );
          })}
        </div>
      )}

      <div style={hintStyle}>Подсказка: {hint}</div>
      
      <div style={wrapperStyle}>
        {visible.map((isVisible, idx) => (
          <div key={idx} style={wordsStyle}>
            {isVisible ? currentWord[idx] : ''}
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <p style={energyTextStyle}>{gameStatus}</p>
        
        <div className="energy-container">
          <div
            className={`energy-bar ${getEnergyClass()} ${isAnimating ? 'shake' : ''}`}
            style={{ width: `${energy}%` }}
          />
          <span className="energy-text">{energy}%</span>
        </div>
      </div>

      <div style={wrapperStyle}>
        {alphabet.map(letter => {
          const isUsed = usedLetters.has(letter);
          const isGameOver = gameStatus === 'Правильно, следуй дальше!' || gameStatus === 'Конец игры';
          
          let style;
          if (isGameOver) {
            style = gameOverButtonStyle;
          } else if (isUsed) {
            style = disabledButtonStyle;
          } else {
            style = buttonStyle;
          }

          return (
            <button
              key={letter}
              style={style}
              onClick={() => checkLetter(letter)}
              disabled={isGameOver || isUsed}
              aria-label={`Буква ${letter}`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GallowsGame;
