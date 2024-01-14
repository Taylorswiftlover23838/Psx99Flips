import SideBar from './components/SideBar'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import NavBar from './components/NavBar'
import CoinFlip from './pages/CoinFlip'

function App() {
  return (
    <>
    <BrowserRouter>
    <NavBar />
      <SideBar>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/coinflip' element={<CoinFlip/>}/>
        </Routes>
      </SideBar>
    </BrowserRouter>
    </>
  );
}

export default App;
