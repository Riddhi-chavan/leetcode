import React from 'react'
import Navbar from '../Components/Navbar'
import leetcodeLoginLogo from "../assets/leetcodeLoginLogo.svg"

const Login = () => {
  return (
    <div className='bg-[#eceff1] h-screen w-screen flex flex-col'>
      <Navbar />
      <div className='flex-1 flex items-center justify-center'>
        <div className='w-[400px] bg-[#fff] h-[548px] p-[40px] flex flex-col items-center relative'>
          <img src={leetcodeLoginLogo} alt="leetcodeLoginLogo" className='mb-[35px]' />
          <div className='flex flex-col gap-[20px] w-full'>
            <input
              type="text"
              className='w-full border-[1px] border-[#cfd8dc] h-[40px] p-[10px] outline-none rounded-[3px] transition-colors duration-150 hover:border-black focus:border-[#fbc02e] text-[14px]'
              style={{ '--tw-ring-color': 'transparent' }}
              placeholder='Username or E-mail'
            />
            <input
              type="text"
              className='w-full border-[1px] border-[#cfd8dc] h-[40px] p-[10px] outline-none rounded-[3px] transition-colors duration-150 hover:border-black focus:border-[#fbc02e] text-[14px]'
              placeholder='Password'
            />
          </div>
          <button className='mt-[25px] bg-gradient-to-br from-[#546e7a] to-[#37474f] w-full h-[40px] text-[#fff] text-[14px] rounded-[3px]'>
            Sign in
          </button>
          <div className='flex justify-between w-full mt-[20px] text-[#546e7a] text-[14px]'>
            <div className='cursor-pointer'>
              Forgot Password?
            </div>
            <div className='cursor-pointer'>
              Sign Up
            </div>
          </div>
          <div className='flex flex-col mt-[25px] justify-center gap-2.5 items-center absolute bottom-[33px]'>
            <div className='text-[#bdbdbd] text-[14px]'>
              or you can sign in with
            </div>
            <div className='flex gap-[8px] items-center'>
              <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" class="icon__1Md2 icon__3F7K"><path fill-rule="evenodd" fill='#bdbdbd' d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm.044-5.213c2.445 0 4.267-1.551 4.556-3.781v-1.891h-4.519v1.89h2.602a2.893 2.893 0 0 1-2.724 1.93c-1.194 0-2.677-1.1-2.677-2.843 0-1.621 1.161-2.876 2.677-2.876.739 0 1.413.279 1.922.736l1.399-1.376a4.744 4.744 0 1 0-3.236 8.212z"></path></svg>
              <svg viewBox="0 0 24 24" width="2.3em" height="2.3em" class="icon__1Md2 icon__3F7K"><path fill-rule="evenodd" fill='#bdbdbd' d="M12 2C6.475 2 2 6.475 2 12a9.994 9.994 0 0 0 6.838 9.488c.5.087.687-.213.687-.476 0-.237-.013-1.024-.013-1.862-2.512.463-3.162-.612-3.362-1.175-.113-.288-.6-1.175-1.025-1.413-.35-.187-.85-.65-.013-.662.788-.013 1.35.725 1.538 1.025.9 1.512 2.338 1.087 2.912.825.088-.65.35-1.087.638-1.337-2.225-.25-4.55-1.113-4.55-4.938 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.275.1-2.65 0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.024 2.75-1.024.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10z"></path></svg>

              <svg viewBox="0 0 25 25" width="2.1em" height="2.1em" fill='#bdbdbd' class="icon__1Md2 icon__3F7K"><path d="M12.5 0C19.404 0 25 5.596 25 12.5S19.404 25 12.5 25 0 19.404 0 12.5 5.596 0 12.5 0zm2.27 7.566c-1.09 0-1.985.667-2.556.667-.608 0-1.399-.622-2.35-.623-1.81 0-3.641 1.494-3.641 4.307 0 1.758.674 3.61 1.516 4.805.718 1.01 1.348 1.838 2.256 1.838.893 0 1.29-.593 2.403-.593 1.127 0 1.384.579 2.373.579.98 0 1.633-.901 2.255-1.787.689-1.018.981-2.008.989-2.059-.059-.014-1.934-.784-1.934-2.93 0-1.86 1.473-2.694 1.56-2.76-.973-1.399-2.46-1.444-2.87-1.444zm.227-3.5c-.732.029-1.61.483-2.13 1.098-.418.469-.8 1.216-.8 1.963 0 .117.022.227.03.264.044.007.117.022.198.022.652 0 1.472-.44 1.963-1.033.446-.542.761-1.282.762-2.028 0-.103-.008-.206-.023-.287z"></path></svg>

              <svg viewBox="-4 -4 108 108" width="2.5em" height="2.5em" class="icon__1Md2 icon__3F7K"><path xmlns="http://www.w3.org/2000/svg" fill='#bdbdbd' d="M50 5C25.147 5 5 25.147 5 50s20.147 45 45 45 45-20.147 45-45S74.853 5 50 5zM33.125 55.625a5.624 5.624 0 1 1 0-11.25 5.624 5.624 0 1 1 0 11.25zm16.875 0a5.624 5.624 0 1 1 0-11.25 5.624 5.624 0 1 1 0 11.25zm16.875 0a5.624 5.624 0 1 1 0-11.25 5.624 5.624 0 1 1 0 11.25z"></path></svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login