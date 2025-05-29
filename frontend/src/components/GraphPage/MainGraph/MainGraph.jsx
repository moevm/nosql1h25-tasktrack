import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import TaskForm from '../../TasksPage/TaskForm/TaskForm';
import SearchBar from '../../SearchBar/SearchBar';
import FilterDropdown from '../../TasksPage/FilterDropdown/FilterDropdown';
import DateFilterDropdown from '../../TasksPage/DateFilterDropdown/DateFilterDropdown';
import SortModal from '../../TasksPage/SortModal/SortModal';
import TagsModal from '../../TasksPage/TagsModal/TagsModal';
import TaskDetailsSidebar from '../../TasksPage/TaskDetailsSidebar/TaskDetailsSidebar';
import InteractiveTaskNode from '../InteractiveTaskNode/InteractiveTaskNode';
import { SERVER } from '../../../Constants';
import CustomEdge from '../CustomEdge/CustomEdge';
import './MainGraph.css';

const nodeTypes = {
  taskNode: InteractiveTaskNode,
};
const edgeTypes = {
  default: CustomEdge,
};
const MainGraph = forwardRef((props, ref) => {
  const { selectedGroup } = props;
  const [isTagsModalOpenSearch, setIsTagsModalOpenSearch] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  const [tasks, setTasks] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [createdAtFilter, setCreatedAtFilter] = useState(null);
  const [deadlineFilter, setDeadlineFilter] = useState(null);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [edgeCreationMode, setEdgeCreationMode] = useState(false);
  const [selectedSourceTask, setSelectedSourceTask] = useState(null);
  const [connectionName, setConnectionName] = useState('');
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);

  const [creationHint, setCreationHint] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && !isAltPressed) {
        setIsAltPressed(true);
        setCreationHint('Выберите связь для удаления');
      }

      if ((e.ctrlKey || e.metaKey) && !isCtrlPressed) {
        setIsCtrlPressed(true);
        setEdgeCreationMode(true);
        setCreationHint('Выберите две задачи для создания связи');
      }
    };

    const handleKeyUp = (e) => {
      if (!e.altKey && isAltPressed) {
        setIsAltPressed(false);
        setCreationHint('');
      }

      if (!e.ctrlKey && !e.metaKey && isCtrlPressed) {
        setIsCtrlPressed(false);
        setEdgeCreationMode(false);
        setCreationHint('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isAltPressed, isCtrlPressed]);
  // Логика выбора задач при клике
  const onNodeClick = (event, node) => {
    if (edgeCreationMode) {
      if (!selectedSourceTask) {
        // Выбрали первую задачу
        setSelectedSourceTask(node);
        setCreationHint('Теперь выберите вторую задачу');
      } else {
        // Выбрали вторую задачу
        const sourceId = selectedSourceTask.id;
        const targetId = node.id;

        if (sourceId === targetId) {
          alert('Нельзя создать связь саму с собой');
          resetEdgeCreation();
          return;
        }

        // Переход к вводу имени связи
        setEdgeCreationMode(false);
        setIsConnectionModalOpen(true);
        setSelectedSourceTask({ sourceId, targetId });
      }
    } else {
      // Обычный клик — открытие деталей задачи
      setSelectedTask(node.data.task);
    }
  };

  const ITEMS_PER_PAGE = 50;

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

  const generateRandomLayoutedElements = (nodes, edges) => {
    const spacingX = 550; // расстояние между нодами по X
    const spacingY = 550; // расстояние между нодами по Y
    const columns = Math.ceil(Math.sqrt(nodes.length)); // примерно квадратная сетка

    const layoutedNodes = nodes.map((node, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      return {
        ...node,
        position: {
          x: col * spacingX + Math.random() * 40 - 20, // немного шума
          y: row * spacingY + Math.random() * 40 - 20,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  const fetchTasksFromServer = async () => {
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

    if (createdAtFilter?.mode === 'exact') {
      params.append('created_after', createdAtFilter.exact + 'T00:00:00');
      params.append('created_before', createdAtFilter.exact + 'T23:59:59');
    }
    if (createdAtFilter?.mode === 'between') {
      params.append('created_after', createdAtFilter.start + 'T00:00:00');
      params.append('created_before', createdAtFilter.end + 'T23:59:59');
    }

    if (deadlineFilter?.mode === 'exact') {
      params.append('deadline_after', deadlineFilter.exact + 'T00:00:00');
      params.append('deadline_before', deadlineFilter.exact + 'T23:59:59');
    }
    if (deadlineFilter?.mode === 'between') {
      params.append('deadline_after', deadlineFilter.start + 'T00:00:00');
      params.append('deadline_before', deadlineFilter.end + 'T23:59:59');
    }
    if (selectedGroup) params.append('group', selectedGroup);
    params.append('page_size', 99999999999);

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
      const mappedTasks = data.results.map((task) => ({
        id: task.task_id,
        title: task.title,
        deadline: task.deadline
          ? new Date(task.deadline).toLocaleDateString()
          : null,
        status: task.status,
        priority: task.priority,
        related_tasks: task.related_from_tasks || [],
        createdAt: task.created_at,
        taskId: task.task_id,
        group: task.group.name,
        description: task.content || '',
      }));
      setTasks(mappedTasks);

      const initialNodes = mappedTasks.map((task) => ({
        id: task.id,
        type: 'taskNode',
        data: {
          label: task.title,
          deadline: task.deadline,
          status: getFieldLabel(task.status),
          priority: getFieldLabel(task.priority),
          group: task.group,
          task,
        },
        position: { x: 0, y: 0 },
      }));

      const initialEdges = [];
      mappedTasks.forEach((task) => {
        console.log(task);
        task.related_tasks.forEach((relatedTask) => {
          const edge = {
            id: `e-${task.id}-${relatedTask.task_id}`,
            source: relatedTask.task_id,
            target: task.id,
            label: relatedTask.relationship?.title || 'Связь',
            type: 'default',
            style: {
              stroke: '#f39c12', // цвет линии
              strokeWidth: 10.5, // толщина линии
            },
          };
          initialEdges.push(edge);
        });
      });

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        generateRandomLayoutedElements(initialNodes, initialEdges);

      console.log(layoutedEdges);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };
  useImperativeHandle(ref, () => ({
    fetchTasksFromServer,
  }));

  const onEdgeClick = async (event, edge) => {
    if (isAltPressed) {
      const confirmed = window.confirm(
        'Вы уверены, что хотите удалить эту связь?',
      );
      if (!confirmed) return;

      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${SERVER}/api/task/relationships/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            task_id_from: edge.source,
            task_id_to: edge.target,
          }),
        });

        if (response.ok) {
          // Удалить ребро из состояния
          setEdges((edges) => edges.filter((e) => e.id !== edge.id));
          setCreationHint('Связь успешно удалена');
        } else {
          alert('Ошибка при удалении связи');
        }
      } catch (err) {
        console.error('Ошибка:', err);
        alert('Не удалось удалить связь');
      }
    } else {
      // Можно расширить функционал, например, открывать модалку с деталями связи
    }
  };

  useEffect(() => {
    fetchTasksFromServer();
  }, [
    taskSearchTerm,
    selectedStatuses,
    selectedPriorities,
    createdAtFilter,
    deadlineFilter,
    sortField,
    sortOrder,
    selectedGroup,
    selectedTags,
  ]);

  const loadTags = async () => {
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
      setIsTagsModalOpenSearch(true); // Открываем модалку фильтрации по тегам
    } catch (err) {
      console.error('Ошибка загрузки тегов:', err);
    }
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

  const handleCreateTask = async (newTaskData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER}/api/task/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskData),
      });

      if (response.ok) {
        // После успешного создания задачи — обновляем список
        fetchTasksFromServer();
        setIsCreatingTask(false);
      } else {
        alert('Ошибка при создании задачи');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать задачу');
    }
  };

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

  const handleResetFilters = () => {
    setTaskSearchTerm('');
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setCreatedAtFilter(null);
    setDeadlineFilter(null);
    setSelectedTags([]);
    setSortField('');
    setSortOrder('none');
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const resetEdgeCreation = () => {
    setEdgeCreationMode(false);
    setSelectedSourceTask(null);
  };

  return (
    <div style={{ width: '100%', height: '100vh' }} className="graph-wrapper">
      {/* Фильтры */}
      <div
        style={{
          marginBottom: '10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <SearchBar
          TitleFind="Поиск по названию"
          searchQuery={taskSearchTerm}
          handleSearchChange={(e) => setTaskSearchTerm(e.target.value)}
        />
        <button
          style={{
            marginLeft: '10px',
          }}
          onClick={loadTags}
        >
          Фильтр по тегам
        </button>
        <FilterDropdown
          label="Приоритет"
          options={['Высокий', 'Средний', 'Низкий']}
          selectedOptions={selectedPriorities}
          onChange={setSelectedPriorities}
        />
        <FilterDropdown
          label="Статус"
          options={['Сделать', 'В процессе', 'Завершена']}
          selectedOptions={selectedStatuses}
          onChange={setSelectedStatuses}
        />
        <DateFilterDropdown
          label="Дата создания"
          onChange={setCreatedAtFilter}
        />
        <DateFilterDropdown label="Дедлайн" onChange={setDeadlineFilter} />
        <button
          onClick={handleResetFilters}
          style={{ backgroundColor: '#dc3545', color: '#fff' }}
        >
          Сбросить фильтры
        </button>
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
      </div>

      {/* Активные фильтры */}
      {activeFilters.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Применённые фильтры:</strong>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {activeFilters.map((filter, i) => (
              <li
                key={i}
                style={{ display: 'inline-block', marginRight: '10px' }}
              >
                <span
                  style={{
                    background: '#007bff',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {filter}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Граф */}
      <div style={{ width: '100%', height: 'calc(100vh - 150px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          minZoom={0.3}
          maxZoom={2.5}
          fitView
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
        >
          <svg>
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerUnits="strokeWidth"
                markerWidth="3"
                markerHeight="3"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#555" />
              </marker>
            </defs>
          </svg>
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>

      {/* Боковая панель с деталями задачи */}
      {selectedTask && (
        <TaskDetailsSidebar
          key={selectedTask.taskId || 'closed'}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={fetchTasksFromServer}
        />
      )}

      {/* Модалки */}
      {isSortModalOpen && (
        <SortModal
          fields={[
            { label: 'Название', value: 'title' },
            { label: 'Дата создания', value: 'createdAt' },
            { label: 'Дата завершения', value: 'deadline' },
            { label: 'Статус', value: 'status' },
            { label: 'Приоритет', value: 'priority' },
          ]}
          onApply={(field, order) => {
            setSortField(field);
            setSortOrder(order);
            setIsSortModalOpen(false);
          }}
          onClose={() => setIsSortModalOpen(false)}
        />
      )}
      {isConnectionModalOpen && (
        <div className="modal-overlay-graph-edges">
          <div className="modal-content-graph-edges">
            <h3>Введите название связи</h3>
            <input
              type="text"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              placeholder="Название связи"
              maxLength={20}
            />
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={async () => {
                  if (connectionName == '') {
                    alert('Название не может быть пустым!');
                    return;
                  }
                  const { sourceId, targetId } = selectedSourceTask;
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(
                      `${SERVER}/api/task/relationships/`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          task_id_from: sourceId,
                          task_id_to: targetId,
                          title: connectionName,
                        }),
                      },
                    );
                    if (response.ok) {
                      const newEdge = {
                        id: `e-${sourceId}-${targetId}`,
                        source: sourceId,
                        target: targetId,
                        label: connectionName,
                        type: 'default',
                        style: { stroke: '#f39c12', strokeWidth: 10.5 },
                        markerStart: { type: MarkerType.ArrowClosed },
                        markerEnd: { type: MarkerType.ArrowClosed },
                      };
                      setEdges((eds) => addEdge(newEdge, eds));
                    } else {
                      alert('Ошибка при создании связи');
                    }
                  } catch (err) {
                    console.error('Ошибка:', err);
                    alert('Не удалось создать связь');
                  } finally {
                    resetEdgeCreation();
                    setConnectionName('');
                    setIsConnectionModalOpen(false);
                  }
                }}
              >
                Создать
              </button>
              <button
                onClick={() => {
                  resetEdgeCreation();
                  setConnectionName('');
                  setIsConnectionModalOpen(false);
                }}
                style={{ marginLeft: '10px' }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      {creationHint && <div className="creation-hint">{creationHint}</div>}
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
      {isCreatingTask && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreatingTask(false)}
        />
      )}
      {isTagsModalOpen && (
        <TagsModal
          isOpen={isTagsModalOpen}
          onClose={() => setIsTagsModalOpen(false)}
          setSelectedTask={setSelectedTask}
        />
      )}
    </div>
  );
});

export default MainGraph;
