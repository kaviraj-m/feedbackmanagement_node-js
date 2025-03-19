const seedRoles = require('./role.seeder');
const seedDepartments = require('./department.seeder');

/**
 * Main seeder function that calls all seeders
 */
const runSeeders = async () => {
  try {
    console.log('Running database seeders...');
    
    // Run role seeder
    await seedRoles();
    
    // Run department seeder (after roles are created)
    await seedDepartments();
    
    console.log('All seeders completed successfully!');
  } catch (error) {
    console.error('Error running seeders:', error.message);
  }
};

module.exports = runSeeders;