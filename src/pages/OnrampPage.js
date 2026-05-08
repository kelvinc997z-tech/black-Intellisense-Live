import React from 'react';
import { Navigate } from 'react-router-dom';

const OnrampPage = () => {
  return <Navigate to="/fiat-gateway" replace />;
};

export default OnrampPage;
