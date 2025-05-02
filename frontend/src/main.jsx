import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const breakpoints = {
  base: '0px',
  xs: '420px',
  sm: '520px',
  md: '768px',
  lg: '960px',
  xl: '1200px',
  '2xl': '1536px',
};

const theme = extendTheme({
  colors: {
    edpPrimary: '#584BAC', // Similar to LaundriX's purple
    edpSecondary: '#CE1567', // Similar to LaundriX's red
    edpBlack: '#292929',
    edpLightPurple: '#F8EFFF',
  },
  breakpoints,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);