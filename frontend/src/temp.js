export const GROUP_DICT = {
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
        edges: [
            {
              name: 'Norm very long Norm very long Norm very long Norm very long, Norm very long Norm very long Norm very long Norm very long', // Имя связи
              connectedTask: 'Graph 2' // Связанные задачи
            },
            {
              name: 'Norm2',
              connectedTask: 'Graph 2'
            },
            {
              name: 'Norm3',
              connectedTask: 'Graph 2'
            },
            {
              name: 'Norm4',
              connectedTask: 'Graph 2'
            },
            {
              name: 'Norm5',
              connectedTask: 'Graph 2'
            },
          ]
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
        edges: [
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
      },








      {
        name: 'Graph 21',
        deadline: '2023-12-25',
        createdAt: '2023-11-25',
        modifiedAt: '2023-12-05',
        description: 'Description of Graph 21',
        status: 'active',
        priority: 'high',
        time: '1.5h',
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
      },
      {
        name: 'Graph 22',
        deadline: '2023-12-30',
        createdAt: '2023-11-30',
        modifiedAt: '2023-12-10',
        description: 'Description of Graph 22',
        status: 'inactive',
        priority: 'medium',
        time: '2h',
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
      },
      {
        name: 'Graph 23',
        deadline: '2024-01-05',
        createdAt: '2023-12-05',
        modifiedAt: '2023-12-15',
        description: 'Description of Graph 23',
        status: 'active',
        priority: 'low',
        time: '4h',
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
      },
      {
        name: 'Graph 24',
        deadline: '2024-01-10',
        createdAt: '2023-12-10',
        modifiedAt: '2023-12-20',
        description: 'Description of Graph 24',
        status: 'inactive',
        priority: 'high',
        time: '1h',
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5'
          ]
      }
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
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
        edges: [
            'Graph 2',
            'Graph 3',
            'Graph 4',
            'Graph 5',
        ]
      },
    ],
  },
  group3: {
    name: 'Group 3',
    graphs: [],
    edges: [
        'Graph 2',
        'Graph 3',
        'Graph 4',
        'Graph 5',
    ]
  },



  
};
