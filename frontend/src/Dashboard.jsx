// Dashboard.jsx
import React, { useState } from "react";
import Graph from "./Graph";
import GroupPanel from "./components/TasksPage/GroupPanel/GroupPanel";
import './Dashboard.css'; 

export default function Dashboard() {
  const [showGraph, setShowGraph] = useState(false);
  const [isGraphMode, setIsGraphMode] = useState(false);

  return (    
    <div className="main-content">
      <GroupPanel setIsGraphMode={setIsGraphMode} isGraphMode={isGraphMode} />

      <div>
        <h1>{isGraphMode ? "Графы" : "Личный Кабинет"}</h1> 

        <button
          className="btn btn-primary"
          onClick={() => setShowGraph(!showGraph)}
        >
          {showGraph ? "Скрыть граф" : "Показать граф"}
        </button>

        {showGraph && <Graph />}
      </div>
    </div>
  );
}
