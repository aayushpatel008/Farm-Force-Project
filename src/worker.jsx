import React from 'react'
import { useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import { useEffect } from 'react';


const Worker = () => {
  const location=useLocation();
  const name=location.state?.name
    useEffect(() => {

    if(name){
        toast.success(`Hello ${name}`);
    }

  }, [name]); // 

  return (
    <>
    <h1>Hello This is Worker Dashboard</h1>
    
    </>
    

  )
}

export default Worker