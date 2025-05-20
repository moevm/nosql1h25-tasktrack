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
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
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
  const [isTagsModalOpenSearch, setIsTagsModalOpenSearch] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);

  // Трансформация меток для API
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

  // Получение задач с сервера
  const fetchTasksFromServer = async () => {
    const shiftDateTime = (dateStr, hours) => {
      const date = new Date(dateStr);
      date.setHours(date.getHours() + hours);
      return date.toISOString().slice(0, 19);
    };

    const params = new URLSearchParams();
    if (taskSearchTerm)
      params.append('title', '(?i).*' + taskSearchTerm + '.*');
    if (selectedStatuses.length > 0)
      params.append('status', selectedStatuses.map(transformLabels).join(','));
    if (selectedPriorities.length > 0)
      params.append(
        'priority',
        selectedPriorities.map(transformLabels).join(','),
      );
    if (selectedTags.length > 0) params.append('tag', selectedTags.join(','));

    // Фильтр по дате создания
    if (createdAtFilter?.mode === 'exact') {
      // params.append('created_after', (createdAtFilter.exact + 'T00:00:00'));
      // params.append('created_before', (createdAtFilter.exact + 'T23:59:59'));
      params.append(
        'created_after',
        shiftDateTime(createdAtFilter.exact + 'T00:00:00', -10),
      );
      params.append(
        'created_before',
        shiftDateTime(createdAtFilter.exact + 'T23:59:59', -10),
      );
    }
    if (createdAtFilter?.mode === 'between') {
      // params.append('created_after', createdAtFilter.start + 'T00:00:00');
      // params.append('created_before', createdAtFilter.end + 'T23:59:59');
      params.append(
        'created_after',
        shiftDateTime(createdAtFilter.start + 'T00:00:00', -10),
      );
      params.append(
        'created_before',
        shiftDateTime(createdAtFilter.end + 'T23:59:59', -10),
      );
    }

    // Фильтр по дедлайну
    if (deadlineFilter?.mode === 'exact') {
      params.append('deadline_after', deadlineFilter.exact + 'T00:00:00');
      params.append('deadline_before', deadlineFilter.exact + 'T23:59:59');
    }
    if (deadlineFilter?.mode === 'between') {
      params.append('deadline_after', deadlineFilter.start + 'T00:00:00');
      params.append('deadline_before', deadlineFilter.end + 'T23:59:59');
    }

    // Сортировка
    if (sortField && sortOrder !== 'none') {
      params.append('sort_by', sortField);
      params.append('reverse', sortOrder === 'desc');
    }

    // Группа
    if (selectedGroup)
      params.append('group', selectedGroup);
    params.append('page', page);
    params.append('page_size', ITEMS_PER_PAGE);

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
      const results = data?.results?.map((task) => {
        const formatDateTime = (dateString, shiftHours = 0) => {
          if (!dateString) return '-';
          const date = new Date(dateString);
          if (shiftHours) {
            date.setTime(date.getTime() + shiftHours * 60 * 60 * 1000);
          }
          return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        };

        return {
          title: task.title,
          deadline: formatDateTime(task.deadline),
          createdAt: formatDateTime(task.created_at, 8),
          updatedAt: formatDateTime(task.updated_at, 8),
          status: task.status,
          priority: task.priority,
          description: task.content || '',
          edges: task.related_tasks || [],
          taskId: task.task_id,
          group: task.group?.name || '-',
        };
      });
      console.log(data);
      setTasks(results || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  // Подписка на обновления
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
    selectedTags,
  ]);

  // Загрузка тегов
  const handlerFilteredTags = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${SERVER}/api/tag/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setFilteredTags(data.tags?.map((t) => t.name) || []);
      setIsTagsModalOpenSearch(true);
    } catch (err) {
      console.error('Ошибка загрузки тегов:', err);
    }
  };

  // Создание задачи
  const handleCreateTask = async (newTaskData) => {
    newTaskData.deadline = newTaskData.deadline;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER}/api/task/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTaskData),
      });
      if (!response.ok) throw new Error('Ошибка при создании задачи');
      await fetchTasksFromServer();
      setIsCreatingTask(false);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать задачу.');
    }
  };

  // Клик по строке задачи
  const handleRowClick = (task) => {
    setSelectedTask(task);
  };

  // Применить сортировку
  const handleApplySort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
    setIsSortModalOpen(false);
  };

  // Сброс сортировки
  const handleResetSort = () => {
    setSortField('');
    setSortOrder('none');
  };

  // Сброс всех фильтров
  const handleResetFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setTaskSearchTerm('');
    setDeadlineFilter(null);
    setCreatedAtFilter(null);
    setPage(1);
    setSelectedTags([]);
  };

  // Маппинг названий полей
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
      case 'books':
        return 'Книги';
      default:
        return field;
    }
  };

  // Получить список активных фильтров
  const getActiveFilters = () => {
    const filters = [];

    if (selectedStatuses.length > 0) {
      filters.push(`Статус: ${selectedStatuses.join(', ')}`);
    }

    if (selectedPriorities.length > 0) {
      filters.push(`Приоритет: ${selectedPriorities.join(', ')}`);
    }

    if (taskSearchTerm) {
      filters.push(`Поиск: "${taskSearchTerm}"`);
    }

    if (createdAtFilter) {
      let dateText = '';
      if (createdAtFilter.mode === 'exact') {
        dateText = `Дата создания: ${createdAtFilter.exact}`;
      } else if (createdAtFilter.mode === 'between') {
        dateText = `Дата создания: от ${createdAtFilter.start} до ${createdAtFilter.end}`;
      }
      filters.push(dateText);
    }

    if (deadlineFilter) {
      let dateText = '';
      if (deadlineFilter.mode === 'exact') {
        dateText = `Дедлайн: ${deadlineFilter.exact}`;
      } else if (deadlineFilter.mode === 'between') {
        dateText = `Дедлайн: от ${deadlineFilter.start} до ${deadlineFilter.end}`;
      }
      filters.push(dateText);
    }

    if (selectedTags.length > 0) {
      filters.push(`Теги: ${selectedTags.join(', ')}`);
    }

    return filters;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="table-graph-container">
      <div className="wrapper-paginator">
        <div className="d-flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
          {/* Поиск */}
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
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handlerFilteredTags}
            >
              Фильтр по тегам
            </button>
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
              <th>Группа</th>
            </tr>
          </thead>
          <tbody>
            {
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskForConnections(row);
                        setIsModalOpen(true);
                      }}
                    >
                      Показать
                    </button>
                  </td>
                  <td>{getFieldLabel(row.status)}</td>
                  <td>{getFieldLabel(row.priority)}</td>
                  <td>{row.group}</td>
                </tr>
              ))
            }
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
      {
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsCreatingTask(true)}
          >
            + Новая задача
          </button>
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
      }

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

      {/* Модальное окно связей */}
      {isModalOpen && selectedTaskForConnections && (
        <ConnectionsModal
          task={selectedTaskForConnections}
          onClose={() => setIsModalOpen(false)}
          allTasks={tasks}
        />
      )}

      {/* Модальное окно управления тегами */}
      {isTagsModalOpenSearch && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Фильтр по тегам</h4>
              <button
                id="modal-close-btn1"
                onClick={() => setIsTagsModalOpenSearch(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Поиск по тегам..."
                value={tagSearchTerm}
                onChange={(e) => setTagSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <div className="modal-tags-container">
                <ul className="modal-tags-list">
                  {filteredTags
                    .filter((tag) =>
                      tag.toLowerCase().includes(tagSearchTerm.toLowerCase()),
                    )
                    .map((tag, index) => (
                      <li key={index}>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag)}
                            onChange={() => {
                              if (selectedTags.includes(tag)) {
                                setSelectedTags(
                                  selectedTags.filter((t) => t !== tag),
                                );
                              } else {
                                setSelectedTags([...selectedTags, tag]);
                              }
                            }}
                          />
                          <span className="tag-input-class">{tag}</span>
                        </label>
                      </li>
                    ))}
                  {filteredTags.length === 0 && (
                    <span>Нет подходящих тегов</span>
                  )}
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setIsTagsModalOpenSearch(false)}
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
      {isTagsModalOpen && (
        <TagsModal
          isOpen={isTagsModalOpen}
          onClose={() => setIsTagsModalOpen(false)}
          setSelectedTask={setSelectedTask}
        />
      )}
      {/* Активные фильтры */}
      {activeFilters.length > 0 && (
        <div className="active-filters mt-3 p-2 bg-light rounded border">
          <strong>Применённые фильтры:</strong>
          <ul className="list-inline mb-0 mt-1">
            {activeFilters.map((filter, index) => (
              <li key={index} className="list-inline-item">
                <span className="badge bg-primary text-white">{filter}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
