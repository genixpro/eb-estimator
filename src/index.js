import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
import CatchErrors from './CatchErrors';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<CatchErrors><App /></CatchErrors>, document.getElementById('root'));
registerServiceWorker();
