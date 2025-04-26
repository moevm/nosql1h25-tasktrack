import React, { useEffect, useState } from 'react';
import SearchBar from '../../SearchBar/SearchBar';
import FilterDropdown from '../FilterDropdown/FilterDropdown';
import './TableGraph.css';
import TaskDetailsSidebar from '../TaskDetailsSidebar/TaskDetailsSidebar';

const GROUP_DICT = {
  group1: {
    name: 'Group 1',
    graphs: [
      {
        name: 'Graph 1',
        deadline: '2023-10-01',
        createdAt: '2023-09-01',
        modifiedAt: '2023-09-15',
        description:
          'Статья исследует влияние социальных сетей на формирование самооценки у подростков.  Используя качественные методы, включая интервью и фокус-группы, работа выявляет как позитивные (например, возможность самовыражения), так и негативные (например, сравнение с другими, кибербуллинг) аспекты влияния.  Авторы  рассматривают взаимосвязь между частым использованием соцсетей и уровнем тревожности и депрессии, а также предлагают рекомендации по повышению цифровой грамотности подростков и поддержке их психического благополучия в виртуальной среде.  Результаты  подчеркивают необходимость комплексного подхода к пониманию и решению этой проблемы.',
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
      {
        name: 'Graph 6',
        deadline: '2023-10-12',
        createdAt: '2023-09-12',
        modifiedAt: '2023-09-28',
        description: 'Description of Graph 6',
        status: 'inactive',
        priority: 'high',
        time: '4h',
      },
      {
        name: 'Graph 7',
        deadline: '2023-10-18',
        createdAt: '2023-09-18',
        modifiedAt: '2023-10-02',
        description: 'Description of Graph 7',
        status: 'active',
        priority: 'medium',
        time: '2.5h',
      },
      {
        name: 'Graph 8',
        deadline: '2023-10-25',
        createdAt: '2023-09-25',
        modifiedAt: '2023-10-05',
        description: 'Description of Graph 8',
        status: 'inactive',
        priority: 'low',
        time: '1h',
      },
      {
        name: 'Graph 9',
        deadline: '2023-10-30',
        createdAt: '2023-09-30',
        modifiedAt: '2023-10-10',
        description: 'Description of Graph 9',
        status: 'active',
        priority: 'high',
        time: '5h',
      },
      {
        name: 'Graph 10',
        deadline: '2023-11-01',
        createdAt: '2023-10-01',
        modifiedAt: '2023-10-15',
        description: 'Description of Graph 10',
        status: 'inactive',
        priority: 'medium',
        time: '2h',
      },
      {
        name: 'Graph 11',
        deadline: '2023-11-05',
        createdAt: '2023-10-05',
        modifiedAt: '2023-10-20',
        description: 'Description of Graph 11',
        status: 'active',
        priority: 'low',
        time: '1h',
      },
      {
        name: 'Graph 12',
        deadline: '2023-11-10',
        createdAt: '2023-10-10',
        modifiedAt: '2023-10-25',
        description: 'Description of Graph 12',
        status: 'inactive',
        priority: 'high',
        time: '3h',
      },
      {
        name: 'Graph 13',
        deadline: '2023-11-15',
        createdAt: '2023-10-15',
        modifiedAt: '2023-10-30',
        description: 'Description of Graph 13',
        status: 'active',
        priority: 'medium',
        time: '1.5h',
      },
      {
        name: 'Graph 14',
        deadline: '2023-11-20',
        createdAt: '2023-10-20',
        modifiedAt: '2023-11-01',
        description: 'Description of Graph 14',
        status: 'inactive',
        priority: 'low',
        time: '2h',
      },
      {
        name: 'Graph 15',
        deadline: '2023-11-25',
        createdAt: '2023-10-25',
        modifiedAt: '2023-11-05',
        description: 'Description of Graph 15',
        status: 'active',
        priority: 'high',
        time: '4h',
      },
      {
        name: 'Graph 16',
        deadline: '2023-11-30',
        createdAt: '2023-10-30',
        modifiedAt: '2023-11-10',
        description: 'Description of Graph 16',
        status: 'inactive',
        priority: 'medium',
        time: '1h',
      },
      {
        name: 'Graph 17',
        deadline: '2023-12-05',
        createdAt: '2023-11-05',
        modifiedAt: '2023-11-15',
        description: 'Description of Graph 17',
        status: 'active',
        priority: 'low',
        time: '30m',
      },
      {
        name: 'Graph 18',
        deadline: '2023-12-10',
        createdAt: '2023-11-10',
        modifiedAt: '2023-11-20',
        description: 'Description of Graph 18',
        status: 'inactive',
        priority: 'high',
        time: '2.5h',
      },
      {
        name: 'Graph 19',
        deadline: '2023-12-15',
        createdAt: '2023-11-15',
        modifiedAt: '2023-11-25',
        description: 'Description of Graph 19',
        status: 'active',
        priority: 'medium',
        time: '1h',
      },
      {
        name: 'Graph 20',
        deadline: '2023-12-20',
        createdAt: '2023-11-20',
        modifiedAt: '2023-11-30',
        description: 'Description of Graph 20',
        status: 'inactive',
        priority: 'low',
        time: '3h',
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

const ITEMS_PER_PAGE = 12;
const STATUS_OPTIONS = ['active', 'inactive'];
const PRIORITY_OPTIONS = ['high', 'medium', 'low'];

const fetchTasksFromServer = async (
  searchTerm = '',
  page = 1,
  statuses = [],
  priorities = [],
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
        edges: '–',
        status: graph.status,
        priority: graph.priority,
        time: graph.time,
        description: graph.description,
      });
    }
  });

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageData = all.slice(start, end);

  return {
    data: pageData,
    total: all.length,
  };
};

export default function TableGraph() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchTasksFromServer(
        searchTerm,
        page,
        selectedStatuses,
        selectedPriorities,
      );
      setRows(res.data);
      setTotal(res.total);
    };

    fetchData();
  }, [searchTerm, page, selectedStatuses, selectedPriorities]);

  const handleSearch = (value) => {
    console.log(`Поиск по запросу: "${value}"`);
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
    alert(`Показ связей для задачи: ${task.title}`);
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
    </div>
  );
}
