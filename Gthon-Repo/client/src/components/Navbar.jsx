import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logo, lock, hamburgerMenu, close } from '../assets'

const Navbar = () => {

    const [toggle, setToggle] = useState(false);
    const navigate = useNavigate();

    const handleClick = () => setToggle(!toggle);

    return (
        <div className='w-full h-[80px] bg-white border-b'>
            <div className='md:max-w-[1480px] max-w-[600px] m-auto w-full h-full flex justify-between items-center md:px-0 px-4'>

                <img src={logo} className="h-[25px]" />

                <div className='hidden md:flex items-center '>
                    <ul className='flex gap-4'>
                        <li>Home</li>
                        <li>About</li>
                        <li>Support</li>
                        <li>Platform</li>
                        <li>Pricing</li>
                        <li>
                            <button
                                onClick={() => navigate('/captions')}
                                className='text-[#20B486] font-semibold hover:underline'
                            >
                                Live Captions
                            </button>
                        </li>
                    </ul>
                </div>


                <div className='hidden md:flex'>
                    <button className='flex justify-between items-center  bg-transparent  px-6 gap-2'>
                        <img src={lock} />
                        Explore
                    </button>
                    <button className='px-8 py-3 rounded-md bg-[#20B486] text-white font-bold'>Get Started</button>
                </div>

                <div className='md:hidden' onClick={handleClick}>
                    <img src={toggle ? close : hamburgerMenu} />
                </div>




            </div>

            <div className={toggle ? 'absolute z-10 p-4  bg-white w-full px-8 md:hidden border-b' : 'hidden'}>
                <ul>
                    <li className='p-4 hover:bg-gray-100'>Home</li>
                    <li className='p-4 hover:bg-gray-100'>About</li>
                    <li className='p-4 hover:bg-gray-100'>Support</li>
                    <li className='p-4 hover:bg-gray-100'>Platform</li>
                    <li className='p-4 hover:bg-gray-100'>Pricing</li>
                    <li
                        className='p-4 text-[#20B486] font-semibold hover:bg-gray-100 cursor-pointer'
                        onClick={() => navigate('/captions')}
                    >
                        Live Captions
                    </li>
                    <div className='flex flex-col my-4 gap-4'>
                        <button className='border border-[20B486] flex justify-center items-center  bg-transparent  px-6 gap-2 py-4'>
                            <img src={lock} />
                            Explore
                        </button>
                        <button className='px-8 py-5 rounded-md bg-[#20B486] text-white font-bold'>Get Started</button>
                    </div>
                </ul>
            </div>


        </div>
    )
}

export default Navbar