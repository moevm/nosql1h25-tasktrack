// GroupPanel.jsx
import React, { useEffect, useState } from 'react';
import './GroupPanel.css'; 
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import SearchBar from '../../SearchBar/SearchBar'; // Импортируем компонент поиска



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
    grou3: {
        name: 'Group 3',
    },
  };

const GROUP_LIST = [
    'Дом',
    'Работа',
    'Учеба',
    'Спорт',
    'Хобби',
    'Дом',
    'Работа',
    'Учеба',
    'Спорт',
    'Хобби',
    'Дом',
    'Работа',
    'Учеба',
    'Спорт',
    'Хобби',
]

export default function GroupPanel({ setIsGraphMode, isGraphMode }) { 
  const [searchQuery, setSearchQuery] = useState('');
  const [groupList, setGroupList] = useState([]);


  useEffect(() => {
    setGroupList(GROUP_LIST);
  }, []); 

  const handleSearch = () => {
    console.log("Поиск по запросу:", searchQuery)
    setGroupList(GROUP_LIST)
    console.log("GROUP_LIST: ", groupList)

  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleToggle = () => {
    setIsGraphMode(!isGraphMode);
  };

  const handleGroupClick = (groupName) => {
    console.log(`Группа ${groupName} была выбрана`);
  };

  return (
    <div className='group-panel-container'>
      <div className='title-group'>Тип интерфейса</div>
      <ToggleSwitch
        isOn={isGraphMode}
        onToggle={handleToggle}
        labelLeft="Таблица"
        labelRight="Графы"
      />
      <div className="title-group" id='group-title-id'>Группы</div>
      <div className="find-group">Поиск по группам</div>
      <SearchBar 
        searchQuery={searchQuery} 
        handleSearchChange={handleSearchChange} 
        TitleFind="Введите название группы"
        handleSearchSubmit={handleSearch}
      />
      <hr />
      <div className="group-list">
        {groupList.length > 0 ? (
          <ul>
            {groupList.map((groupItem, index) => (
              <li key={index} onClick={() => handleGroupClick(groupItem)}>
                {groupItem}
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет результатов</p>
        )}
      </div>
    </div>
  );
}
