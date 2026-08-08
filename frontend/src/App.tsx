import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { BoardProvider } from '@/context/BoardContext';
import { AppRoutes } from '@/routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BoardProvider>
          <AppRoutes />
        </BoardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
