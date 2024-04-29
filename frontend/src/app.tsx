import React from 'react';
import { ChakraProvider, Box, Grid, theme } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/dashboard';
import { Analyses } from './pages/analyses';
import { Sidebar } from './components/sidebar';

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box textAlign="center" fontSize="xl">
          <Grid minH="100vh" p={3}>
            <Sidebar>
              <Routes>
                <Route path="" element={<Dashboard />} />
                <Route path="/analyses" element={<Analyses />} />
              </Routes>
            </Sidebar>
          </Grid>
        </Box>
      </Router>
    </ChakraProvider>
  );
};
