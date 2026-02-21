'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── employees ────────────────────────────────────────────────────────────
    await queryInterface.createTable('employees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      cpf: {
        type: Sequelize.STRING(11),
        allowNull: false,
        unique: true,
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      hire_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      available_vacation_days: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });

    // ─── vacation_schedules ───────────────────────────────────────────────────
    await queryInterface.createTable('vacation_schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onDelete: 'RESTRICT',
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      total_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'finalized', 'canceled'),
        allowNull: false,
        defaultValue: 'scheduled',
      },
      cancellation_reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });

    // ─── vacation_accrual_logs ────────────────────────────────────────────────
    await queryInterface.createTable('vacation_accrual_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onDelete: 'RESTRICT',
      },
      days_added: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      balance_before: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
      },
      balance_after: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
      },
      reference_month: {
        type: Sequelize.STRING(7), // format: YYYY-MM
        allowNull: false,
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // ─── vacation_consumption_logs ────────────────────────────────────────────
    await queryInterface.createTable('vacation_consumption_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      vacation_schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'vacation_schedules', key: 'id' },
        onDelete: 'RESTRICT',
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onDelete: 'RESTRICT',
      },
      action: {
        type: Sequelize.ENUM('started', 'day_consumed', 'finalized'),
        allowNull: false,
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    // drop in reverse order to respect foreign keys
    await queryInterface.dropTable('vacation_consumption_logs');
    await queryInterface.dropTable('vacation_accrual_logs');
    await queryInterface.dropTable('vacation_schedules');
    await queryInterface.dropTable('employees');

    // drop ENUM types (MySQL requires this after dropping the table)
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS `enum_vacation_schedules_status`",
    );
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS `enum_vacation_consumption_logs_action`",
    );
  },
};
