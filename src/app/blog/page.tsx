import NavBarComponent from '@/components/NavBarComponent'
import React from 'react'
import { Box, Container, Typography, TextField, InputAdornment, Card, CardContent, Chip, Stack } from '@mui/material'
import { Search } from '@mui/icons-material'
import FooterComponent from '@/components/FooterComponent'

const demoPosts = [
  { id: 1, title: 'How to craft a standout portfolio in 2025', tags: ['Guides', 'Design'], excerpt: 'Key principles for clarity, storytelling, and credibility.' },
  { id: 2, title: 'Measuring portfolio performance with analytics', tags: ['Analytics'], excerpt: 'Understand views, time on page, and conversion.' },
  { id: 3, title: 'Next.js + MUI: speed and style', tags: ['Engineering'], excerpt: 'Building delightful UIs fast with performance in mind.' },
  { id: 4, title: 'Networking that works', tags: ['Career'], excerpt: 'Connect with the right audience and opportunities.' },
]

function BlogPage() {
  return (
    <>
    <NavBarComponent />
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero */}
      <Box sx={{ background: 'rgba(224,224,224,0.7)', borderBottom: '1px solid #e0e0e0', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Insights & Stories</Typography>
          <Typography variant="h6" color="text.secondary">Tips on portfolios, tooling, and growth for creators and teams.</Typography>
        </Container>
      </Box>

      {/* Toolbar */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <TextField
            placeholder="Search articles"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {['All', 'Guides', 'Engineering', 'Analytics', 'Career', 'Design'].map((t) => (
              <Chip key={t} label={t} variant={t==='All' ? 'filled' : 'outlined'} color={t==='All' ? 'primary' : undefined} />
            ))}
          </Stack>
        </Stack>
      </Container>

      {/* Posts */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {demoPosts.map((post) => (
            <Box key={post.id} sx={{ flex: '1 1 280px', minWidth: 0 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    {post.tags.map((tg) => (<Chip key={tg} size="small" label={tg} variant="outlined" />))}
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{post.title}</Typography>
                  <Typography color="text.secondary">{post.excerpt}</Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      <FooterComponent />
    </Box>
    </>
  )
}

export default BlogPage