import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Upload from "./pages/Upload";
import AllSongsPage from "./pages/AllSongs";
import PlayerPage from "./pages/PlayerPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/music" element={<AllSongsPage />} />
        <Route path="/player/:songId" element={<PlayerPage />} />
      
      </Routes>
    </Router>
  );
}

export default App;
