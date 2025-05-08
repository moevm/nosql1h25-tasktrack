import React, { useEffect, useState, useCallback } from 'react';
import './GroupPanel.css';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import SearchBar from '../../SearchBar/SearchBar';
import { SERVER } from '../../../Constants';

export default function GroupPanel({
  setIsGraphMode,
  isGraphMode,
  setSelectedGroup,
  selectedGroup,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allGroups, setAllGroups] = useState([]);
  const [groupList, setGroupList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${SERVER}/api/group/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.groups) {
            setAllGroups(data.groups);
            setGroupList(data.groups);
          }
        })
        .catch((error) => console.error('Ошибка при загрузке групп:', error));
    }
  }, []);

  // Фильтруем группы при изменении searchQuery
  useEffect(() => {
    if (!searchQuery.trim()) {
      setGroupList(allGroups);
      return;
    }

    const filteredGroups = allGroups.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setGroupList(filteredGroups);
  }, [searchQuery, allGroups]);

  const handleToggle = () => {
    setIsGraphMode(!isGraphMode);
  };

  const handleGroupClick = (groupName) => {
    setSelectedGroup(groupName);
  };

  const handleAddGroup = () => {
    const newGroupName = prompt('Введите название новой группы:');
    if (!newGroupName || newGroupName.trim() === '') {
      alert('Название группы не может быть пустым.');
      return;
    }

    const trimmedName = newGroupName.trim();

    if (allGroups.some((group) => group.name === trimmedName)) {
      alert('Группа с таким названием уже существует.');
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${SERVER}/api/group/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedName }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.name) {
            const newGroup = { name: data.name, tasks: [] };
            setAllGroups([...allGroups, newGroup]);
            setGroupList([...groupList, newGroup]);
          }
        })
        .catch((error) =>
          console.error('Ошибка при добавлении группы:', error),
        );
    }
  };

  const handleRenameGroup = (e, index, groupItem) => {
    e.stopPropagation();
    const newName = prompt('Введите новое название группы:', groupItem.name);
    if (newName && newName.trim() !== '') {
      const trimmedName = newName.trim();

      if (allGroups.some((group) => group.name === trimmedName)) {
        alert('Группа с таким названием уже существует.');
        return;
      }

      const updatedGroups = [...allGroups];
      updatedGroups[index] = { ...updatedGroups[index], name: trimmedName };
      setAllGroups(updatedGroups);
      setGroupList(updatedGroups);
    }
  };

  const handleDeleteGroup = (e, index, groupItem) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${SERVER}/api/group/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: groupItem.name }),
      })
        .then(() => {
          const updatedGroups = allGroups.filter((group, idx) => idx !== index);
          setAllGroups(updatedGroups);
          setGroupList(updatedGroups);
        })
        .catch((error) => console.error('Ошибка при удалении группы:', error));
    }
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
        handleSearchChange={(e) => setSearchQuery(e.target.value)}
        TitleFind="Введите название группы"
      />
      <hr />

      <div className="group-list">
        {groupList.length > 0 ? (
          <ul>
            {groupList.map((groupItem, index) => (
              <li
                key={index}
                onClick={() => handleGroupClick(groupItem.name)}
                className={`group-element ${groupItem.name === selectedGroup ? 'selected' : ''}`}
              >
                <span>{groupItem.name}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* <i
                    className="fa-regular fa-pen-to-square edit-icon icon-group"
                    onClick={(e) => handleRenameGroup(e, index, groupItem)}
                  ></i> */}

                  <i
                    className="fa-regular fa-trash-can icon-group"
                    onClick={(e) => handleDeleteGroup(e, index, groupItem)}
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
