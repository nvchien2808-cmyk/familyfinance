
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // <--- THÊM DÒNG NÀY ĐỂ KÍCH HOẠT TAILWIND VÀ CSS CỦA BẠN
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
