import React, { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  TextField,
  MenuItem,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Box,
} from '@mui/material'
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

const DOCTORS = [
  { value: 'Dr. Rao', label: 'Dr. Rao – Cardiology', dept: 'Cardiology' },
  { value: 'Dr. Meera', label: 'Dr. Meera – Dermatology', dept: 'Dermatology' },
  { value: 'Dr. Arjun', label: 'Dr. Arjun – Pediatrics', dept: 'Pediatrics' },
]

const DEPARTMENTS = ['Cardiology', 'Dermatology', 'Pediatrics', 'General Medicine']

function isValidEmail(email) {
  // simple regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function initialState() {
  return {
    patientName: '',
    phone: '',
    email: '',
    doctor: '',
    department: '',
    date: null,
    time: null,
    visitType: 'New',
    notes: '',
    consent: false,
  }
}

export default function Form({ initial = null, onSubmit, onCancelEdit, currentUser = null }) {
  const [fields, setFields] = useState(initial ? mapInitial(initial) : initialState())
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFields(initial ? mapInitial(initial) : initialState())
    setErrors({})
  }, [initial])

  function mapInitial(init) {
    return {
      patientName: init.patientName || '',
      phone: init.phone || '',
      email: init.email || '',
      doctor: init.doctor || '',
      department: init.department || '',
      date: init.date ? dayjs(init.date) : null,
      time: init.time ? dayjs(init.time) : null,
      visitType: init.visitType || 'New',
      notes: init.notes || '',
      consent: !!init.consent,
      id: init.id,
    }
  }

  const isFutureDate = (d) => {
    if (!d) return false
    return d.endOf('day').isAfter(dayjs())
  }

  const isTimeInRange = (t) => {
    if (!t) return false
    const h = t.hour()
    const m = t.minute()
    const minutes = h * 60 + m
    const start = 9 * 60
    const end = 17 * 60
    return minutes >= start && minutes <= end
  }

  function validate() {
    const e = {}
    if (!fields.patientName.trim()) e.patientName = 'Patient name is required'
    if (!/^[0-9]{10}$/.test(fields.phone)) e.phone = 'Enter a valid 10-digit phone'
    if (fields.email && !isValidEmail(fields.email)) e.email = 'Invalid email'
    if (!fields.doctor) e.doctor = 'Select a doctor'
    if (!fields.department) e.department = 'Select a department'
    if (!fields.date) e.date = 'Select a date'
    else if (!isFutureDate(fields.date)) e.date = 'Date must be in the future'
    if (!fields.time) e.time = 'Select a time'
    else if (!isTimeInRange(fields.time)) e.time = 'Time must be between 09:00 and 17:00'
    if (!fields.consent) e.consent = 'You must agree to clinic policies'
    if (fields.notes && fields.notes.length > 200) e.notes = 'Max 200 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const canSubmit = useMemo(() => {
    // quick check for required presence (not full validation)
    return (
      fields.patientName.trim() &&
      /^[0-9]{10}$/.test(fields.phone) &&
      fields.doctor &&
      fields.department &&
      fields.date &&
      fields.time &&
      fields.consent
    )
  }, [fields])

  function handleChange(name, value) {
    setFields((f) => ({ ...f, [name]: value }))
    setErrors((s) => ({ ...s, [name]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    // combine date & time into ISO strings
    const dateISO = fields.date ? fields.date.startOf('day').toISOString() : null
    // combine date's date with time's hours/minutes
    let dateTime = null
    if (fields.date && fields.time) {
      const combined = fields.date
        .hour(fields.time.hour())
        .minute(fields.time.minute())
        .second(0)
        .millisecond(0)
      dateTime = combined.toISOString()
    }

    const payload = {
      id: fields.id,
      patientName: fields.patientName.trim(),
      phone: fields.phone,
      email: fields.email.trim(),
      doctor: fields.doctor,
      department: fields.department,
      date: fields.date ? fields.date.toISOString() : null,
      time: fields.time ? fields.time.toISOString() : null,
      visitType: fields.visitType,
      notes: fields.notes.trim(),
      consent: fields.consent,
      createdBy: currentUser ? currentUser.id : null,
      dateTime,
    }

    onSubmit(payload)
    setFields(initialState())
    setErrors({})
  }

  function handleReset() {
    setFields(initialState())
    setErrors({})
    if (onCancelEdit) onCancelEdit()
  }

  return (
    <Card elevation={3} sx={{ mb: 2 }} component="form" onSubmit={handleSubmit}>
      <CardContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Patient Name"
                value={fields.patientName}
                onChange={(e) => handleChange('patientName', e.target.value)}
                required
                fullWidth
                error={!!errors.patientName}
                helperText={errors.patientName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Phone Number"
                value={fields.phone}
                onChange={(e) => handleChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
                required
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone || '10 digits'}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                value={fields.email}
                onChange={(e) => handleChange('email', e.target.value)}
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.doctor}>
                <InputLabel id="doctor-label">Doctor</InputLabel>
                <Select
                  labelId="doctor-label"
                  value={fields.doctor}
                  label="Doctor"
                  onChange={(e) => {
                    const val = e.target.value
                    handleChange('doctor', val)
                    // auto set department based on doctor
                    const found = DOCTORS.find((d) => d.value === val)
                    if (found) handleChange('department', found.dept)
                  }}
                >
                  {DOCTORS.map((d) => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.doctor && <Box sx={{ color: 'error.main', mt: 0.5 }}>{errors.doctor}</Box>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel id="dept-label">Department</InputLabel>
                <Select
                  labelId="dept-label"
                  value={fields.department}
                  label="Department"
                  onChange={(e) => handleChange('department', e.target.value)}
                >
                  {DEPARTMENTS.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && <Box sx={{ color: 'error.main', mt: 0.5 }}>{errors.department}</Box>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Appointment Date"
                value={fields.date}
                onChange={(v) => handleChange('date', v)}
                slotProps={{ textField: { fullWidth: true, error: !!errors.date, helperText: errors.date } }}
                minDate={dayjs().add(1, 'day')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TimePicker
                label="Appointment Time"
                value={fields.time}
                onChange={(v) => handleChange('time', v)}
                slotProps={{ textField: { fullWidth: true, error: !!errors.time, helperText: errors.time } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Visit Type</FormLabel>
                <RadioGroup
                  row
                  value={fields.visitType}
                  onChange={(e) => handleChange('visitType', e.target.value)}
                >
                  <FormControlLabel value="New" control={<Radio />} label="New" />
                  <FormControlLabel value="Follow-up" control={<Radio />} label="Follow-up" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Symptoms / Notes"
                value={fields.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                fullWidth
                multiline
                rows={3}
                error={!!errors.notes}
                helperText={errors.notes || `${fields.notes.length}/200`}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={fields.consent} onChange={(e) => handleChange('consent', e.target.checked)} />}
                label="I agree to clinic policies"
              />
              {errors.consent && <Box sx={{ color: 'error.main', mt: 0.5 }}>{errors.consent}</Box>}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                {initial && (
                  <Button variant="outlined" onClick={handleReset}>
                    Cancel
                  </Button>
                )}
                <Button variant="contained" color="secondary" onClick={handleReset}>
                  Reset
                </Button>
                <Button type="submit" variant="contained" disabled={!canSubmit}>
                  {initial ? 'Update' : 'Submit'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </CardContent>
    </Card>
  )
}
