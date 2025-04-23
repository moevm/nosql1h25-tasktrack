import React, { useEffect, useState } from "react";
import SearchBar from "../../SearchBar/SearchBar";
import './TableGraph.css';

const GROUP_DICT = {
  group1: {
    name: 'Group 1',
    graphs: [
      {
        name: 'Graph 1',
        deadline: '2023-10-01',
        createdAt: '2023-09-01',
        modifiedAt: '2023-09-15',
        description: 'Description of Graph 1',
        status: 'active',
        priority: 'high',
        time: '2h',
      },
      {
        name: 'Graph 2',
        deadline: '2023-10-05',
        createdAt: '2023-09-05',
        modifiedAt: '2023-09-20',
        description: 'Description of Graph 2',
        status: 'inactive',
        priority: 'medium',
        time: '1h',
      },
      {
        name: 'Graph 3',
        deadline: '2023-10-10',
        createdAt: '2023-09-10',
        modifiedAt: '2023-09-25',
        description: 'Description of Graph 3',
        status: 'active',
        priority: 'low',
        time: '30m',
      },
    ],
  },
  group2: {
    name: 'Group 2',
    graphs: [
      {
        name: 'Graph 4',
        deadline: '2023-10-15',
        createdAt: '2023-09-15',
        modifiedAt: '2023-09-30',
        description: 'Description of Graph 4',
        status: 'active',
        priority: 'high',
        time: '3h',
      },
      {
        name: 'Graph 5',
        deadline: '2023-10-20',
        createdAt: '2023-09-20',
        modifiedAt: '2023-10-01',
        description: 'Description of Graph 5',
        status: 'inactive',
        priority: 'medium',
        time: '1.5h',
      },
    ],
  },
  group3: {
    name: 'Group 3',
    graphs: [],
  },
};

const getGroupData = () => {
  const result = [];
  Object.entries(GROUP_DICT).forEach(([key, group]) => {
    const graphs = group.graphs || [];
    graphs.forEach((graph, index) => {
      result.push({
        id: `${key}-${index + 1}`,
        title: graph.name,
        deadline: graph.deadline,
        createdAt: graph.createdAt,
        updatedAt: graph.modifiedAt,
        edges: '–',
        status: graph.status,
        priority: graph.priority,
        time: graph.time,
      });
    });
  });
  return result;
};

const fetchTaskDetails = (task) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(task);
    }, 500);
  });
};

export default function TableGraph() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const data = getGroupData();
    setRows(data);
  }, []);

  const handleRowClick = async (task) => {
    const result = await fetchTaskDetails(task);
    alert(`Имя задачи: ${result.title}`);
  };

  const handleShowEdgesClick = async (task, e) => {
    e.stopPropagation(); 
    const result = await fetchTaskDetails(task);
    alert(`Показ связей для задачи: ${result.title}`);
  };

  return (
    <div className="table-graph-container">
      <div className="search-container-tables">
        <SearchBar
          className="search-bar"
          TitleFind="Название задачи"
        />
      </div>

      <table className="table table-bordered table-hover mt-3">
        <thead>
          <tr>
            <th>Название задания</th>
            <th>Дата завершения</th>
            <th>Дата создания</th>
            <th>Дата обновления</th>
            <th>Связи</th>
            <th>Статус</th>
            <th>Приоритет</th>
            <th>Время выполнения</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="table-row"
              onClick={() => handleRowClick(row)}
              style={{ cursor: 'pointer' }}
            >
              <td>{row.title}</td>
              <td>{row.deadline}</td>
              <td>{row.createdAt}</td>
              <td>{row.updatedAt}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={(e) => handleShowEdgesClick(row, e)}
                >
                  Показать
                </button>
              </td>
              <td>{row.status}</td>
              <td>{row.priority}</td>
              <td>{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}