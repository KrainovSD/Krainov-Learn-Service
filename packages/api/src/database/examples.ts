const Sequelize: any = {}
const queryInterface: any = {}

const examples = {
  create: queryInterface.createTable('statistics', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      unique: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: {
          tableName: 'users',
          schema: 'schema',
        },
        key: 'id',
      },
    },
    bestSteak: {
      type: Sequelize.INTEGER,
      defaultValue: null,
      allowNull: true,
    },
    currentStreak: {
      type: Sequelize.INTEGER,
      defaultValue: null,
      allowNull: true,
    },
    lastStreakDate: {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true,
    },
  }),
  add: queryInterface.sequelize.transaction((t: any) => {
    return Promise.all([
      queryInterface.addColumn(
        'categories',
        'repeatHistory',
        {
          type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.DATE),
        },
        {
          transaction: t,
        },
      ),
    ])
  }),
  remove: queryInterface.sequelize.transaction((t: any) => {
    return Promise.all([
      queryInterface.removeColumn('repeats', 'reverseRepeatHistory', {
        transaction: t,
      }),
    ])
  }),
}
