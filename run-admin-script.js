// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the admin script
require('./dist/scripts/set-admin-role.js');
