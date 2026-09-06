import { Routes, Route } from 'react-router-dom';
import GallowsGame from "./Pages/GallowsGame";
import ToBoss from "./Pages/toBoss";
import ToError from "./Pages/toError";
import levels from './levels.json';

function App() {
  return (
    <Routes>
      {levels.map((level, index) => (
        <Route
          key={index + 1}
          path={`/${level.hash}/${level.id}`}
          element={<GallowsGame key={index + 1} />}
        />
      ))}
      <Route path="/toBoss" element={<ToBoss key={31} />} />
      <Route path="/toError" element={<ToError key={32} />} />
    </Routes>
  );
}

export default App;
