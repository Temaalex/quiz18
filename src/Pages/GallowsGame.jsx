import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate,  useLocation} from 'react-router-dom';
import BD from './bd.json';


const mainWrapperStyle = {
 margin: "20px",
 border: '2px solid #ffffff',
 backgroundColor: '#000000',
 borderRadius: '15px',
 overflow:"hidden",
 position: "absolute",
 zIndex: "99"
}
const styleText = {
  color: '#ffffff',
  fontFamily: "'Roboto Mono', monospace",
  fontWeight: '600',
  fontSize: '20px',
  margin: '5px',
  textAlign: 'center',
};

const GallowsGamePageStyle = {
  display: 'flex',
  width: '50%',
  justifyContent: 'center',
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

const energyStyle = {
  border: '2px solid #ffffff',
  color: '#000000',
  borderRadius: '15px',
  backgroundColor: '#4346d8',
  marginLeft: '20px',
  marginRight: '20px',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'stretch',
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

  useEffect(() => {
    if (localStorage.getItem('check') !== null) {
      navigate('/toError');
    }
  }, [navigate]);
  
  // 1. Убираем массив из 30 useRef. Используем один ref на контейнер
  const progressContainerRef = useRef(null);

  // 2. Парсим ключ без useState, если он не меняется
  const pathParts = location.pathname.split('/').filter(Boolean);
  const key = Number(pathParts[pathParts.length - 1]);
  
const currentWord = useMemo(
  () => BD.gallowGame[key - 1]?.gallowWord || [],
  [key] // Зависит только от номера уровня
);

const hint = useMemo(
  () => BD.gallowGame[key - 1]?.hint || '',
  [key]
);

  const [energy, setEnergy] = useState(100);
  const [count, setCount] = useState(0); // Возможно, тоже не нужно, если не используется явно
  const [gameStatus, setGameStatus] = useState('Энергия:');
  const [usedLetters, setUsedLetters] = useState(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  // 3. Правильная инициализация состояния
  const [visible, setVisible] = useState(() => currentWord.map(() => false));
  
  // Состояние для хранения пройденных уровней (вместо чтения из localStorage в цикле)
  const [completedLevels, setCompletedLevels] = useState(new Set());

  useEffect(() => {
    // Загружаем прогресс один раз при старте
    const savedProgress = new Set(Object.keys(localStorage).filter(k => localStorage.getItem(k) === 'true'));
    setCompletedLevels(savedProgress);
  }, []);

  useEffect(() => {
    setUsedLetters(new Set());
  }, [count]);

function toBoss() {
  const emptyArray = [];
  const checkedArray = ["qWG-1", "qWG-2", "qWG-3", "qWG-4"];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    emptyArray.push(key);
  }

  const naturalSort = (a, b) => {
    const regex = /(\d+)/g;
    const aParts = a.split(regex);
    const bParts = b.split(regex);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i];
      const bPart = bParts[i];

      if (aPart && bPart && /^\d+$/.test(aPart) && /^\d+$/.test(bPart)) {
        return Number(aPart) - Number(bPart);
      }

      if (aPart !== bPart) {
        return String(aPart || '').localeCompare(String(bPart || ''));
      }
    }
    return 0;
  };

  emptyArray.sort(naturalSort);

  // Сравнение массивов
  const isEqual = emptyArray.length === checkedArray.length &&
                  emptyArray.every((val, index) => val === checkedArray[index]);

  if (isEqual) {
    navigate('/toBoss');
  } else {
    console.log("Массивы не совпадают:", emptyArray);
  }
}

  useEffect(() => {
    const isWon = visible.every(v => v);
    if (isWon && gameStatus !== 'Правильно, следуй дальше!') {
      setGameStatus('Правильно, следуй дальше!');
      localStorage.setItem(String("qWG-"+key), 'true');
      setCompletedLevels(prev => new Set([...prev, String(key)]));
      toBoss()
    }
  }, [visible, key, gameStatus]);
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

  useEffect(() => {
    if (energy <= 0 && gameStatus !== 'Конец игры') {
      setGameStatus('Конец игры');
      navigate('/toError');
      localStorage.setItem('check', location.pathname.slice(1))
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
      setIsAnimating(true); // Запускаем тряску
    }
  }
   useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // Определяем класс цвета в зависимости от энергии
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
      <button onClick={toggleProgress} className='buttonProgress'>
        Прогресс
      </button>

      {/* Рендерим прогресс на основе состояния, а не меняем DOM вручную */}
      {isProgressVisible && (
        <div ref={progressContainerRef} className='textProgressDisplay'>
          {[...Array(30)].map((_, i) => {
            const levelKey = "qWG-"+String(i + 1);
            const isCompleted = completedLevels.has(levelKey);
            
            return (
              <div
                key={i}
                className='textProgress'
                style={{
                  ...wordsStyle, // Используем существующий стиль
                  backgroundColor: isCompleted ? '#30b830' : '#000000',
                  color: isCompleted ? '#000000' : '#ffffff'
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      )}

      {/* Остальной код компонента... */}
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
        
        {/* Блок энергии */}
        <div className="energy-container">
          <div
            className={`energy-bar ${getEnergyClass()} ${isAnimating ? 'shake' : ''}`}
            style={{ width: `${energy}%` }} // Только ширина меняется динамически
          />
          <span className="energy-text">{energy}%</span>
        </div>
      </div>

      <div style={wrapperStyle}>
        {alphabet.map(letter => {
  const isUsed = usedLetters.has(letter);
  const isGameOver = gameStatus === 'Правильно, следуй дальше!' || gameStatus === 'Конец игры';
  
  // Если игра окончена (победа или проигрыш) — применяем новый стиль
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
      // Блокируем клик через disabled, если игра окончена ИЛИ буква использована
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