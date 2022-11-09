import React from 'react';
import ReactHelmet from 'react-helmet';
import Header from './Header';

export const MainLayout = (props) => {
  const { title, children, className } = props;
  return (
    <>
      <ReactHelmet>
        <title>{title}</title>
      </ReactHelmet>
      <Header />
      <main className={className}>{children}</main>
      {/* <Footer /> */}
    </>
  );
};
