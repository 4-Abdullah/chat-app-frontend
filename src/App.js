
import { Route, Routes } from 'react-router-dom';
import ChatApp from './pages/chatApp';


function App() {
    const isAuth = localStorage.getItem('username')
    console.log(isAuth)
  return (
    <div>
      <Routes>
            <Route path='/' element={<ChatApp/>}></Route>
          
    </Routes>
    </div>
  );
}

export default App;