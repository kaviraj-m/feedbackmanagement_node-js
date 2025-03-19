const db = require('../models');
const Department = db.department;
const Role = db.role;

/**
 * Seeds the departments table with predefined departments
 */
const seedDepartments = async () => {
  try {
    // Get count of departments in the database
    const count = await Department.count();
    
    // Only seed if no departments exist
    if (count === 0) {
      console.log('Seeding departments...');
      
      // Get roles to associate with departments
      const studentRole = await Role.findOne({ where: { name: 'student' } });
      const staffRole = await Role.findOne({ where: { name: 'staff' } });
      
      if (!studentRole || !staffRole) {
        console.error('Required roles not found. Make sure role seeder has been run.');
        return;
      }
      
      // Create default departments
      const departments = [
        {
          name: 'Computer Science and Engineering',
          description: 'Department for Computer Science and Engineering courses',
          roleId: studentRole.id
        },
        {
          name: 'Electrical Engineering',
          description: 'Department for Electrical Engineering courses',
          roleId: studentRole.id
        },
        {
          name: 'Mathematics',
          description: 'Department for Mathematics courses',
          roleId: studentRole.id
        },
        {
          name: 'Staff Department',
          description: 'Department for staff members',
          roleId: staffRole.id
        }
      ];
      
      // Create departments
      const departmentPromises = departments.map(dept => {
        return Department.create(dept);
      });
      
      await Promise.all(departmentPromises);
      console.log('Departments seeded successfully!');
    } else {
      console.log('Departments already exist, skipping seeder.');
    }
  } catch (error) {
    console.error('Error seeding departments:', error.message);
  }
};

module.exports = seedDepartments;