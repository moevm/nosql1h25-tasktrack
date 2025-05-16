import React, { useState } from 'react';
import GroupPanel from './components/TasksPage/GroupPanel/GroupPanel';
import './Dashboard.css';
import TableGraph from './components/TasksPage/TableGraph/TableGraph';
import MainGraph from './components/GraphPage/MainGraph/MainGraph';

export default function Dashboard() {
  const [isGraphMode, setIsGraphMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  return (
    <div className="main-content">
      <GroupPanel
        setIsGraphMode={setIsGraphMode}
        isGraphMode={isGraphMode}
        setSelectedGroup={setSelectedGroup}
        selectedGroup={selectedGroup}
      />

      {isGraphMode && <MainGraph selectedGroup={selectedGroup} />}
      {!isGraphMode && selectedGroup && (
        <TableGraph selectedGroup={selectedGroup} />
      )}
      {!isGraphMode && !selectedGroup && (
        <div className="no-group-selected">
          <h2>Выберите группу для отображения задач</h2>
        </div>
      )}
    </div>
  );
}
