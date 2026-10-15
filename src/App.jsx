import { useEffect, useState } from 'react'
import AdminDashboard from './components/AdminDashboard.jsx'
import Footer from './components/Footer.jsx'
import Icon from './components/Icon.jsx'
import Navbar from './components/Navbar.jsx'
import ReservationForm from './components/ReservationForm.jsx'
import { menuItems } from './data/menuItems.js'
import './App.css'

function App() {
  const [page, setPage] = useState(window.location.hash.slice(1) || 'home')

  useEffect(() => {
    const syncPage = () => setPage(window.location.hash.slice(1) || 'home')
    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  const navigate = (target) => {
    window.location.hash = target
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showReservationForm = () => {
    if (page === 'admin') {
      navigate('home')
      window.setTimeout(() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' }), 0)
      return
    }
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Navbar page={page} navigate={navigate} onReserve={showReservationForm} />
      {page === 'admin' ? (
        <AdminDashboard />
      ) : page === 'menu' ? (
        <MenuPage onReserve={showReservationForm} />
      ) : (
        <HomePage onReserve={showReservationForm} />
      )}
      {page !== 'admin' && <ReservationForm />}
      <Footer navigate={navigate} onReserve={showReservationForm} />
    </>
  )
}

function HomePage({ onReserve }) {
  return (
    <main>
      <section className="hero-section">
        <div className="container hero-content">
          <div className="row align-items-center g-5 hero-layout">
            <div className="col-lg-7 hero-copy">
              <span className="eyebrow">A little taste of somewhere special</span>
              <h1>Good food.<br />Good company.</h1>
              <p>Seasonal ingredients, thoughtful cooking, and a table waiting just for you.</p>
              <div className="d-flex flex-wrap gap-3">
                <button className="btn btn-accent btn-lg" onClick={onReserve} type="button">
                  Reserve a table <Icon name="arrow-up-right" />
                </button>
                <a className="btn btn-outline-light btn-lg" href="#menu">Explore the menu</a>
              </div>
              <div className="hero-note"><span className="status-dot" /> Open today <span>·</span> 11:30 AM – 10:00 PM</div>
            </div>
            <div className="col-lg-5 hero-visual">
              <figure className="hero-dish-card">
                <img
                  alt="Freshly prepared roasted salmon served with seasonal greens"
                  className="hero-dish-image"
                  src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=85"
                />
                <figcaption className="hero-dish-caption">
                  <span>From our kitchen</span>
                  <strong>Made with the season.</strong>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-section section-space">
        <div className="container">
          <div className="row align-items-end g-4">
            <div className="col-lg-7">
              <span className="eyebrow text-accent">Welcome to Olive &amp; Thyme</span>
              <h2 className="display-heading">A neighborhood table<br />with a world of flavor.</h2>
            </div>
            <div className="col-lg-4 offset-lg-1">
              <p className="body-copy">We believe a memorable meal starts with honest ingredients and ends with one more story around the table. Come as you are; stay a little longer.</p>
              <a className="text-link" href="#menu">Discover our menu <Icon name="arrow-up-right" /></a>
            </div>
          </div>
          <div className="welcome-image mt-5" role="img" aria-label="A welcoming, sunlit restaurant dining room">
            <span>Gather around</span>
          </div>
        </div>
      </section>

      <MenuHighlights onReserve={onReserve} />
      <ReservationTeaser onReserve={onReserve} />
    </main>
  )
}

function MenuPage({ onReserve }) {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const categories = ['All', ...new Set(menuItems.map((item) => item.category))]
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category
    const matchesSearch = `${item.name} ${item.description} ${item.category}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main>
      <section className="page-banner">
        <div className="container">
          <span className="eyebrow text-accent">From our kitchen</span>
          <h1>Made to be savored.</h1>
          <p>A seasonal menu, rooted in the good stuff.</p>
        </div>
      </section>
      <section className="section-space menu-page">
        <div className="container">
          <div className="menu-controls d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
            <div className="category-list" aria-label="Filter menu by category">
              {categories.map((item) => (
                <button
                  aria-pressed={category === item}
                  className={`category-button${category === item ? ' active' : ''}`}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="search-field">
              <span className="visually-hidden">Search menu</span>
              <Icon name="search" />
              <input onChange={(event) => setSearch(event.target.value)} placeholder="Find a dish" value={search} />
            </label>
          </div>
          {filteredItems.length ? (
            <div className="row g-4">
              {filteredItems.map((item) => <div className="col-sm-6 col-lg-4" key={item.name}><MenuCard item={item} /></div>)}
            </div>
          ) : (
            <div className="empty-menu text-center py-5">
              <h2>No dishes found</h2>
              <p>Try another search or category.</p>
            </div>
          )}
          <div className="menu-callout mt-5">
            <div><span className="eyebrow text-accent">Your table is waiting</span><h2>Make an evening of it.</h2></div>
            <button className="btn btn-dark btn-lg" onClick={onReserve} type="button">Book a table <Icon name="arrow-up-right" /></button>
          </div>
        </div>
      </section>
    </main>
  )
}

function MenuHighlights({ onReserve }) {
  return (
    <section className="menu-highlight-section section-space">
      <div className="container">
        <div className="section-heading d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
          <div><span className="eyebrow text-accent">A few favorites</span><h2 className="display-heading">Fresh from the kitchen.</h2></div>
          <a className="text-link" href="#menu">View full menu <Icon name="arrow-up-right" /></a>
        </div>
        <div className="row g-4 mt-2">
          {menuItems.map((item) => <div className="col-md-4" key={item.name}><MenuCard item={item} /></div>)}
        </div>
        <div className="text-center mt-5"><button className="btn btn-outline-dark btn-lg" onClick={onReserve} type="button">Save me a seat <Icon name="arrow-up-right" /></button></div>
      </div>
    </section>
  )
}

function MenuCard({ item }) {
  return (
    <article className="menu-card">
      <div className="menu-card-image" style={{ backgroundImage: `url("${item.image}")` }}>
        <span className="menu-category">{item.category}</span>
      </div>
      <div className="menu-card-body">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <h3>{item.name}</h3>
          <span className="menu-price">${item.price.toFixed(2)}</span>
        </div>
        <p>{item.description}</p>
      </div>
    </article>
  )
}

function ReservationTeaser({ onReserve }) {
  return (
    <section className="reservation-teaser">
      <div className="container d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
        <div><span className="eyebrow">Make it a moment</span><h2>There’s always room<br />at our table.</h2></div>
        <button className="btn btn-accent btn-lg" onClick={onReserve} type="button">Make a reservation <Icon name="arrow-up-right" /></button>
      </div>
    </section>
  )
}

export default App
