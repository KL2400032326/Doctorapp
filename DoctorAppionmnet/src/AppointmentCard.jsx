import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CancelIcon from '@mui/icons-material/Cancel'
import dayjs from 'dayjs'

export default function AppointmentCard({ appointment, onEdit, onCancel }) {
  const [open, setOpen] = useState(false)

  const dateTime = appointment.dateTime
    ? dayjs(appointment.dateTime)
    : appointment.date
    ? dayjs(appointment.date)
    : null

  return (
    <Card
      elevation={2}
      sx={{
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 },
      }}
    >
      <CardHeader title={`${appointment.doctor}`} subheader={`${appointment.department}`} />

      <CardContent>
        <Typography variant="body2" color="text.secondary">
          <strong>Date:</strong>{' '}
          {dateTime ? dateTime.format('DD MMM YYYY') : '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Time:</strong> {dateTime ? dateTime.format('HH:mm') : '—'}
        </Typography>
        <Typography sx={{ mt: 1 }}>
          <strong>Patient:</strong> {appointment.patientName}
        </Typography>
        <Typography>
          <strong>Phone:</strong> {appointment.phone}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={appointment.visitType || 'New'} color="primary" size="small" />
          <Chip label={appointment.status || 'Booked'} color="success" size="small" />
        </Box>
      </CardContent>

      <CardActions>
        <IconButton size="small" onClick={onEdit} aria-label="edit">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => setOpen(true)} aria-label="cancel">
          <CancelIcon fontSize="small" />
        </IconButton>
      </CardActions>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Cancel appointment?</DialogTitle>
        <DialogContent>Are you sure you want to cancel this appointment?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>No</Button>
          <Button
            color="error"
            onClick={() => {
              setOpen(false)
              onCancel()
            }}
          >
            Yes, cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
