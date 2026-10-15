import Icon from './Icon.jsx'

function Navbar({ page, navigate, onReserve }) {
  return (
    <header className="site-header">
      <nav className="navbar navbar-expand-lg container" aria-label="Main navigation">
        <a className="navbar-brand brand-lockup" href="#home" onClick={() => navigate('home')}>
          <span className="brand-mark" aria-hidden="true">O</span>
          <span>OLIVE <span className="brand-amp">&amp;</span> THYME<small>NEIGHBORHOOD KITCHEN</small></span>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#primaryNav" aria-controls="primaryNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="primaryNav">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-4">
            <a aria-current={page === 'home' ? 'page' : undefined} className={`nav-link${page === 'home' ? ' current' : ''}`} href="#home" onClick={() => navigate('home')}>Home</a>
            <a aria-current={page === 'menu' ? 'page' : undefined} className={`nav-link${page === 'menu' ? ' current' : ''}`} href="#menu" onClick={() => navigate('menu')}>Our menu</a>
            <a className="nav-link" href="#reservation" onClick={(event) => { event.preventDefault(); onReserve() }}>Reservations</a>
            <a className="nav-link admin-link" href="#admin" onClick={() => navigate('admin')}>Admin <Icon className="admin-indicator" name="arrow-up-right" /></a>
            <a className="btn btn-dark nav-reserve" href="#reservation" onClick={(event) => { event.preventDefault(); onReserve() }}>Book a table</a>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
