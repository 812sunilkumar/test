import React from 'react';
import TestDriveWidget from '../components/TestDriveWidget';
import { Container } from '@mui/material';

export default function Home() {
  return (
    <Container sx={{py:4}}>
      <h1>Nevo Test Drive Demo</h1>
      <TestDriveWidget />
    </Container>
  );
}
