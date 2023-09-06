import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react';
import LayersContainer from '../containers/LayersContainer.jsx';
import FunctionsContainer from '../containers/FunctionsContainer.jsx';

const Display = () => {
  const [layers, setLayers] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [activeTab, setActiveTab] = useState('Layers');

  useEffect(() => {
    axios.get('http://localhost:3000/layers/list')
    .then(response => {
      setLayers(response.data);
    })
    .catch(err => {
      console.log('Error:', err)
    })
    
    axios.get('http://localhost:3000/functions/list')
    .then(response => {
      setFunctions(response.data.Functions);
    })
    .catch(err => {
      console.log('Error:', err)
    })

  }, [])


  
  return (
    <div id='display'>
      <span>
        <button onClick={() => setActiveTab('Layers')}> Layers </button>
        <button onClick={() => setActiveTab('Functions')}> Functions </button>
      </span>
      
      {activeTab === 'Layers' && (
        <div>
          {<LayersContainer 
          data = { layers }
          lambda = { functions }
          />}
        </div>
      )}
      {activeTab === 'Functions' && (
        <div>
           {<FunctionsContainer 
          lambda = { functions }
          data = { layers }
           />}
        </div>
      )}
    </div>
  )
}

export default Display;