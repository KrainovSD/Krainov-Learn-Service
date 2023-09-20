'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('categories', 'lastRepeat', {
          transaction: t,
        }),
        queryInterface.removeColumn('categories', 'lastReverseRepeat', {
          transaction: t,
        }),
        queryInterface.removeColumn('categories', 'repeatHistory', {
          transaction: t,
        }),
        queryInterface.removeColumn('categories', 'reverseRepeatHistory', {
          transaction: t,
        }),
        queryInterface.addColumn(
          'categories',
          'countRepeat',
          {
            type: Sequelize.DataTypes.INTEGER,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'categories',
          'countReverseRepeat',
          {
            type: Sequelize.DataTypes.INTEGER,
          },
          { transaction: t },
        ),
        queryInterface.removeColumn('knowns', 'repeatHistory', {
          transaction: t,
        }),
        queryInterface.removeColumn('knowns', 'reverseRepeatHistory', {
          transaction: t,
        }),
        queryInterface.addColumn(
          'knowns',
          'dateStartLearn',
          {
            type: Sequelize.DataTypes.DATE,
          },
          { transaction: t },
        ),
        queryInterface.removeColumn('repeats', 'lastRepeat', {
          transaction: t,
        }),
        queryInterface.removeColumn('repeats', 'lastReverseRepeat', {
          transaction: t,
        }),
        queryInterface.removeColumn('repeats', 'repeatHistory', {
          transaction: t,
        }),
        queryInterface.removeColumn('repeats', 'reverseRepeatHistory', {
          transaction: t,
        }),
        queryInterface.addColumn(
          'repeats',
          'countRepeat',
          {
            type: Sequelize.DataTypes.INTEGER,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'repeats',
          'countReverseRepeat',
          {
            type: Sequelize.DataTypes.INTEGER,
          },
          { transaction: t },
        ),
      ])
    })
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'categories',
          'lastRepeat',
          {
            type: Sequelize.DataTypes.DATE,
          },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'categories',
          'lastReverseRepeat',
          {
            type: Sequelize.DataTypes.DATE,
          },
          {
            transaction: t,
          },
        ),
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
        queryInterface.addColumn(
          'categories',
          'reverseRepeatHistory',
          {
            type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.DATE),
          },
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn('categories', 'countRepeat', {
          transaction: t,
        }),
        queryInterface.removeColumn('categories', 'countReverseRepeat', {
          transaction: t,
        }),
        queryInterface.addColumn(
          'knowns',
          'repeatHistory',
          {
            type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.DATE),
          },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'knowns',
          'reverseRepeatHistory',
          {
            type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.DATE),
          },
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn('knowns', 'dateStartLearn', {
          transaction: t,
        }),
        queryInterface.addColumn(
          'repeats',
          'lastRepeat',
          {
            type: Sequelize.DataTypes.DATE,
          },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'repeats',
          'lastReverseRepeat',
          {
            type: Sequelize.DataTypes.DATE,
          },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'repeats',
          'repeatHistory',
          {
            type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.DATE),
          },
          {
            transaction: t,
          },
        ),
        queryInterface.addColumn(
          'repeats',
          'reverseRepeatHistory',
          {
            type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.DATE),
          },
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn('repeats', 'countRepeat', {
          transaction: t,
        }),
        queryInterface.removeColumn('repeats', 'countReverseRepeat', {
          transaction: t,
        }),
      ])
    })
  },
}
