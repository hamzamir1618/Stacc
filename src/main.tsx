import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// No StrictMode: its double-mounted effects would replay the one-shot GSAP choreography (intro, page entrances).
createRoot(document.getElementById('root')!).render(<App />);
