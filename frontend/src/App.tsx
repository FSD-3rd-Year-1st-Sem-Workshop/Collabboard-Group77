import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { BoardProvider } from '../src/context/BoardContext';
import { AppRoutes } from '../src/routes/AppRoutes';

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
