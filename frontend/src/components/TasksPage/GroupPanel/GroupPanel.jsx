// GroupPanel.jsx
import React from 'react';
import './GroupPanel.css'; 
import ToggleSwitch from './ToggleSwitch';

export default function GroupPanel({ setIsGraphMode, isGraphMode }) { 
  const handleToggle = () => {
    setIsGraphMode(!isGraphMode);
  };

  return (
    <div className='group-panel-container'>
      <h1>Тип интерфейса</h1>
      <ToggleSwitch
        isOn={isGraphMode}
        onToggle={handleToggle}
        labelLeft="Таблица"
        labelRight="Графы"
      />
    </div>
  );
}
