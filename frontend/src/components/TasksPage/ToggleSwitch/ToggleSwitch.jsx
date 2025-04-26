import React from 'react';
import './ToggleSwitch.css';

export default function ToggleSwitch({
  isOn,
  onToggle,
  labelLeft = 'Off',
  labelRight = 'On',
}) {
  return (
    <div className="toggle-wrapper">
      <span>{labelLeft}</span>
      <label className="switch">
        <input type="checkbox" checked={isOn} onChange={onToggle} />
        <span className="slider"></span>
      </label>
      <span>{labelRight}</span>
    </div>
  );
}
