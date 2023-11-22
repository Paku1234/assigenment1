import React from 'react';
import { Link } from 'react-router-dom';

function ButtonLink({ to, label }) {
  return (
    <div>
      <Link to={to}>{label}</Link>
    </div>
  );
}

export default ButtonLink;
