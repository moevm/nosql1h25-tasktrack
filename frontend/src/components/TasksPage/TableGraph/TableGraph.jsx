import React, { useEffect, useState } from 'react';
import SearchBar from '../../SearchBar/SearchBar';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
import DateFilterDropdown from '../DateFilterDropdown/DateFilterDropdown';
import './TableGraph.css';
import TaskDetailsSidebar from '../TaskDetailsSidebar/TaskDetailsSidebar';
import TaskForm from '../TaskForm/TaskForm';
import ConnectionsModal from '../ConnectionsModal/ConnectionsModal';
import SortModal from '../SortModal/SortModal';
import { SERVER } from '../../../Constants';

const ITEMS_PER_PAGE = 12;
const STATUS_OPTIONS = ['todo', 'in_progress', 'done'];
const PRIORITY_OPTIONS = ['high', 'medium', 'low'];

export default function TableGraph() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [createdAtFilter, setCreatedAtFilter] = useState(null);
  const [deadlineFilter, setDeadlineFilter] = useState(null);
  const [addedTasks, setAddedTasks] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskForConnections, setSelectedTaskForConnections] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const fetchTasksFromServer = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('title', searchTerm);
    if (selectedStatuses.length > 0)
      params.append('status', selectedStatuses.join(','));
    if (selectedPriorities.length > 0)
      params.append('priority', selectedPriorities.join(','));

    // Фильтры по дате создания
    if (createdAtFilter?.mode === 'exact')
      params.append('created_at', createdAtFilter.exact.split('T')[0]);
    if (createdAtFilter?.mode === 'between') {
      params.append('created_after', createdAtFilter.start);
      params.append('created_before', createdAtFilter.end);
    }
    if (createdAtFilter?.mode === 'last') {
      params.append('created_last_value', createdAtFilter.lastValue);
      params.append('created_last_unit', createdAtFilter.lastUnit);
    }

    // Фильтры по дедлайну
    if (deadlineFilter?.mode === 'exact')
      params.append('deadline', deadlineFilter.exact.split('T')[0]);
    if (deadlineFilter?.mode === 'between') {
      params.append('deadline_after', deadlineFilter.start);
      params.append('deadline_before', deadlineFilter.end);
    }
    if (deadlineFilter?.mode === 'last') {
      params.append('deadline_last_value', deadlineFilter.lastValue);
      params.append('deadline_last_unit', deadlineFilter.lastUnit);
    }

    // Сортировка
    if (sortField && sortOrder !== 'none') {
      params.append('sort_by', sortField);
      params.append('reverse', sortOrder === 'desc');
    }

    params.append('group_name', 'test');
    params.append('page', page);
    params.append('page_size', ITEMS_PER_PAGE);

    try {
      const response = await fetch(`${SERVER}/api/task/?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Ошибка загрузки задач');

      const data = await response.json();
      const results = data.results.map((task) => ({
        title: task.title,
        deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : '-',
        createdAt: task.created_at ? new Date(task.created_at).toLocaleDateString() : '-',
        updatedAt: task.updated_at ? new Date(task.updated_at).toLocaleDateString() : '-',
        status: task.status,
        priority: task.priority,
        description: task.content || '',
        edges: task.related_tasks || [],
        taskId: task.task_id,
      }));

      setTasks(results);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось загрузить задачи.');
    }
  };

  useEffect(() => {
    fetchTasksFromServer();
  }, [
    searchTerm,
    page,
    selectedStatuses,
    selectedPriorities,
    createdAtFilter,
    deadlineFilter,
    sortField,
    sortOrder,
  ]);

  const handleCreateTask = async (newTaskData) => {
    try {
      const token = localStorage.getItem('token');
      console.log({
        ...newTaskData,
        group_name: 'test',
      })
      const response = await fetch(`${SERVER}/api/task/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newTaskData,
          group_name: 'test',
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании задачи');
      }

      await fetchTasksFromServer(); // Обновляем список задач
      setIsCreatingTask(false);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать задачу.');
    }
  };

  const handleSearch = (value) => {
    setPage(1);
    setSearchTerm(value);
  };

  const handleRowClick = (task) => {
    setSelectedTask(task);
  };

  const handleApplySort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
    setIsSortModalOpen(false);
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
              Сбросить фильтры
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
            </tr>
          </thead>
          <tbody>
            {tasks.map((row, i) => (
              <tr key={i} className="table-row" onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
                <td>{row.title}</td>
                <td>{row.deadline}</td>
                <td>{row.createdAt}</td>
                <td>{row.updatedAt}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary" onClick={(e) => handleShowEdgesClick(row, e)}>Показать</button>
                </td>
                <td>{row.status}</td>
                <td>{row.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination mt-2 mb-2 d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Назад</button>
          <span style={{ fontSize: '0.9rem' }}>Страница {page} из {totalPages || 1}</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Вперёд</button>
        </div>
      </div>

      <TaskDetailsSidebar task={selectedTask} onClose={() => setSelectedTask(null)} />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button className="btn btn-primary btn-sm" onClick={() => setIsCreatingTask(true)}>+ Новая задача</button>
        <button className="btn btn-outline-primary btn-sm" onClick={() => setIsSortModalOpen(true)}>Сортировать</button>
        <button className="btn btn-outline-danger btn-sm" onClick={handleResetSort} disabled={!sortField}>Сбросить сортировку</button>
      </div>

      {sortField && sortOrder !== 'none' && (
        <div className="sort-info small text-muted ms-2">
          Сортировка: <strong>{getFieldLabel(sortField)}</strong> ({sortOrder === 'asc' ? 'возрастание' : 'убывание'})
        </div>
      )}

      {isCreatingTask && (
        <TaskForm
          onSubmit={handleCreateTask}
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
          allTasks={tasks}
        />
      )}
    </div>
  );
}