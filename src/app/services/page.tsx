import NavBarComponent from '@/components/NavBarComponent'
import React from 'react'
import { Box, Container, Typography, Card, CardContent, Stack, Button, Chip } from '@mui/material'
import FooterComponent from '@/components/FooterComponent'

const plans = [
  { name: 'Starter', price: 'Free', features: ['Basic portfolio', 'Public profile', 'Community access'] },
  { name: 'Pro', price: '$9/mo', features: ['Custom domain', 'Advanced analytics', 'Priority support'] },
  { name: 'Team', price: '$29/mo', features: ['Team collaboration', 'Role management', 'SLA support'] },
]

function ServicePage() {
  return (
    <>
    <NavBarComponent />
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero */}
      <Box sx={{ background: 'rgba(224,224,224,0.7)', borderBottom: '1px solid #e0e0e0', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Services & Pricing</Typography>
          <Typography variant="h6" color="text.secondary">Flexible plans for individuals, professionals, and teams.</Typography>
        </Container>
      </Box>

      {/* Offerings */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>What you get</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {[
              { title: 'Portfolio Builder', desc: 'Drag‑and‑drop sections, themes, and custom domains.' },
              { title: 'Skill Testing', desc: 'Assess and display your verified skills and badges.' },
              { title: 'Analytics', desc: 'Track views, engagement, and conversions with insights.' },
            ].map((o) => (
              <Card key={o.title} sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{o.title}</Typography>
                  <Typography color="text.secondary">{o.desc}</Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Container>

      {/* Plans */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {plans.map((p) => (
            <Card key={p.name} sx={{ flex: 1, borderColor: p.name==='Pro' ? 'primary.main' : undefined, borderWidth: p.name==='Pro' ? 1 : 0, borderStyle: p.name==='Pro' ? 'solid' : 'none' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                    {p.name==='Pro' && <Chip size="small" color="primary" label="Popular" />}
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{p.price}</Typography>
                  <Stack spacing={1}>
                    {p.features.map((f) => (<Typography key={f} color="text.secondary">• {f}</Typography>))}
                  </Stack>
                  <Button variant="outlined" sx={{ color: 'primary.main', mt: 1 }}>Choose {p.name}</Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>

      <FooterComponent />
    </Box>
    </>
  )
}

export default ServicePage