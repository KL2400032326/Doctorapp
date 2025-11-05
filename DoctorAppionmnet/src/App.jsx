import React, { useEffect, useState } from 'react'
import './App.css'
import './index.css'
import { Container, Typography, Grid, Box, Snackbar, Alert, Button, AppBar, Toolbar } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Form from './Form'
import AppointmentCard from './AppointmentCard'
import { loadAppointments, saveAppointments } from './utils/storage'
import { getCurrentUser, logout } from './utils/auth'
import Login from './Login'
import Signup from './Signup'

function App() {
  const [appointments, setAppointments] = useState([])
  const [editing, setEditing] = useState(null)
  const [snack, setSnack] = useState({ open: false, message: '' })
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [authView, setAuthView] = useState(null) // 'login'|'signup'|null

  const theme = createTheme({
    palette: {
      primary: { main: '#4caf50' },
      secondary: { main: '#2e7d32' },
    },
  })

  useEffect(() => {
    const loaded = loadAppointments() || []
    setAppointments(loaded)
  }, [])

  useEffect(() => {
    saveAppointments(appointments)
  }, [appointments])

  function handleCreate(appt) {
    // If editing existing, replace
    if (appt.id) {
      setAppointments((prev) => prev.map((a) => (a.id === appt.id ? appt : a)))
      setSnack({ open: true, message: 'Appointment updated' })
      setEditing(null)
      return
    }
    const newAppt = { ...appt, id: Date.now(), status: 'Booked' }
    setAppointments((prev) => [newAppt, ...prev])
    setSnack({ open: true, message: 'Appointment booked' })
  }

  function handleDelete(id) {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    setSnack({ open: true, message: 'Appointment canceled' })
    if (editing && editing.id === id) setEditing(null)
  }

  function handleEdit(appt) {
    setEditing(appt)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleLogout() {
    logout()
    setCurrentUser(null)
  }

  function handleLogin(user) {
    setCurrentUser(user)
    setAuthView(null)
  }

  function handleSignup(user) {
    setCurrentUser(user)
    setAuthView(null)
  }

  return (
    <ThemeProvider theme={theme}>
      <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Clinic Scheduler
          </Typography>
          {currentUser ? (
            <>
              <Typography sx={{ mr: 2 }}>{currentUser.name} ({currentUser.role})</Typography>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => setAuthView('login')}>Login</Button>
              <Button color="inherit" onClick={() => setAuthView('signup')}>Sign up</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {!currentUser && authView === 'login' && (
          <Login onLogin={handleLogin} switchToSignup={() => setAuthView('signup')} />
        )}

        {!currentUser && authView === 'signup' && (
          <Signup onSignup={handleSignup} switchToLogin={() => setAuthView('login')} />
        )}

        {!currentUser && !authView && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h5" gutterBottom>Welcome — please login or sign up to manage appointments</Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
              <Button variant="contained" onClick={() => setAuthView('login')}>Login</Button>
              <Button variant="outlined" onClick={() => setAuthView('signup')}>Sign up</Button>
            </Box>
          </Box>
        )}

        {currentUser && (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Book Appointment
            </Typography>

            <Form
              key={editing ? editing.id : 'new'}
              initial={editing}
              onSubmit={handleCreate}
              onCancelEdit={() => setEditing(null)}
              currentUser={currentUser}
            />

            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Upcoming Appointments
              </Typography>

              <Grid container spacing={2}>
                {appointments.length === 0 && (
                  <Grid item xs={12}>
                    <Typography color="text.secondary">No appointments yet.</Typography>
                  </Grid>
                )}

                {appointments
                  .filter((a) => {
                    if (currentUser.role === 'patient') return a.createdBy === currentUser.id
                    if (currentUser.role === 'doctor') return a.doctor === currentUser.doctorId
                    return true
                  })
                  .map((a) => (
                    <Grid key={a.id} item xs={12} sm={6} md={4}>
                      <AppointmentCard
                        appointment={a}
                        onEdit={() => handleEdit(a)}
                        onCancel={() => handleDelete(a.id)}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          </>
        )}

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity="success" sx={{ width: '100%' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
      </>
    </ThemeProvider>
  )
}

export default App
