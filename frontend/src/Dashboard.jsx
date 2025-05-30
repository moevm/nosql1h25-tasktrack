import React, { useState, useRef } from 'react';
import GroupPanel from './components/TasksPage/GroupPanel/GroupPanel';
import './Dashboard.css';
import TableGraph from './components/TasksPage/TableGraph/TableGraph';
import MainGraph from './components/GraphPage/MainGraph/MainGraph';

export default function Dashboard() {
  const [isGraphMode, setIsGraphMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const tableGraphRef = useRef();

  const handleGroupChange = () => {
    if (tableGraphRef.current?.fetchTasksFromServer) {
      tableGraphRef.current.fetchTasksFromServer();
    }
  };

  return (
    <div className="main-content">
      <GroupPanel
        setIsGraphMode={setIsGraphMode}
        isGraphMode={isGraphMode}
        setSelectedGroup={setSelectedGroup}
        selectedGroup={selectedGroup}
        onGroupChange={handleGroupChange}
      />

      {isGraphMode && (
        <MainGraph selectedGroup={selectedGroup} ref={tableGraphRef} />
      )}
      {!isGraphMode && (
        <TableGraph selectedGroup={selectedGroup} ref={tableGraphRef} />
      )}
    </div>
  );
}
