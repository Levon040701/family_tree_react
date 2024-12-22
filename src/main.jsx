import { createRoot } from 'react-dom/client';
import Title from './Title/Title';
import Content from './Content/Content';

import './index.css';

const App = () => {
	return (
		<div className="app">
			<Title />
			<Content />
		</div>
	);
};

createRoot(document.getElementById('root')).render(<App />);
