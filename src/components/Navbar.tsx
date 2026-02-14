import Link from "next/link";

export function Navbar() {
  return (
    <header className="nav-wrap">
      <nav className="nav container">
        <Link href="/" className="logo">
          gambino.flp
        </Link>
        <div className="nav-links">
          <Link href="/">Shop</Link>
          <a href="http://instagram.com/gambino.flp" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <Link href="/admin">Admin</Link>
        </div>
      </nav>
    </header>
  );
}
