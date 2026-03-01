import { useState } from 'react';
import './App.css';
import { Routes } from 'react-router-dom';
import { Route } from 'react-router-dom';
import Home from './Home';
import Landing from './Landing';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import Signup from './Signup';

function App() {

  return (
    <Routes>
      <Route path = '/login' element={<Login/>}/>
      <Route path = '/signup' element={<Signup/>}/>
      <Route path = '/' element={<Landing/>}/>
      {/*This is for the app to recognise its a demo so the storage type can switch */}
      <Route path = '/demo' element={<Home mode = 'demo'/>}/>
      {/*This prop is for the app to recognise Firebase */}
      <Route element={<ProtectedRoute/>}>
      <Route path = '/app' element={<Home mode = 'auth'/>}/>
      </Route>
    </Routes>
  )
}

export default App
