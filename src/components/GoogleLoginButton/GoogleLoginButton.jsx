import React from 'react';
import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = () => {
  const handleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: (tokenResponse) => console.log(tokenResponse),
    onError: () => console.log('Login Failed'),
  });
  return (
    <button onClick={() => handleLogin()}>
      <img
        src='https://cdn.cdnlogo.com/logos/g/35/google-icon.svg'
        width='18px'
        height='18px'
        alt=''
      />
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
