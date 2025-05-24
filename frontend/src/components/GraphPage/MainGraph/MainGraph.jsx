import React, { useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

import SearchBar from '../../SearchBar/SearchBar';
import FilterDropdown from '../../TasksPage/FilterDropdown/FilterDropdown';
import DateFilterDropdown from '../../TasksPage/DateFilterDropdown/DateFilterDropdown';
import SortModal from '../../TasksPage/SortModal/SortModal';
import TagsModal from '../../TasksPage/TagsModal/TagsModal';
import TaskDetailsSidebar from '../../TasksPage/TaskDetailsSidebar/TaskDetailsSidebar';
import InteractiveTaskNode from '../InteractiveTaskNode/InteractiveTaskNode';
import { SERVER } from '../../../Constants';
import './MainGraph.css';

const nodeTypes = {
  taskNode: InteractiveTaskNode,
};

const MainGraph = ({ selectedGroup }) => {
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

  const generateLayoutedElements = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB' }); // TB = top to bottom, LR = left to right

    // Добавляем ноды с фиксированным размером
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 200, height: 80 });
    });

    // Добавляем связи
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Выполняем вычисления расположения
    dagre.layout(dagreGraph);

    // Обновляем позиции нодов из рассчитанных dagre
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.position = {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      };
      return node;
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
    if (selectedGroup)
      params.append('group', selectedGroup);
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
        related_tasks: task.related_tasks || [],
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

      const initialEdges = mappedTasks.flatMap((task) =>
        task.related_tasks.map((relatedId) =>
          addEdge(
            {
              id: `e-${task.id}-${relatedId}`,
              source: task.id,
              target: relatedId,
            },
            [],
          ),
        ),
      );

      const { nodes: layoutedNodes, edges: layoutedEdges } = generateLayoutedElements(
        initialNodes,
        initialEdges
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (error) {
      console.error('Ошибка:', error);
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
      setIsTagsModalOpen(true);
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
        <button onClick={loadTags}>Фильтр по тегам</button>
        <button
          onClick={handleResetFilters}
          style={{ backgroundColor: '#dc3545', color: '#fff' }}
        >
          Сбросить фильтры
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
          fitView
          onNodeClick={(event, node) => {
            setSelectedTask(node.data.task);
          }}
        >
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
    </div>
  );
};

export default MainGraph;
