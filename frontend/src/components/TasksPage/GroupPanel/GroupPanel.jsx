// GroupPanel.jsx
import React, { useEffect, useState } from 'react';
import './GroupPanel.css';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import SearchBar from '../../SearchBar/SearchBar'; // Импортируем компонент поиска

const GROUP_LIST = [
  'Дом 1',
  'Работа 2',
  'Учеба 3',
  'Спорт 4',
  'Хобби 5',
  'Дом 6',
  'Работа 7',
  'Учеба 8',
  'Спорт 9',
  'Хобби 10',
  'Дом 11',
  'Работа 12',
  'Учеба 13',
  'Спорт 14',
  'Хобби 15',
];

export default function GroupPanel({ setIsGraphMode, isGraphMode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupList, setGroupList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    setGroupList(GROUP_LIST);
  }, []);

  const handleSearch = () => {
    console.log('Поиск по запросу:', searchQuery);
    setGroupList(GROUP_LIST);
    console.log('GROUP_LIST: ', groupList);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleToggle = () => {
    setIsGraphMode(!isGraphMode);
  };

  const handleGroupClick = (groupName) => {
    console.log(`Группа ${groupName} была выбрана`);
    setSelectedGroup(groupName);
  };

  const handleAddGroup = () => {
    console.log('Добавление новой группы');
    const newGroupName = prompt('Введите название новой группы:');

    if (!newGroupName || newGroupName.trim() === '') {
      alert('Название группы не может быть пустым.');
      return;
    }

    const trimmedName = newGroupName.trim();

    if (groupList.includes(trimmedName)) {
      alert('Группа с таким названием уже существует.');
      return;
    }

    setGroupList([...groupList, trimmedName]);
  };

  const handleRenameGroup = (e, index, groupItem) => {
    e.stopPropagation();
    const newName = prompt('Введите новое название группы:', groupItem);
    if (newName && newName.trim() !== '') {
      const trimmedName = newName.trim();

      if (groupList.includes(trimmedName)) {
        alert('Группа с таким названием уже существует.');
        return;
      }

      const updatedGroups = [...groupList];
      updatedGroups[index] = trimmedName;
      setGroupList(updatedGroups);
    }
  };

  const handleDeleteGroup = (e, index, groupItem) => {
    e.stopPropagation();
    console.log(`Удаление группы: ${groupItem}`);
  };

  return (
    <div className="group-panel-container">
      <div className="title-group">Тип интерфейса</div>
      <ToggleSwitch
        isOn={isGraphMode}
        onToggle={handleToggle}
        labelLeft="Таблица"
        labelRight="Графы"
      />
      <div className="title-group" id="group-title-id">
        Группы
      </div>
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
              <li
                key={index}
                onClick={() => handleGroupClick(groupItem)}
                className={`group-element ${groupItem === selectedGroup ? 'selected' : ''}`}
              >
                <span>{groupItem}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <i
                    className="fa-regular fa-pen-to-square edit-icon icon-group"
                    onClick={(e) => handleRenameGroup(e, index, groupItem)}
                  ></i>

                  <i
                    className="fa-regular fa-trash-can icon-group"
                    onClick={(e) => {
                      handleDeleteGroup(e, index, groupItem);
                    }}
                  ></i>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет результатов</p>
        )}
      </div>

      <div className="add-group-container">
        <button className="add-group-button" onClick={handleAddGroup}>
          <i className="fa-solid fa-plus"></i> Добавить группу
        </button>
      </div>
    </div>
  );
}
