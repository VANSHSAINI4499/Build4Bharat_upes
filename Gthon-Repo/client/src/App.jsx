import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import './App.css'
import New from './components/New';
import Productdetails from './components/Productdetails';
import Video from './components/Video';
import VoiceAssistant from './components/VoiceAssistant';
import VisionAssist from './components/VisionAssist';
import LiveCaptions from './components/LiveCaptions';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<New />}></Route>
          <Route path='/new' element={<New />}></Route>
          <Route path='/product' element={<Productdetails />}></Route>
          <Route path='/video' element={<Video />}></Route>
          <Route path='/vision' element={<VisionAssist />}></Route>
          <Route path='/captions' element={<LiveCaptions />}></Route>
        </Routes>
        <VoiceAssistant />
      </BrowserRouter>

    </>
  )
}

export default App