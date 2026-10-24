import React from 'react';

export const Header = () => {
  return (
    <header style={{background: '#10294a', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
        <span style={{fontSize: '1.5rem', fontWeight: '800'}}>Prime Horizon Group</span>
        <span style={{fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#7f95af'}}>Plc</span>
      </div>
    </header>
  );
};

export const NavLink = ({to, children, ...props}) => {
  return (
    <a 
      href={to} 
      style={{
        marginLeft: '1rem',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 500,
        ...props.style,
      }}
    >
      {children}
    </a>
  );
};