import React, { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Box,
  Typography,
} from '@mui/material'
import { registerUser } from './utils/auth'

const DOCTORS = [
  { value: 'Dr. Rao', label: 'Dr. Rao – Cardiology', dept: 'Cardiology' },
  { value: 'Dr. Meera', label: 'Dr. Meera – Dermatology', dept: 'Dermatology' },
  { value: 'Dr. Arjun', label: 'Dr. Arjun – Pediatrics', dept: 'Pediatrics' },
]

export default function Signup({ onSignup, switchToLogin }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient')
  const [doctorId, setDoctorId] = useState('')
  const [error, setError] = useState('')

  const department = useMemo(() => {
    const d = DOCTORS.find((x) => x.value === doctorId)
    return d ? d.dept : ''
  }, [doctorId])

  function validate() {
    if (!name.trim()) throw new Error('Name required')
    if (!/^[0-9]{10}$/.test(phone)) throw new Error('Phone must be 10 digits')
    if (!email.includes('@')) throw new Error('Valid email required')
    if (password.length < 4) throw new Error('Password too short')
    if (role === 'doctor' && !doctorId) throw new Error('Select doctor identity')
  }

  function submit(e) {
    e.preventDefault()
    setError('')
    try {
      validate()
      const user = registerUser({ name, phone, email, password, role, doctorId, department })
      onSignup(user)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card sx={{ maxWidth: 640, margin: '0 auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sign up
        </Typography>

        <Box component="form" onSubmit={submit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} fullWidth required inputProps={{ maxLength: 10 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
            </Grid>

            <Grid item xs={12}>
              <FormLabel component="legend">Role</FormLabel>
              <RadioGroup row value={role} onChange={(e) => setRole(e.target.value)}>
                <FormControlLabel value="patient" control={<Radio />} label="Patient" />
                <FormControlLabel value="doctor" control={<Radio />} label="Doctor" />
              </RadioGroup>
            </Grid>

            {role === 'doctor' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="sel-doc">Doctor identity</InputLabel>
                  <Select labelId="sel-doc" value={doctorId} label="Doctor identity" onChange={(e) => setDoctorId(e.target.value)}>
                    {DOCTORS.map((d) => (
                      <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}

            <Grid item xs={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={switchToLogin}>Login</Button>
              <Button type="submit" variant="contained">Sign up</Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}
