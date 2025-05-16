// InteractiveTaskNode.jsx
import React from 'react';

const InteractiveTaskNode = ({ data }) => {
  return (
    <div
      style={{
        padding: '10px',
        border: '1px solid #555',
        borderRadius: '6px',
        background: '#2c2c2c',
        color: '#fff',
        width: '200px',
        cursor: 'pointer',
      }}
    >
      <strong>{data.label}</strong>
      <br />
      <small>Дедлайн: {data.deadline || 'Нет'}</small> <br />
      <small>Статус: {data.status || 'Нет'}</small> <br />
      <small>Приоритет: {data.priority || 'Нет'}</small>
      <br />
    </div>
  );
};

export default InteractiveTaskNode;
