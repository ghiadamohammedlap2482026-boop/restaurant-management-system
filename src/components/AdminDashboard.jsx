import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import { deleteReservation, getReservations, updateReservation } from '../services/api.js'

const statusOptions = ['Pending', 'Confirmed', 'Cancelled']
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

function AdminDashboard() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setReservations(await getReservations())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    getReservations()
      .then((data) => {
        if (active) {
          setReservations(data)
          setLoading(false)
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message)
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [])

  const summary = useMemo(() => ({
    total: reservations.length,
    pending: reservations.filter((item) => item.status === 'Pending').length,
    confirmed: reservations.filter((item) => item.status === 'Confirmed').length,
  }), [reservations])

  const changeStatus = async (reservation, status) => {
    setBusyId(reservation.id)
    setError('')
    try {
      const updated = await updateReservation(reservation.id, { status })
      setReservations((current) => current.map((item) => item.id === reservation.id ? updated : item))
      setSelected((current) => current?.id === reservation.id ? updated : current)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  const removeReservation = async (reservation) => {
    if (!window.confirm(`Delete the reservation for ${reservation.customer_name}? This cannot be undone.`)) return
    setBusyId(reservation.id)
    setError('')
    try {
      await deleteReservation(reservation.id)
      setReservations((current) => current.filter((item) => item.id !== reservation.id))
      setSelected((current) => current?.id === reservation.id ? null : current)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-heading">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
          <div><span className="eyebrow text-accent">Restaurant operations</span><h1>Reservations</h1><p>Review and manage upcoming guest requests.</p></div>
          <button className="btn btn-outline-dark" disabled={loading} onClick={refresh} type="button"><Icon name="refresh" /> Refresh</button>
        </div>
      </section>
      <section className="container admin-content">
        <div className="row g-3 mb-4">
          <SummaryCard label="Total reservations" value={summary.total} icon="list" />
          <SummaryCard label="Pending requests" value={summary.pending} icon="clock" />
          <SummaryCard label="Confirmed guests" value={summary.confirmed} icon="check" />
        </div>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <div className="admin-table-card">
          <div className="admin-table-heading"><div><h2>All reservations</h2><p>Requests appear here as soon as they are submitted.</p></div><span className="reservation-count">{reservations.length} {reservations.length === 1 ? 'booking' : 'bookings'}</span></div>
          {loading ? (
            <div className="admin-state" role="status"><span className="spinner-border text-secondary" aria-hidden="true" /><span>Loading reservations…</span></div>
          ) : error && reservations.length === 0 ? (
            <div className="admin-state"><Icon className="empty-state-icon" name="alert" /><h3>Couldn’t load reservations</h3><p>Check the API and database connection, then try again.</p><button className="btn btn-outline-dark mt-2" onClick={refresh} type="button">Try again</button></div>
          ) : reservations.length === 0 ? (
            <div className="admin-state"><Icon className="empty-state-icon" name="clock" /><h3>No reservations yet</h3><p>New guest requests will show up here.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle admin-table">
                <thead><tr><th scope="col">Guest</th><th scope="col">Date &amp; time</th><th scope="col">Party</th><th scope="col">Status</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr></thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td><button className="guest-name" onClick={() => setSelected(reservation)} type="button">{reservation.customer_name}</button><span className="guest-email">{reservation.email}</span></td>
                      <td>{formatDate(reservation.reservation_date)}<span className="guest-email">{formatTime(reservation.reservation_time)}</span></td>
                      <td>{reservation.party_size} {Number(reservation.party_size) === 1 ? 'guest' : 'guests'}</td>
                      <td><label className="visually-hidden" htmlFor={`status-${reservation.id}`}>Status for {reservation.customer_name}</label><select className={`form-select form-select-sm status-select status-${reservation.status.toLowerCase()}`} disabled={busyId === reservation.id} id={`status-${reservation.id}`} onChange={(event) => changeStatus(reservation, event.target.value)} value={reservation.status}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></td>
                      <td><div className="d-flex gap-2"><button aria-label={`View ${reservation.customer_name}'s reservation`} className="action-button" onClick={() => setSelected(reservation)} type="button">View</button><button aria-label={`Delete ${reservation.customer_name}'s reservation`} className="action-button action-delete" disabled={busyId === reservation.id} onClick={() => removeReservation(reservation)} type="button">Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      {selected && <ReservationDetails reservation={selected} onClose={() => setSelected(null)} />}
    </main>
  )
}

function SummaryCard({ label, value, icon }) {
  return <div className="col-md-4"><div className="summary-card"><span className="summary-icon"><Icon name={icon} /></span><span className="summary-label">{label}</span><strong>{value}</strong></div></div>
}

function ReservationDetails({ reservation, onClose }) {
  return (
    <div className="detail-backdrop" onClick={onClose} role="presentation">
      <section aria-labelledby="detail-title" aria-modal="true" className="detail-dialog" onClick={(event) => event.stopPropagation()} role="dialog">
        <button aria-label="Close reservation details" className="detail-close" onClick={onClose} type="button"><Icon name="close" /></button>
        <span className="eyebrow text-accent">Reservation #{reservation.id}</span>
        <h2 id="detail-title">{reservation.customer_name}</h2>
        <span className={`status-badge status-${reservation.status.toLowerCase()}`}>{reservation.status}</span>
        <dl className="detail-list">
          <div><dt>Email</dt><dd><a href={`mailto:${reservation.email}`}>{reservation.email}</a></dd></div>
          <div><dt>Phone</dt><dd><a href={`tel:${reservation.phone}`}>{reservation.phone}</a></dd></div>
          <div><dt>Date &amp; time</dt><dd>{formatDate(reservation.reservation_date)} at {formatTime(reservation.reservation_time)}</dd></div>
          <div><dt>Party size</dt><dd>{reservation.party_size} {Number(reservation.party_size) === 1 ? 'guest' : 'guests'}</dd></div>
          <div><dt>Notes</dt><dd>{reservation.notes || 'No special requests.'}</dd></div>
          <div><dt>Created</dt><dd>{reservation.created_at ? new Date(reservation.created_at.replace(' ', 'T')).toLocaleString() : '—'}</dd></div>
        </dl>
        <button className="btn btn-dark w-100" onClick={onClose} type="button">Done</button>
      </section>
    </div>
  )
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

function formatTime(value) {
  const [hours, minutes] = value.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default AdminDashboard
