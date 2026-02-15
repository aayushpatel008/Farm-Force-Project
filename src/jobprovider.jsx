import React from 'react'
import { useLocation } from "react-router-dom";

const Jobprovider = () => {
  const location=useLocation();
  const name=location.state?.name
  return (
    <h1>Hello {name}</h1>
  )
}

export default Jobprovider