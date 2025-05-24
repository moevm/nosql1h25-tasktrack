// InteractiveTaskNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

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
        position: 'relative', // обязательно для Handle
      }}
    >
      {/* Вход (сверху) */}
      <Handle type="target" position={Position.Top} id="top" style={{ background: '#555' }} />
      

      <strong>{data.label}</strong>
      <br />
      <small>Дедлайн: {data.deadline || 'Нет'}</small> <br />
      <small>Статус: {data.status || 'Нет'}</small> <br />
      <small>Приоритет: {data.priority || 'Нет'}</small> <br />
      <small>Группа: {data.group || 'Нет'}</small>

      {/* Выход (снизу) */}
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#999' }} />
    </div>
  );
};

export default InteractiveTaskNode;
