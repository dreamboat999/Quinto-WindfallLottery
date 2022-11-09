import React from 'react';
import { useSelector } from 'react-redux';
import ConnectionStatus from 'components/ConnectionStatus';
import GoogleLoginButton from 'components/GoogleLoginButton';
import './header.scss';
import { useEffect } from 'react';

const Header = () => {
  const connected = useSelector((state) => state.quintoSlices.connected);

  return (
    <header
      style={{ backgroundImage: 'url(/assets/imgs/bg-pattern-header.svg)' }}
    >
      <div className='header-content'>
        <img src='assets/imgs/logo.png' style={{ width: '170px' }} alt='logo' />
        <ConnectionStatus readyState={connected} />
        <GoogleLoginButton />
      </div>
    </header>
  );
};

export default Header;
