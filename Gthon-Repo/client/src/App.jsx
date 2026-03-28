import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import './App.css'
import Signup from './components/Signup';
import New from './components/New';
import Productdetails from './components/Productdetails';
import Video from './components/Video';

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Signup/>}></Route>
        <Route path='/new' element={<New/>}></Route>
        <Route path='/product' element={<Productdetails/>}></Route>
        <Route path='/video' element={<Video/>}></Route>
      </Routes>
      </BrowserRouter>
      
    </>
  )
}

export default App