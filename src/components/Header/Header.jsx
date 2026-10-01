import './Header.css';

import { APP_VERSION } from '../../utils/version';

function Header() {
  return (
    <header className='header'>
      <h1>
        Central Composite Design (CCD) – doi factori
        <span className='header-version'>v{APP_VERSION}</span>
      </h1>
    </header>
  );
}

export default Header;
