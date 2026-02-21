'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // ─── employees ────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('employees', [
      {
        name: 'Alice Mendes',
        email: 'alice.mendes@company.com',
        cpf: '11122233344',
        department: 'Engineering',
        hire_date: '2022-03-01',
        available_vacation_days: 15.00, // ~12 months accrued
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Bruno Carvalho',
        email: 'bruno.carvalho@company.com',
        cpf: '22233344455',
        department: 'Product',
        hire_date: '2021-07-15',
        available_vacation_days: 22.50,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Carla Souza',
        email: 'carla.souza@company.com',
        cpf: '33344455566',
        department: 'Engineering',
        hire_date: '2023-01-10',
        available_vacation_days: 8.75,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Diego Ferreira',
        email: 'diego.ferreira@company.com',
        cpf: '44455566677',
        department: 'Design',
        hire_date: '2020-11-20',
        available_vacation_days: 30.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Elena Costa',
        email: 'elena.costa@company.com',
        cpf: '55566677788',
        department: 'Marketing',
        hire_date: '2023-06-05',
        available_vacation_days: 5.00,
        is_active: false, // inactive — should be ignored by accrual cron
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ─── vacation_schedules ───────────────────────────────────────────────────
    // Fetch inserted employee IDs dynamically
    const [employees] = await queryInterface.sequelize.query(
      `SELECT id, name FROM employees ORDER BY id ASC LIMIT 5`,
    );

    const [alice, bruno, carla, diego] = employees;

    await queryInterface.bulkInsert('vacation_schedules', [
      {
        // Alice: currently in progress
        employee_id: alice.id,
        start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          .toISOString()
          .split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          .toISOString()
          .split('T')[0],
        total_days: 10,
        status: 'in_progress',
        cancellation_reason: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        // Bruno: scheduled for the future
        employee_id: bruno.id,
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        total_days: 15,
        status: 'scheduled',
        cancellation_reason: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        // Carla: already finalized
        employee_id: carla.id,
        start_date: '2024-01-08',
        end_date: '2024-01-17',
        total_days: 10,
        status: 'finalized',
        cancellation_reason: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        // Diego: canceled
        employee_id: diego.id,
        start_date: '2024-03-01',
        end_date: '2024-03-10',
        total_days: 10,
        status: 'canceled',
        cancellation_reason: 'Personal reasons',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ─── vacation_accrual_logs (sample history) ───────────────────────────────
    const [schedules] = await queryInterface.sequelize.query(
      `SELECT id, employee_id FROM vacation_schedules ORDER BY id ASC LIMIT 4`,
    );

    await queryInterface.bulkInsert('vacation_accrual_logs', [
      {
        employee_id: alice.id,
        days_added: 1.25,
        balance_before: 13.75,
        balance_after: 15.00,
        reference_month: '2024-01',
        processed_at: new Date('2024-01-01T00:00:00'),
      },
      {
        employee_id: bruno.id,
        days_added: 1.25,
        balance_before: 21.25,
        balance_after: 22.50,
        reference_month: '2024-01',
        processed_at: new Date('2024-01-01T00:00:00'),
      },
      {
        employee_id: carla.id,
        days_added: 1.25,
        balance_before: 7.50,
        balance_after: 8.75,
        reference_month: '2024-01',
        processed_at: new Date('2024-01-01T00:00:00'),
      },
      {
        employee_id: diego.id,
        days_added: 1.25,
        balance_before: 28.75,
        balance_after: 30.00,
        reference_month: '2024-01',
        processed_at: new Date('2024-01-01T00:00:00'),
      },
    ]);

    // ─── vacation_consumption_logs (sample history) ───────────────────────────
    const aliceSchedule = schedules.find((s) => s.employee_id === alice.id);
    const carlaSchedule = schedules.find((s) => s.employee_id === carla.id);

    await queryInterface.bulkInsert('vacation_consumption_logs', [
      {
        // Alice's vacation started
        vacation_schedule_id: aliceSchedule.id,
        employee_id: alice.id,
        action: 'started',
        processed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        // Alice: day 1 consumed
        vacation_schedule_id: aliceSchedule.id,
        employee_id: alice.id,
        action: 'day_consumed',
        processed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        // Alice: day 2 consumed
        vacation_schedule_id: aliceSchedule.id,
        employee_id: alice.id,
        action: 'day_consumed',
        processed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        // Carla's vacation finalized
        vacation_schedule_id: carlaSchedule.id,
        employee_id: carla.id,
        action: 'finalized',
        processed_at: new Date('2024-01-17T00:05:00'),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('vacation_consumption_logs', null, {});
    await queryInterface.bulkDelete('vacation_accrual_logs', null, {});
    await queryInterface.bulkDelete('vacation_schedules', null, {});
    await queryInterface.bulkDelete('employees', null, {});
  },
};
