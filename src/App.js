import {Routes, Route, BrowserRouter} from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home'
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
              <Route path='/lists/:id' element={(<div>Lists</div>)} />
              <Route path='/lists/new' element={(<div>New</div>)} />
              <Route path='/settings' element={(<div>Settings</div>)} />
              <Route path='*' element={(<div>Not found</div>)} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;