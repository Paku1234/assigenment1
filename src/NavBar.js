import React from 'react';
import { Link } from 'react-router-dom';

function NavBar(){
  return (
    <nav>
      <ul>
        <li><Link to="/HomePage">Home</Link></li>
        <li><Link to="/SalesPage">Sales</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;

