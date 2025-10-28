import NavBarComponent from '@/components/NavBarComponent'
import React from 'react'
import { Box, Container, Typography, Avatar, Chip, Card, CardContent, Stack, Divider, Button } from '@mui/material'
import FooterComponent from '@/components/FooterComponent'

function AboutPage() {
  return (
    <>
    <NavBarComponent />
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero */}
      <Box sx={{ background: 'rgba(224,224,224,0.7)', borderBottom: '1px solid #e0e0e0', py: 8 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" justifyContent="space-between">
            <Box sx={{ flex: '1 1 520px' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 , color: 'primary.main' }}>About Portfolio Hub</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Build a professional portfolio without coding—just fill simple forms, choose a theme, and publish.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {['Next.js', 'TypeScript', 'MUI', 'Analytics', 'Networking'].map((t) => (
                  <Chip key={t} label={t} variant="outlined" />
                ))}
              </Stack>
            </Box>
            <Box sx={{ flex: '1 1 360px', textAlign: 'center' }}>
              <Avatar src="/project.jpg" alt="Portfolio Hub" sx={{ width: 200, height: 200, mx: 'auto', boxShadow: 3 }} />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Mission / Values */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={3}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>Our Mission</Typography>
          <Typography color="text.secondary">
            We help users craft professional portfolios, showcase projects, and connect with opportunities. Our platform blends simplicity with powerful features like analytics and collaboration, making your work stand out.
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {[
              { title: 'User‑First Design', body: 'Clean, fast, and accessible experiences that convert.' },
              { title: 'Insights that Matter', body: 'Built‑in analytics to understand audience engagement.' },
              { title: 'Community & Growth', body: 'Tools that help you network and get discovered.' },
            ].map((card) => (
              <Card key={card.title} sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{card.title}</Typography>
                  <Typography color="text.secondary">{card.body}</Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Divider />

          {/* How it works */}
          <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>How It Works</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {[
                { step: '1', title: 'Fill Forms', body: 'Add your projects, experience, education, and skills with guided forms.' },
                { step: '2', title: 'Pick a Theme', body: 'Choose a clean, professional template that fits your style.' },
                { step: '3', title: 'Publish & Share', body: 'Go live in minutes and share your unique link anywhere.' },
              ].map((s) => (
                <Card key={s.step} sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="overline" color="primary">Step {s.step}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{s.title}</Typography>
                    <Typography color="text.secondary">{s.body}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Built for Creators, Teams, and Businesses</Typography>
            <Typography color="text.secondary">
              Whether you are a student, freelancer, or company, Portfolio Hub provides flexible building blocks to craft your brand and tell your story.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" sx={{ color: 'primary.main' }}>Explore Features</Button>
              <Button variant="outlined" sx={{ color: 'primary.main' }}>See Examples</Button>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      <FooterComponent />
    </Box>
    </>
  )
}

export default AboutPage