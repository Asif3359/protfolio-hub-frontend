import NavBarComponent from '@/components/NavBarComponent'
import React from 'react'
import { Box, Container, Typography, TextField, Button, Stack, Card, CardContent } from '@mui/material'

function ContactPage() {
  return (
    <>
    <NavBarComponent />
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero */}
      <Box sx={{ background: 'rgba(224,224,224,0.7)', borderBottom: '1px solid #e0e0e0', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Contact Us</Typography>
          <Typography variant="h6" color="text.secondary">We&apos;d love to hear from you. Reach out with questions or feedback.</Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Full Name" fullWidth required />
                  <TextField label="Email" type="email" fullWidth required />
                </Stack>
                <TextField label="Subject" fullWidth />
                <TextField label="Message" fullWidth multiline minRows={5} />
                <Stack direction="row" justifyContent="flex-end">
                  <Button variant="outlined" sx={{ color: 'primary.main' }}>Send Message</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Other ways to reach us</Typography>
            <Typography color="text.secondary">Email: support@portfoliohub.com • Location: Dhaka, Bangladesh</Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
    </>
  )
}

export default ContactPage