const db = require('../models');
const Role = db.role;

/**
 * Seeds the roles table with predefined roles
 */
const seedRoles = async () => {
  try {
    // Get count of roles in the database
    const count = await Role.count();
    
    // Only seed if no roles exist
    if (count === 0) {
      console.log('Seeding roles...');
      
      // Create roles from the predefined ROLES array
      const rolePromises = db.ROLES.map(roleName => {
        return Role.create({ name: roleName });
      });
      
      await Promise.all(rolePromises);
      console.log('Roles seeded successfully!');
    } else {
      console.log('Roles already exist, skipping seeder.');
    }
  } catch (error) {
    console.error('Error seeding roles:', error.message);
  }
};

module.exports = seedRoles;