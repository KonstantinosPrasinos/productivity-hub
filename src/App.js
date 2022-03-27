import {Routes, Route, BrowserRouter, Navigate} from 'react-router-dom';
import NavBar from './components/navbar/NavBar';
import Home from './components/home/Home'
import Settings from './components/settings/Settings'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GroupDetails from './components/groups/GroupDetails';
import NewGroup from './components/groups/NewGroup';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff'
    },
    secondary: {
      main: '#43A047'
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <div className='App'>
          <NavBar />
          <div className='content'>
            <Routes>
              <Route exact path='/' element={<Home />} />
              <Route exact path='/home' element={<Navigate to='/' />} />
              <Route path='/lists' element={(<div>Lists</div>)} />
              <Route path='/lists/:id' element={<GroupDetails />} />
              <Route path='/lists/new' element={<NewGroup />} />
              <Route path='/settings' element={<Settings />} />
              <Route path='*' element={(<div>Not found</div>)} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;