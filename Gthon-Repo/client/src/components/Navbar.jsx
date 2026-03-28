import React, { useState } from 'react';
import { logo, lock, hamburgerMenu, close } from '../assets'

const Navbar = () => {

    const [toggle, setToggle] = useState(false);

    const handleClick = () => setToggle(!toggle);

    return (
        <header className='w-full h-[80px] bg-white border-b skip-reading' data-no-read="true">
            <nav className='md:max-w-[1480px] max-w-[600px] m-auto w-full h-full flex justify-between items-center md:px-0 px-4' aria-label="Primary">
                <img src={logo} className="h-[25px]" alt="Gthon logo" />

                <div className='hidden md:flex items-center '>
                    <ul className='flex gap-4'>
                        <li>Home</li>
                        <li>About</li>
                        <li>Support</li>
                        <li>Platform</li>
                        <li>Pricing</li>
                    </ul>
                </div>


                <div className='hidden md:flex'>
                    <button type="button" className='flex justify-between items-center  bg-transparent  px-6 gap-2' aria-label="Explore available content">
                        <img src={lock} alt="" aria-hidden="true" />
                        Explore
                    </button>
                    <button type="button" className='px-8 py-3 rounded-md bg-[#20B486] text-white font-bold'>Get Started</button>
                </div>

                <button
                    type="button"
                    className='md:hidden'
                    onClick={handleClick}
                    aria-label={toggle ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={toggle}
                    aria-controls="mobile-nav-menu"
                >
                    <img src={toggle ? close : hamburgerMenu} alt="" aria-hidden="true" />
                </button>
            </nav>

            <div id="mobile-nav-menu" className={toggle ? 'absolute z-10 p-4  bg-white w-full px-8 md:hidden border-b' : 'hidden'}>
                <ul>
                    <li className='p-4 hover:bg-gray-100'>Home</li>
                    <li className='p-4 hover:bg-gray-100'>About</li>
                    <li className='p-4 hover:bg-gray-100'>Support</li>
                    <li className='p-4 hover:bg-gray-100'>Platform</li>
                    <li className='p-4 hover:bg-gray-100'>Pricing</li>
                    <div className='flex flex-col my-4 gap-4'>
                        <button type="button" className='border border-[20B486] flex justify-center items-center  bg-transparent  px-6 gap-2 py-4' aria-label="Explore available content">
                            <img src={lock} alt="" aria-hidden="true" />
                            Explore
                        </button>
                        <button type="button" className='px-8 py-5 rounded-md bg-[#20B486] text-white font-bold'>Get Started</button>
                    </div>
                </ul>
            </div>


        </header>
    )
}

export default Navbar