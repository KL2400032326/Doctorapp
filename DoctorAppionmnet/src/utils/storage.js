const KEY = 'doctor_app_appointments_v1'

export function loadAppointments() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (e) {
    console.error('loadAppointments error', e)
    return []
  }
}

export function saveAppointments(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch (e) {
    console.error('saveAppointments error', e)
  }
}
