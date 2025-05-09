import React, { useEffect, useState } from 'react';
import SearchBar from '../../SearchBar/SearchBar';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
import DateFilterDropdown from '../DateFilterDropdown/DateFilterDropdown';
import './TableGraph.css';
import TaskDetailsSidebar from '../TaskDetailsSidebar/TaskDetailsSidebar';
import TaskForm from '../TaskForm/TaskForm';
import ConnectionsModal from '../ConnectionsModal/ConnectionsModal';
import SortModal from '../SortModal/SortModal';
import TagsModal from '../TagsModal/TagsModal';
import {
  SERVER,
  ITEMS_PER_PAGE,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from '../../../Constants';

export default function TableGraph({ selectedGroup }) {
  const [tasks, setTasks] = useState([]);
  const [taskSearchTerm, setTaskSearchTerm] = useState(''); // 🔍 Новое состояние
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [createdAtFilter, setCreatedAtFilter] = useState(null);
  const [deadlineFilter, setDeadlineFilter] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskForConnections, setSelectedTaskForConnections] =
    useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);

  const transformLabels = (labels) => {
    switch (labels) {
      case 'Сделать':
        return 'todo';
      case 'В процессе':
        return 'in_progress';
      case 'Завершена':
        return 'done';
      case 'Высокий':
        return 'high';
      case 'Средний':
        return 'medium';
      case 'Низкий':
        return 'low';
      default:
        return labels;
    }
  };

  const fetchTasksFromServer = async () => {
    const params = new URLSearchParams();
    if (taskSearchTerm)
      params.append('title', '(?i).*' + taskSearchTerm + '.*');

    if (selectedStatuses.length > 0) {
      const transformedStatuses = selectedStatuses?.map(transformLabels);
      params.append('status', transformedStatuses.join(','));
    }

    if (selectedPriorities.length > 0) {
      const transformedPriorities = selectedPriorities?.map(transformLabels);
      params.append('priority', transformedPriorities.join(','));
    }

    // Фильтр по дате создания
    if (createdAtFilter?.mode === 'exact') {
      const date = new Date(createdAtFilter.exact);
      const result = date.toISOString().split('T')[0];
      date.setDate(date.getDate() + 1);
      const result2 = date.toISOString().split('T')[0];
      params.append('created_after', result);
      params.append('created_before', result2);
    }
    if (createdAtFilter?.mode === 'between') {
      params.append('created_after', createdAtFilter.start);
      params.append('created_before', createdAtFilter.end);
    }

    // Фильтр по дедлайну
    if (deadlineFilter?.mode === 'exact') {
      const date = new Date(deadlineFilter.exact);
      date.setDate(date.getDate() - 1);
      const result = date.toISOString().split('T')[0];
      params.append('deadline_after', result);
      params.append('deadline_before', deadlineFilter.exact);
    }
    if (deadlineFilter?.mode === 'between') {
      params.append('deadline_after', deadlineFilter.start);
      params.append('deadline_before', deadlineFilter.end);
    }

    // Сортировка
    if (sortField && sortOrder !== 'none') {
      params.append('sort_by', sortField);
      params.append('reverse', sortOrder === 'desc');
    }

    // Группа
    params.append('group', selectedGroup);
    params.append('page', page);
    params.append('page_size', ITEMS_PER_PAGE);
    console.log(`${SERVER}/api/task/?${params}`);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER}/api/task/?${params}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Ошибка загрузки задач');
      const data = await response.json();

      const results = data?.results?.map((task) => ({
        title: task.title,
        deadline: task.deadline
          ? new Date(task.deadline).toLocaleDateString()
          : '-',
        createdAt: task.created_at
          ? new Date(task.created_at).toLocaleDateString()
          : '-',
        updatedAt: task.updated_at
          ? new Date(task.updated_at).toLocaleDateString()
          : '-',
        status: task.status,
        priority: task.priority,
        description: task.content || '',
        edges: task.related_tasks || [],
        taskId: task.task_id,
      }));

      setTasks(results || []);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  useEffect(() => {
    fetchTasksFromServer();
  }, [
    taskSearchTerm,
    page,
    selectedStatuses,
    selectedPriorities,
    createdAtFilter,
    deadlineFilter,
    sortField,
    sortOrder,
    selectedGroup,
  ]);

  const handleCreateTask = async (newTaskData) => {
    newTaskData.deadline = newTaskData.deadline + 'T00:00:00';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER}/api/task/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newTaskData,
          group_name: selectedGroup,
        }),
      });
      if (!response.ok) throw new Error('Ошибка при создании задачи');
      await fetchTasksFromServer(); // обновляем список
      setIsCreatingTask(false);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать задачу.');
    }
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
    setTaskSearchTerm('');
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
      case 'todo':
        return 'Сделать';
      case 'in_progress':
        return 'В процессе';
      case 'done':
        return 'Завершено';
      case 'low':
        return 'Низкий';
      case 'medium':
        return 'Средний';
      case 'high':
        return 'Высокий';
      default:
        return field;
    }
  };

  return (
    <div className="table-graph-container">
      <div className="wrapper-paginator">
        <div className="d-flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
          {/* Поиск только по названию задачи */}
          <div className="search-container-tables">
            <SearchBar
              TitleFind="Поиск по названию задачи"
              searchQuery={taskSearchTerm}
              handleSearchChange={(e) => setTaskSearchTerm(e.target.value)}
              handleSearchSubmit={fetchTasksFromServer}
            />
          </div>

          {/* Фильтры */}
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

        {/* Таблица задач */}
        <table className="table table-bordered table-hover mt-3 fixed-width-table">
          <thead>
            <tr>
              <th style={{ width: '400px' }}>Название задания</th>
              <th>Дата завершения</th>
              <th>Дата создания</th>
              <th>Дата обновления</th>
              <th>Связи</th>
              <th>Статус</th>
              <th>Приоритет</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  В группе нет заданий
                </td>
              </tr>
            ) : (
              tasks?.map((row, i) => (
                <tr
                  key={i}
                  className="table-row"
                  onClick={() => handleRowClick(row)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    {row.title.length > 40
                      ? row.title.slice(0, 40) + '...'
                      : row.title}
                  </td>
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
                  <td>{getFieldLabel(row.status)}</td>
                  <td>{getFieldLabel(row.priority)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Пагинация */}
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

      {/* Боковая панель деталей задачи */}
      <TaskDetailsSidebar
        key={selectedTask?.taskId || 'closed'}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdate={fetchTasksFromServer}
      />

      {/* Кнопки действий */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsCreatingTask(true)}
        >
          + Новая задача
        </button>
        {/* Кнопка управления тегами */}
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setIsTagsModalOpen(true)}
        >
          Управление тегами
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

      {/* Информация о сортировке */}
      {sortField && sortOrder !== 'none' && (
        <div className="sort-info small text-muted ms-2">
          Сортировка: <strong>{getFieldLabel(sortField)}</strong> (
          {sortOrder === 'asc' ? 'возрастание' : 'убывание'})
        </div>
      )}

      {/* Форма создания задачи */}
      {isCreatingTask && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreatingTask(false)}
        />
      )}

      {/* Модальное окно сортировки */}
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

      {
        /* Модальное окно связей */
        isModalOpen && selectedTaskForConnections && (
          <ConnectionsModal
            task={selectedTaskForConnections}
            onClose={() => setIsModalOpen(false)}
            allTasks={tasks}
          />
        )
      }
      {isTagsModalOpen && (
        <TagsModal
          isOpen={isTagsModalOpen}
          onClose={() => setIsTagsModalOpen(false)}
          setSelectedTask={setSelectedTask}
        />
      )}
    </div>
  );
}
