import React from 'react'
import leetcodeLogo from "../assets/leetcode.svg"
import search from "../assets/search.svg"

const Navbar = () => {
  return (
    <div className='display-none w-full items-center px-6  bg-[#ffff]'>
      <div className='max-w-[1200px] flex justify-between m-auto items-center h-[50px] '>
        <div className='flex gap-6 items-center text-[#0000008c]'>
          <div>
            <img src={leetcodeLogo} alt="leetcode" className='w-12' />
          </div>
          <div>
            Explore
          </div>
          <div>
            Problems
          </div>
          <div>
            Contest
          </div>
          <div>
            Discuss
          </div>
          <div>
            Interview
          </div>
          <div>
            Store
          </div>
        </div>
        <div className='flex gap-6 items-center'>
          <div className='h-[32px] w-[200px] bg-[#0000000a] rounded-[10px] flex items-center px-[10px] gap-2'>
            <img src={search} alt="search" className='w-[16px] ' />
            <input type="text" placeholder='Search' className='w-full outline-none text-[#0000008c] placeholder:text-[#0000008c]' />
          </div>
          <div className='bg-[#ffa1161f] w-[84px] h-[2rem] flex justify-center items-center rounded-[8px] text-[#ffa116]'>
            Premium
          </div>
        </div>


      </div>

    </div>
  )
}

export default Navbar