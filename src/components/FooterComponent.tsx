import { Box, Button, Container, Typography } from '@mui/material'
import React from 'react'

function FooterComponent() {
  return (
    <Box
    sx={{
      background: "black",
      color: "white",
      py: 8
    }}
  >
    <Container maxWidth="md">
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h3"
          component="h2"
          sx={{ fontWeight: 600, mb: 2 }}
        >
          Start Free — No Code Needed
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Create a professional portfolio by filling forms. Choose a theme and go live in minutes.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: "white",
            color: "primary.main",
            px: 4,
            py: 1.5,
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          Create Your Portfolio
        </Button>
      </Box>
    </Container>
  </Box>
  )
}

export default FooterComponent