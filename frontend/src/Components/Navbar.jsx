import React, { useState, useRef, useEffect } from 'react'
import leetcodeLogo from "../assets/leetcode.svg"
import search from "../assets/search.svg"
import dropDown from "../assets/dropDown.svg"
import { useNavigate } from 'react-router-dom'
import assessment from "../assets/assessment.png"
import onlineInterview from "../assets/onlineInterview.png"

const Navbar = () => {
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showDropdownStore, setShowDropdownStore] = useState(false)
  const dropdownRef = useRef(null)
  const storeDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(e.target)) {
        setShowDropdownStore(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='display-none w-full items-center px-6 bg-[#ffff]'>
      <div className='max-w-[1900px] flex justify-between m-auto items-center h-[50px]'>
        <div className='flex gap-6 items-center text-[#0000008c]'>
          <div>
            <img src={leetcodeLogo} alt="leetcode" className='w-12' />
          </div>
          <div className='cursor-pointer hover:text-[#1a1a1a]' onClick={() => navigate('/explore/')}>
            Explore
          </div>
          <div className='cursor-pointer hover:text-[#1a1a1a]' onClick={() => navigate('/problemset/')}>
            Problems
          </div>
          <div className='cursor-pointer hover:text-[#1a1a1a]' onClick={() => navigate('/contest/')}>
            Contest
          </div>
          <div className='cursor-pointer hover:text-[#1a1a1a]' onClick={() => navigate('/discuss/')}>
            Discuss
          </div>

          {/* Interview Dropdown */}
          <div
            ref={dropdownRef}
            className='flex items-center gap-[7px] justify-center cursor-pointer relative hover:text-[#1a1a1a]'
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Interview
            <img
              src={dropDown}
              alt="dropDown"
              className={`w-[10px] transition-transform duration-200`}
            />
            {showDropdown && (
              <div className='absolute bg-[#fff] top-[37px] w-[158px] rounded-[0.5rem] p-[0.5rem] left-[-2px] shadow-lg z-50'>
                <div className='flex w-full h-[32px] gap-[6px] text-[#0000008c] text-[14px] items-center cursor-pointer hover:bg-[#000a2008] hover:text-[#1a1a1a] rounded-[6px] px-2'>
                  <img src={onlineInterview} alt="onlineInterview" className='w-[18px] h-[18px]' />
                  Online Interview
                </div>
                <div className='flex w-full h-[32px] gap-[6px] text-[#0000008c] text-[14px] items-center cursor-pointer hover:bg-[#000a2008] hover:text-[#1a1a1a] rounded-[6px] px-2'>
                  <img src={assessment} alt="assessment" className='w-[18px] h-[18px]' />
                  Assessment
                </div>
              </div>
            )}
          </div>

          {/* Store Dropdown */}
          <div
            ref={storeDropdownRef}
            className='flex items-center gap-[4px] justify-center text-[#ffa116] cursor-pointer relative'
            onClick={() => setShowDropdownStore(!showDropdownStore)}
          >
            Store
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" className="h-[14px] w-[14px]" aria-hidden="true">
              <path fillRule="evenodd" d="M4.929 7.913l7.078 7.057 7.064-7.057a1 1 0 111.414 1.414l-7.77 7.764a1 1 0 01-1.415 0L3.515 9.328a1 1 0 011.414-1.414z" clipRule="evenodd" />
            </svg>
            {showDropdownStore && (
              <div className='absolute bg-[#fff] top-[37px] w-[87px] rounded-[0.5rem] p-[0.5rem] left-[-2px] shadow-lg z-50'>
                <div className='flex w-full h-[32px] gap-[6px] text-[#ffa116] text-[14px] items-center cursor-pointer hover:bg-[#000a2008] rounded-[6px] px-2'>
                  Redeem
                </div>
                <div className='flex w-full h-[32px] gap-[6px] text-[#ffa116] text-[14px] items-center cursor-pointer hover:bg-[#000a2008] rounded-[6px] px-2'>
                  Premium
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='flex gap-6 items-center'>
          <div className='h-[32px] w-[200px] bg-[#0000000a] rounded-[10px] flex items-center px-[10px] gap-2'>
            <img src={search} alt="search" className='w-[16px]' />
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