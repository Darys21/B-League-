import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import styled from 'styled-components';
import AdminLogin from './components/AdminLogin';
import DraftBoard from './components/DraftBoard';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://b-league-api-production.up.railway.app:8080';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://b-league-api-production.up.railway.app:8080';

const socket = io(SOCKET_URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5
});

const AppContainer = styled.div`
  min-height: 100vh;
  background: #0f1624;
  color: #fff;
`;

const Header = styled.header`
  background: #1a2235;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DraftStatus = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
`;

const PhaseIndicator = styled.div`
  background: ${props => props.isTop12 ? '#fbbf24' : '#60a5fa'};
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
`;

const CurrentPick = styled.div`
  font-size: 1.2em;
  font-weight: 600;
`;

function App() {
  const [draftState, setDraftState] = React.useState({
    picks: [],
    teams: [],
    currentPick: 1,
    currentPhase: 'TOP12',
    isActive: false
  });

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('get_draft_state');
    });

    socket.on('draft_state', (state) => {
      setDraftState(prevState => ({
        ...prevState,
        picks: state.picks || [],
        teams: state.teams || [],
        currentPick: state.current_pick || 1,
        currentPhase: state.phase || 'TOP12',
        isActive: state.is_active || false
      }));
    });

    socket.on('pick_made', (data) => {
      setDraftState(prevState => ({
        ...prevState,
        picks: [...prevState.picks, data.pick],
        currentPick: data.next_pick,
        currentPhase: data.phase
      }));
    });

    return () => socket.close();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AppContainer>
            <Header>
              <DraftStatus>
                <PhaseIndicator isTop12={draftState.currentPhase === 'TOP12'}>
                  {draftState.currentPhase === 'TOP12' ? 'Top 12 Phase' : 'Bottom 20 Phase'}
                </PhaseIndicator>
                <CurrentPick>
                  Pick #{draftState.currentPick}
                </CurrentPick>
              </DraftStatus>
            </Header>
            
            <DraftBoard 
              picks={draftState.picks}
              teams={draftState.teams}
              currentPick={draftState.currentPick}
            />
          </AppContainer>
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
