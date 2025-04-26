import React, { useEffect, useState } from 'react';
import SearchBar from '../../SearchBar/SearchBar';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
import './TableGraph.css';
import TaskDetailsSidebar from '../TaskDetailsSidebar/TaskDetailsSidebar';
import { GROUP_DICT } from '../../../temp';
import TaskForm from '../TaskForm/TaskForm';
import ConnectionsModal from '../ConnectionsModal/ConnectionsModal'; // Добавляем модальное окно для связей

const ITEMS_PER_PAGE = 12;
const STATUS_OPTIONS = ['active', 'inactive'];
const PRIORITY_OPTIONS = ['high', 'medium', 'low'];

const fetchTasksFromServer = async (
  searchTerm = '',
  page = 1,
  statuses = [],
  priorities = [],
  addedTasks = [],
) => {
  const all = [];

  GROUP_DICT.group1.graphs.forEach((graph) => {
    const name = graph.name || '';

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statuses.length === 0 || statuses.includes(graph.status);
    const matchesPriority =
      priorities.length === 0 || priorities.includes(graph.priority);

    if (matchesSearch && matchesStatus && matchesPriority) {
      all.push({
        title: graph.name,
        deadline: graph.deadline,
        createdAt: graph.createdAt,
        updatedAt: graph.modifiedAt,
        edges: graph.edges,
        status: graph.status,
        priority: graph.priority,
        time: graph.time,
        description: graph.description,
      });
    }
  });

  // Плюс добавляем новые таски:
  addedTasks.forEach((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statuses.length === 0 || statuses.includes(task.status);
    const matchesPriority =
      priorities.length === 0 || priorities.includes(task.priority);

    if (matchesSearch && matchesStatus && matchesPriority) {
      all.push(task);
    }
  });

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageData = all.slice(start, end);

  return {
    data: pageData,
    total: all.length,
    allTasks: all,
  };
};

export default function TableGraph() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  const [addedTasks, setAddedTasks] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null); // для сайдбара
  const [selectedTaskForConnections, setSelectedTaskForConnections] =
    useState(null); // для модалки связей

  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchTasksFromServer(
        searchTerm,
        page,
        selectedStatuses,
        selectedPriorities,
        addedTasks,
      );
      setRows(res.data);
      setTotal(res.total);
      setAllTasks(res.allTasks);
    };

    fetchData();
  }, [searchTerm, page, selectedStatuses, selectedPriorities, addedTasks]);

  const handleSearch = (value) => {
    setPage(1);
    setSearchTerm(value);
  };

  const handleRowClick = (task) => {
    setSelectedTask(null);
    setTimeout(() => {
      setSelectedTask(task);
    }, 100);
  };

  const handleShowEdgesClick = (task, e) => {
    e.stopPropagation();
    setSelectedTaskForConnections(task);
    setIsModalOpen(true);
  };

  const handleDeleteConnection = (connectionIndex) => {
    alert(connectionIndex);
  };

  const handleAddConnection = (connectionName, connectedTask) => {
    const updatedTask = {
      ...selectedTask,
      edges: [...selectedTask.edges, { name: connectionName, connectedTask }],
    };
    setRows((prevRows) =>
      prevRows.map((task) =>
        task.title === selectedTask.title ? updatedTask : task,
      ),
    );
    setSelectedTask(updatedTask);
    setIsModalOpen(false); // Закрыть модальное окно после добавления связи
  };

  return (
    <div className="table-graph-container">
      <div className="wrapper-paginator">
        <div className="d-flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
          <div className="search-container-tables">
            <SearchBar
              className="search-bar"
              TitleFind="Название задачи"
              onSearch={handleSearch}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <FilterDropdown
              label="Приоритет"
              options={PRIORITY_OPTIONS}
              selectedOptions={selectedPriorities}
              onChange={setSelectedPriorities}
            />
            <FilterDropdown
              label="Статус"
              options={STATUS_OPTIONS}
              selectedOptions={selectedStatuses}
              onChange={setSelectedStatuses}
            />
          </div>
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

        <div className="pagination mt-2 mb-2 d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Назад
          </button>
          <span style={{ fontSize: '0.9rem' }}>
            Страница {page} из {totalPages || 1}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперёд
          </button>
        </div>
      </div>

      <TaskDetailsSidebar
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
      <button
        className="btn btn-primary mb-2"
        onClick={() => setIsCreatingTask(true)}
      >
        + Новая задача
      </button>
      {isCreatingTask && (
        <TaskForm
          onSubmit={(newTask) => {
            setAddedTasks((prev) => [newTask, ...prev]);
            setIsCreatingTask(false);
          }}
          onCancel={() => setIsCreatingTask(false)}
        />
      )}

      {isModalOpen && selectedTaskForConnections && (
        <ConnectionsModal
          task={selectedTaskForConnections}
          onClose={() => setIsModalOpen(false)}
          onAddConnection={handleAddConnection}
          onDeleteConnection={handleDeleteConnection}
          allTasks={allTasks}
        />
      )}
    </div>
  );
}
