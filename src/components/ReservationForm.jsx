import { useState } from 'react'
import Icon from './Icon.jsx'
import { createReservation } from '../services/api.js'

const emptyForm = {
  customer_name: '',
  email: '',
  phone: '',
  reservation_date: '',
  reservation_time: '',
  party_size: '2',
  notes: '',
}

function ReservationForm() {
  const [form, setForm] = useState(emptyForm)
  const [state, setState] = useState({ loading: false, message: '', error: false })
  const [submittedForm, setSubmittedForm] = useState(null)
  const minimumDate = new Date().toLocaleDateString('en-CA')

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    if (state.error) setState({ loading: false, message: '', error: false })
  }

  const submit = async (event) => {
    event.preventDefault()
    setState({ loading: true, message: '', error: false })
    try {
      const result = await createReservation({ ...form, party_size: Number(form.party_size) })
      setState({ loading: false, message: result.message || 'Your request is in! We’ll be in touch to confirm.', error: false })
      setSubmittedForm(form)
      setForm(emptyForm)
    } catch (error) {
      setState({ loading: false, message: error.message, error: true })
    }
  }

  const startAnotherRequest = () => {
    setSubmittedForm(null)
    setState({ loading: false, message: '', error: false })
  }

  return (
    <section className="reservation-section section-space" id="reservation">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-5 reservation-intro">
            <span className="eyebrow text-accent">We saved you a seat</span>
            <h2 className="display-heading">Good things<br />start with a table.</h2>
            <p>Pick a date and tell us a little about your visit. We’ll personally follow up to confirm your table.</p>
            <div className="booking-steps" aria-label="How reservations work">
              <div className="booking-step"><span className="booking-step-number">01</span><div><strong>Choose your moment</strong><span>Date, time and party size</span></div></div>
              <div className="booking-step"><span className="booking-step-number">02</span><div><strong>We’ll take it from here</strong><span>Our team will confirm with you</span></div></div>
            </div>
            <div className="reservation-contact-card">
              <span className="reservation-contact-label">Come on in</span>
              <div className="reservation-info"><Icon name="clock" /><span>Tuesday – Sunday<br />11:30 am – 10:00 pm</span></div>
              <div className="reservation-info"><Icon name="map-pin" /><span>18 Garden Lane<br />Brooklyn, NY 11211</span></div>
              <a href="tel:+12125550148">(212) 555-0148</a>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="reservation-panel">
              <div className="reservation-panel-heading">
                <span className="eyebrow text-accent">Make it yours</span>
                <h3>{submittedForm ? 'Your request is on its way.' : 'Request your table'}</h3>
                <p>{submittedForm ? 'We can’t wait to welcome you.' : 'A few details and we’ll get the ball rolling.'}</p>
              </div>
              {submittedForm ? (
                <div className="booking-success" role="status">
                  <span className="booking-success-icon"><Icon name="check" /></span>
                  <h4>You’re one step closer to dinner.</h4>
                  <p>{state.message}</p>
                  <div className="booking-summary">
                    <strong>{new Date(`${submittedForm.reservation_date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
                    <span>{new Date(`2000-01-01T${submittedForm.reservation_time}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {submittedForm.party_size} {Number(submittedForm.party_size) === 1 ? 'guest' : 'guests'}</span>
                  </div>
                  <button className="btn btn-outline-dark" onClick={startAnotherRequest} type="button">Make another request</button>
                </div>
              ) : (
                <form className="reservation-form" onSubmit={submit}>
                  <div className="reservation-form-group">
                    <span className="reservation-form-kicker">First, the details</span>
                    <div className="row g-3">
                      <div className="col-md-6"><label className="form-label" htmlFor="reservation_date">Date</label><input className="form-control" id="reservation_date" min={minimumDate} name="reservation_date" onChange={updateField} required type="date" value={form.reservation_date} /></div>
                      <div className="col-md-6"><label className="form-label" htmlFor="reservation_time">Time</label><input className="form-control" id="reservation_time" name="reservation_time" onChange={updateField} required type="time" value={form.reservation_time} /></div>
                      <div className="col-md-6"><label className="form-label" htmlFor="party_size">Party size</label><select className="form-select" id="party_size" name="party_size" onChange={updateField} required value={form.party_size}>{Array.from({ length: 12 }, (_, index) => index + 1).map((size) => <option key={size} value={size}>{size} {size === 1 ? 'guest' : 'guests'}</option>)}</select></div>
                    </div>
                  </div>
                  <div className="reservation-form-group">
                    <span className="reservation-form-kicker">And who we’re welcoming</span>
                    <div className="row g-3">
                      <div className="col-md-6"><label className="form-label" htmlFor="customer_name">Your name</label><input autoComplete="name" className="form-control" id="customer_name" maxLength="100" name="customer_name" onChange={updateField} required value={form.customer_name} /></div>
                      <div className="col-md-6"><label className="form-label" htmlFor="email">Email address</label><input autoComplete="email" className="form-control" id="email" maxLength="254" name="email" onChange={updateField} required type="email" value={form.email} /></div>
                      <div className="col-md-6"><label className="form-label" htmlFor="phone">Phone number</label><input autoComplete="tel" className="form-control" id="phone" maxLength="30" name="phone" onChange={updateField} required type="tel" value={form.phone} /></div>
                      <div className="col-12"><label className="form-label" htmlFor="notes">Anything we should know? <span className="optional-label">Optional</span></label><textarea className="form-control" id="notes" maxLength="1000" name="notes" onChange={updateField} placeholder="A special occasion, dietary notes…" rows="3" value={form.notes} /></div>
                    </div>
                  </div>
                  {state.error && <div className="alert alert-danger mt-4 mb-0" role="alert">{state.message}</div>}
                  <button className="btn btn-dark btn-lg reservation-submit" disabled={state.loading} type="submit">
                    {state.loading ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Sending your request…</> : <>Request a reservation <Icon name="arrow-up-right" /></>}
                  </button>
                  <p className="form-disclaimer">Your table is pending until confirmed by our team. No payment required.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReservationForm
