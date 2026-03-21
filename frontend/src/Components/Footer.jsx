import React from 'react'
import us from "../assets/us.svg"

const Footer = () => {
    return (
        <div className='display-none w-full items-center px-6 bg-[#ffff]'>
            <div className='max-w-[1900px] h-[50px] flex items-center justify-between mx-auto'>
                <div className='flex '>
                    <div className='text-[#757575] mr-[20px] text-[14px]'>
                        Copyright © 2026 LeetCode
                    </div>
                    <div className='flex'>
                        <div className=' text-[#424242] text-[12px] flex items-center'>
                            <div className='px-[10.5px] cursor-pointer hover:underline'>Help Center</div>
                            < div className='border-r-[1px] border-[#e0e0e0] h-[10px]' />
                        </div>
                        <div className=' text-[#424242] text-[12px] flex items-center'>
                            <div className='px-[10.5px] cursor-pointer hover:underline'>Jobs</div>
                            < div className='border-r-[1px] border-[#e0e0e0] h-[10px]' />
                        </div>
                        <div className=' text-[#424242] text-[12px] flex items-center'>
                            <div className='px-[10.5px] cursor-pointer hover:underline'>Bug Bounty</div>
                            < div className='border-r-[1px] border-[#e0e0e0] h-[10px]' />
                        </div>
                        <div className=' text-[#424242] text-[12px] flex items-center'>
                            <div className='px-[10.5px] cursor-pointer hover:underline'>Online Interview</div>
                            < div className='border-r-[1px] border-[#e0e0e0] h-[10px]' />
                        </div>
                        <div className=' text-[#424242] text-[12px] flex items-center'>
                            <div className='px-[10.5px] cursor-pointer hover:underline'>Students</div>
                            < div className='border-r-[1px] border-[#e0e0e0] h-[10px]' />
                        </div>
                        <div className=' text-[#424242] text-[12px] flex items-center'>
                            <div className='px-[10.5px] cursor-pointer hover:underline'>Terms</div>
                            < div className='border-r-[1px] border-[#e0e0e0] h-[10px]' />
                        </div>
                        <div className=' text-[#424242] text-[12px] flex items-center'>
                            <div className='px-[10.5px] cursor-pointer hover:underline'>Privacy Policy</div>
                        </div>
                    </div>
                </div>
                <div className='flex gap-[10px] items-center'>
                    <img src={us} alt="us" className='w-[18px] h-[18px]' />
                    United States
                </div>
            </div>

        </div>
    )
}

export default Footer