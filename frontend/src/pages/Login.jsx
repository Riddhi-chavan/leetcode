import React from 'react'
import Navbar from '../Components/Navbar'
import leetcodeLoginLogo from "../assets/leetcodeLoginLogo.svg"

const Login = () => {
  return (
     <div className='bg-[#eceff1] h-screen w-screen flex flex-col'>
      <Navbar />
      <div className='flex-1 flex items-center justify-center '>
        <div className='w-[400px] bg-[#fff] h-[548px] p-[40px] flex flex-col items-center'>
            <img src={leetcodeLoginLogo} alt="leetcodeLoginLogo" className='mb-[35px]' />
            <div>
          hiii
        </div>  
        </div>
        
      </div>
    </div>
  )
}

export default Login