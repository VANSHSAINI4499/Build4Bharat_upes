import React, { useState, useEffect } from 'react';
import {logo,lock, hamburgerMenu, close} from '../assets'

const Navbar = () => {

    const [toggle,setToggle]=useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const handleClick = ()=> setToggle(!toggle);

    // TTS: Text to Speech
    const handleSpeakPage = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const textToRead = document.body.innerText;
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    // STT: Speech to Text
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log("Voice Command Received: ", transcript);
            
            // Simple navigation commands
            if (transcript.includes("go to platform")) {
                alert("Navigating to Platform!"); // Replace with real navigation if react-router is used
            } else if (transcript.includes("scroll down")) {
                window.scrollBy({ top: 500, behavior: 'smooth' });
            } else if (transcript.includes("stop listening")) {
                setIsListening(false);
            }
        };

        if (isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }

        return () => recognition.stop();
    }, [isListening]);

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
                </ul>
            </div>


            <div className='hidden md:flex'>
                <button 
                    onClick={handleSpeakPage}
                    className={`mr-2 px-4 py-2 rounded-md font-bold ${isSpeaking ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
                >
                    {isSpeaking ? 'Stop Reading' : 'Read Page'}
                </button>
                <button 
                    onClick={() => setIsListening(!isListening)}
                    className={`mr-4 px-4 py-2 rounded-md font-bold ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white'}`}
                >
                    {isListening ? 'Listening...' : 'Voice Nav'}
                </button>
                <button className='flex justify-between items-center  bg-transparent  px-6 gap-2'>
                    <img src={lock} />
                    Login
                </button>
                <button className='px-8 py-3 rounded-md bg-[#20B486] text-white font-bold'>Sign Up For Free</button>
            </div>

            <div className='md:hidden'  onClick={handleClick}>
                    <img src={toggle?close:hamburgerMenu} />
            </div>




        </div>

        <div className={toggle?'absolute z-10 p-4  bg-white w-full px-8 md:hidden border-b':'hidden'}>
            <ul>
                    <li className='p-4 hover:bg-gray-100'>Home</li>
                    <li className='p-4 hover:bg-gray-100'>About</li>
                    <li className='p-4 hover:bg-gray-100'>Support</li>
                    <li className='p-4 hover:bg-gray-100'>Platform</li>
                    <li className='p-4 hover:bg-gray-100'>Pricing</li>
                    <div className='flex flex-col my-4 gap-4'>
                        <button className='border border-[20B486] flex justify-center items-center  bg-transparent  px-6 gap-2 py-4'>
                         <img src={lock} />
                         Login
                        </button>
                        <button className='px-8 py-5 rounded-md bg-[#20B486] text-white font-bold'>Sign Up For Free</button>
                    </div>
            </ul>
        </div>
        
        
    </div>
  )
}

export default Navbar