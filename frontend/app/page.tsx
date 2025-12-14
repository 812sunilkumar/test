'use client';

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Nevo Test Drive Demo
        </Typography>
        <Link href="/booktestdrive">
          <Button variant="contained" size="large">
            Book Test Drive
          </Button>
        </Link>
      </Box>
    </Container>
  );
}

