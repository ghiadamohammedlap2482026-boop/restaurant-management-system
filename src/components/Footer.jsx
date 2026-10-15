function Footer({ navigate, onReserve }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-5">
            <a className="brand-lockup footer-brand" href="#home" onClick={() => navigate('home')}>
              <span className="brand-mark" aria-hidden="true">O</span>
              <span>OLIVE <span className="brand-amp">&amp;</span> THYME<small>NEIGHBORHOOD KITCHEN</small></span>
            </a>
            <p className="footer-blurb">Good things happen when we gather. Join us for something delicious.</p>
          </div>
          <div className="col-6 col-lg-2 offset-lg-1">
            <h2>Explore</h2>
            <a href="#menu" onClick={() => navigate('menu')}>Our menu</a>
            <a href="#reservation" onClick={(event) => { event.preventDefault(); onReserve() }}>Reservations</a>
            <a href="#admin" onClick={() => navigate('admin')}>Admin dashboard</a>
          </div>
          <div className="col-6 col-lg-3">
            <h2>Come on in</h2>
            <p>18 Garden Lane<br />Brooklyn, NY 11211</p>
            <p>Tue–Sun, 11:30 am – 10 pm<br />(212) 555-0148</p>
          </div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Olive &amp; Thyme. Made with care.</span><span>Seasonal food, always.</span></div>
      </div>
    </footer>
  )
}

export default Footer
