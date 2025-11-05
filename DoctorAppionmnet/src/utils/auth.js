const USERS_KEY = 'doctor_app_users_v1'
const SESSION_KEY = 'doctor_app_current_user_v1'

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('loadUsers', e)
    return []
  }
}

function saveUsers(list) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('saveUsers', e)
  }
}

export function registerUser({ name, phone, email, password, role, doctorId, department }) {
  const users = loadUsers()
  if (users.find((u) => u.email === email)) {
    throw new Error('Email already registered')
  }
  const user = {
    id: Date.now().toString(),
    name,
    phone,
    email,
    password, // NOTE: plain text for demo only
    role,
    doctorId: doctorId || null,
    department: department || null,
  }
  users.push(user)
  saveUsers(users)
  setCurrentUser(user)
  return user
}

export function loginUser(email, password) {
  const users = loadUsers()
  const u = users.find((x) => x.email === email && x.password === password)
  if (!u) throw new Error('Invalid credentials')
  setCurrentUser(u)
  return u
}

export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (e) {
    console.error('logout', e)
  }
}

export function setCurrentUser(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch (e) {
    console.error('setCurrentUser', e)
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.error('getCurrentUser', e)
    return null
  }
}

export function getAllUsers() {
  return loadUsers()
}
