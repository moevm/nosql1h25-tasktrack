// Dashboard.jsx
import React, { useState } from 'react';
import Graph from './Graph';
import GroupPanel from './components/TasksPage/GroupPanel/GroupPanel';
import './Dashboard.css';
import TableGraph from './components/TasksPage/TableGraph/TableGraph';

export default function Dashboard() {
  const [showGraph, setShowGraph] = useState(false);
  const [isGraphMode, setIsGraphMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  

  return (
    <div className="main-content">
      <GroupPanel setIsGraphMode={setIsGraphMode} isGraphMode={isGraphMode} setSelectedGroup={setSelectedGroup} selectedGroup={selectedGroup} />

      {/* {
        isGraphMode && 
        <button
          className="btn btn-primary"
          onClick={() => setShowGraph(!showGraph)}
        >
          {showGraph ? "Скрыть граф" : "Показать граф"}
        </button>
        } */}
      {isGraphMode && <h1>Тут будут графы</h1>}
      {showGraph && <Graph />}
      {!isGraphMode && <TableGraph selectedGroup={selectedGroup}/>}
    </div>
  );
}
