module.exports.fetch = 'SELECT * FROM users';
module.exports.search = 'SELECT * FROM users WHERE username = $1';
module.exports.searchById = 'SELECT * FROM users WHERE user_id = $1';
module.exports.signUp = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *';