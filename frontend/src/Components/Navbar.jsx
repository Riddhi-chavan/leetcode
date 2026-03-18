import React from 'react'
import leetcodeLogo from "../assets/leetcode.svg"
import search from "../assets/search.svg"
import dropDown from "../assets/dropDown.svg"

const Navbar = () => {
  return (
    <div className='display-none w-full items-center px-6  bg-[#ffff]'>
      <div className='max-w-[1900px] flex justify-between m-auto items-center h-[50px] '>
        <div className='flex gap-6 items-center text-[#0000008c]'>
          <div>
            <img src={leetcodeLogo} alt="leetcode" className='w-12' />
          </div>
          <div className='cursor-pointer'>
            Explore
          </div>
          <div className='cursor-pointer'>
            Problems
          </div>
          <div className='cursor-pointer'>
            Contest
          </div>
          <div className='cursor-pointer'>
            Discuss
          </div>
          <div className='flex items-center gap-[7px] justify-center cursor-pointer'>
            Interview
            <img src={dropDown} alt="dropDown" className='w-[10px]' />
          </div>
          <div className='flex items-center gap-[4px] justify-center text-[#ffa116] cursor-pointer'>
            Store
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" class=" h-[14px] w-[14px]" aria-hidden="true"><path fill-rule="evenodd" d="M4.929 7.913l7.078 7.057 7.064-7.057a1 1 0 111.414 1.414l-7.77 7.764a1 1 0 01-1.415 0L3.515 9.328a1 1 0 011.414-1.414z" clip-rule="evenodd"></path></svg>
          </div>
         
        </div>
        <div className='flex gap-6 items-center'>
          <div className='h-[32px] w-[200px] bg-[#0000000a] rounded-[10px] flex items-center px-[10px] gap-2'>
            <img src={search} alt="search" className='w-[16px] ' />
            <input type="text" placeholder='Search' className='w-full outline-none text-[#0000008c] placeholder:text-[#0000008c]' />
          </div>
          <div className='bg-[#ffa1161f] w-[84px] h-[2rem] flex justify-center items-center rounded-[8px] text-[#ffa116] cursor-pointer'>
            Premium
          </div>
        </div>


      </div>

    </div>
  )
}

export default Navbar