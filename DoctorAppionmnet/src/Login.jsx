import React, { useState } from 'react'
import { Card, CardContent, TextField, Button, Grid, Box, Typography } from '@mui/material'
import { loginUser } from './utils/auth'

export default function Login({ onLogin, switchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const user = loginUser(email.trim(), password)
      onLogin(user)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card sx={{ maxWidth: 540, margin: '0 auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={submit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}

            <Grid item xs={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={switchToSignup}>Sign up</Button>
              <Button type="submit" variant="contained">Login</Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}
