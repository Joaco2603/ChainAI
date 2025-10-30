import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Prompt } from './pages/Prompt';
import { RateModel } from './pages/RateModel';
import { UploadModel } from './pages/UploadModel';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prompt" element={<Prompt />} />
          <Route path="/rate" element={<RateModel />} />
          <Route path="/upload" element={<UploadModel />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
