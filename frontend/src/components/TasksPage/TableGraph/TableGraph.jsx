import React, { useEffect, useState } from 'react';
import SearchBar from '../../SearchBar/SearchBar';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
import DateFilterDropdown from '../DateFilterDropdown/DateFilterDropdown';
import './TableGraph.css';
import TaskDetailsSidebar from '../TaskDetailsSidebar/TaskDetailsSidebar';
import { GROUP_DICT } from '../../../temp';
import TaskForm from '../TaskForm/TaskForm';
import ConnectionsModal from '../ConnectionsModal/ConnectionsModal';
import SortModal from '../SortModal/SortModal';

const ITEMS_PER_PAGE = 12;
const STATUS_OPTIONS = ['active', 'inactive'];
const PRIORITY_OPTIONS = ['high', 'medium', 'low'];

const fetchTasksFromServer = async (
  searchTerm = '',
  page = 1,
  statuses = [],
  priorities = [],
  addedTasks = [],
  createdAtFilter = null,
  deadlineFilter = null,
) => {
  const all = [];

  GROUP_DICT.group1.graphs.forEach((graph) => {
    const name = graph.name || '';

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statuses.length === 0 || statuses.includes(graph.status);
    const matchesPriority =
      priorities.length === 0 || priorities.includes(graph.priority);

    const matchesCreatedAt =
      !createdAtFilter || filterDate(graph.createdAt, createdAtFilter);
    const matchesUpdatedAt =
      !deadlineFilter || filterDate(graph.deadline, deadlineFilter);

    if (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCreatedAt &&
      matchesUpdatedAt
    ) {
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

  addedTasks.forEach((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statuses.length === 0 || statuses.includes(task.status);
    const matchesPriority =
      priorities.length === 0 || priorities.includes(task.priority);
    const matchesCreatedAt =
      !createdAtFilter || filterDate(task.createdAt, createdAtFilter);
    const matchesUpdatedAt =
      !deadlineFilter || filterDate(task.updatedAt, deadlineFilter);

    if (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCreatedAt &&
      matchesUpdatedAt
    ) {
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

function filterDate(dateString, filter) {
  if (!dateString) return false;

  const date = new Date(dateString);

  if (filter.mode === 'between') {
    const start = new Date(filter.start);
    const end = new Date(filter.end);
    return date >= start && date <= end;
  }
  if (filter.mode === 'exact') {
    const exact = new Date(filter.exact);
    return (
      date.getFullYear() === exact.getFullYear() &&
      date.getMonth() === exact.getMonth() &&
      date.getDate() === exact.getDate()
    );
  }
  if (filter.mode === 'last') {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (filter.lastUnit === 'days') {
      return diffDays <= filter.lastValue;
    }
    if (filter.lastUnit === 'weeks') {
      return diffDays <= filter.lastValue * 7;
    }
    if (filter.lastUnit === 'months') {
      return diffDays <= filter.lastValue * 30;
    }
  }
  return true;
}

export default function TableGraph() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  const [createdAtFilter, setCreatedAtFilter] = useState(null);
  const [deadlineFilter, setDeadlineFilter] = useState(null);

  const [addedTasks, setAddedTasks] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskForConnections, setSelectedTaskForConnections] =
    useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const [allTasks, setAllTasks] = useState([]);

  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchTasksFromServer(
        searchTerm,
        page,
        selectedStatuses,
        selectedPriorities,
        addedTasks,
        createdAtFilter,
        deadlineFilter,
      );
      setRows(res.data);
      setTotal(res.total);
      setAllTasks(res.allTasks);
    };

    fetchData();
  }, [
    searchTerm,
    page,
    selectedStatuses,
    selectedPriorities,
    addedTasks,
    createdAtFilter,
    deadlineFilter,
  ]);

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

  const handleApplySort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  const handleResetSort = () => {
    setSortField('');
    setSortOrder('none');
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
    alert('Добавили связь');
  };

  const handleResetFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSearchTerm('');
    setDeadlineFilter(null);
    setCreatedAtFilter(null);
    setPage(1);
  };

  const getSortedRows = () => {
    if (!sortField || sortOrder === 'none') {
      return rows;
    }

    const sorted = [...rows].sort((a, b) => {
      if (a[sortField] === undefined || b[sortField] === undefined) return 0;
      if (typeof a[sortField] === 'string') {
        return sortOrder === 'asc'
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      } else {
        return sortOrder === 'asc'
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      }
    });

    return sorted;
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'title':
        return 'Название';
      case 'createdAt':
        return 'Дата создания';
      case 'updatedAt':
        return 'Дата обновления';
      case 'deadline':
        return 'Дата завершения';
      case 'status':
        return 'Статус';
      case 'priority':
        return 'Приоритет';
      case 'time':
        return 'Время выполнения';
      default:
        return field;
    }
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

          <div className="d-flex align-items-center gap-2 flex-wrap">
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
            <DateFilterDropdown
              label="Дата создания"
              onChange={setCreatedAtFilter}
            />
            <DateFilterDropdown
              label="Дата завершения"
              onChange={setDeadlineFilter}
            />
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleResetFilters}
            >
              Сбросить фильры
            </button>
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
            {getSortedRows().map((row, i) => (
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
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsCreatingTask(true)}
        >
          + Новая задача
        </button>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setIsSortModalOpen(true)}
        >
          Сортировать
        </button>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleResetSort}
          disabled={!sortField}
        >
          Сбросить сортировку
        </button>
      </div>
      {sortField && sortOrder !== 'none' && (
        <div className="sort-info small text-muted ms-2">
          Сортировка: <strong>{getFieldLabel(sortField)}</strong> (
          {sortOrder === 'asc' ? 'возрастание' : 'убывание'})
        </div>
      )}

      {isCreatingTask && (
        <TaskForm
          onSubmit={(newTask) => {
            setAddedTasks((prev) => [newTask, ...prev]);
            setIsCreatingTask(false);
          }}
          onCancel={() => setIsCreatingTask(false)}
        />
      )}

      {isSortModalOpen && (
        <SortModal
          fields={[
            { label: 'Название', value: 'title' },
            { label: 'Дата создания', value: 'createdAt' },
            { label: 'Дата обновления', value: 'updatedAt' },
            { label: 'Дата завершения', value: 'deadline' },
            { label: 'Статус', value: 'status' },
            { label: 'Приоритет', value: 'priority' },
            { label: 'Время выполнения', value: 'time' },
          ]}
          onApply={handleApplySort}
          onClose={() => setIsSortModalOpen(false)}
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
