const pool = require('../config');
const validator = require('validator');

// Helper function to handle errors
const handleItemError = (err) => {
    let errors = { category: '', perishable: '', weight: '', threshold: '', expiry_date: '', rfid: '' };
    
    if (err.constraint === 'items_rfid_fkey') {
        errors.rfid = 'Invalid RFID tag or tag is already in use';
    } else if (err.constraint === 'items_camera_id_fkey') {
        errors.camera_id = 'Invalid camera ID';
    } else if (err.message === 'Invalid weight value') {
        errors.weight = err.message;
    } else if (err.message === 'Invalid threshold value') {
        errors.threshold = err.message;
    } else if (err.message === 'Expiry date is required for perishable items') {
        errors.expiry_date = err.message;
    } else if (err.message === 'RFID tag is already in use') {
        errors.rfid = err.message;
    } else if (err.message === 'Invalid expiry date format') {
        errors.expiry_date = err.message;
    }
    
    return errors;
};

// @desc    Register a new item
// @route   POST /api/items
// @access  Private
module.exports.registerItem = async (req, res) => {
    try {
        const { 
            category, 
            perishable, 
            weight, 
            dry, 
            fragile, 
            threshold,
            expiry_date,
            camera_id,
            rfid
        } = req.body;

        // Validate weight and threshold as positive numbers
        if (isNaN(weight) || weight <= 0) {
            throw new Error('Invalid weight value');
        }

        if (isNaN(threshold) || threshold <= 0) {
            throw new Error('Invalid threshold value');
        }

        // Ensure perishable items have an expiry date
        if (perishable && !expiry_date) {
            throw new Error('Expiry date is required for perishable items');
        }

        // Validate expiry date format if provided
        if (expiry_date && !validator.isDate(expiry_date)) {
            throw new Error('Invalid expiry date format');
        }

        // Check if RFID tag exists and is not already in use
        const rfidResult = await pool.query(
            'SELECT * FROM rfid_tags WHERE rfid = $1',
            [rfid]
        );

        if (rfidResult.rows.length === 0) {
            return res.status(404).json({ 
                message: 'RFID tag not found',
                errors: { rfid: 'RFID tag not found in the system' }
            });
        }

        if (rfidResult.rows[0].used) {
            return res.status(400).json({ 
                message: 'RFID tag is already in use',
                errors: { rfid: 'This RFID tag is already associated with another item' }
            });
        }

        // Validate camera_id exists
        const cameraResult = await pool.query(
            'SELECT * FROM camera WHERE camera_id = $1',
            [camera_id]
        );

        if (cameraResult.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Camera ID not found',
                errors: { camera_id: 'Camera ID does not exist in the system' }
            });
        }

        // Generate a unique ID for the item
        const idResult = await pool.query('SELECT MAX(id) as max_id FROM items');
        const newId = idResult.rows[0].max_id ? parseInt(idResult.rows[0].max_id) + 1 : 1;

        // Set automatic timestamp for item registration
        const timestamp_in = new Date().toISOString();

        // Create new item
        const itemResult = await pool.query(
            `INSERT INTO items (
                id, 
                category, 
                perishable, 
                weight, 
                dry, 
                fragile, 
                threshold, 
                expiry_date, 
                timestamp_in, 
                camera_id, 
                rfid
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                newId,
                category,
                perishable,
                weight,
                dry,
                fragile,
                threshold,
                expiry_date ? new Date(expiry_date) : null,
                timestamp_in,
                camera_id,
                rfid
            ]
        );

        // Update RFID tag to mark as used
        await pool.query(
            'UPDATE rfid_tags SET used = true WHERE rfid = $1',
            [rfid]
        );

        res.status(201).json({
            message: 'Item registered successfully',
            item: itemResult.rows[0]
        });
    } catch (err) {
        console.error('Error registering item:', err);
        const errors = handleItemError(err);
        res.status(400).json({ 
            message: 'Failed to register item', 
            errors 
        });
    }
};

// @desc    Get all items with optional filtering and pagination
// @route   GET /api/items
// @access  Private
module.exports.getItems = async (req, res) => {
    try {
        // Query parameters for filtering
        const { 
            category, 
            perishable, 
            page = 1, 
            limit = 10,
            sort_by = 'id',
            sort_order = 'asc',
            expired = null
        } = req.query;

        // Build the WHERE clause based on filters
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        if (category) {
            whereConditions.push(`category = $${paramIndex}`);
            queryParams.push(category);
            paramIndex++;
        }

        if (perishable !== undefined) {
            whereConditions.push(`perishable = $${paramIndex}`);
            queryParams.push(perishable === 'true');
            paramIndex++;
        }

        // Add expired filter if requested
        if (expired === 'true') {
            whereConditions.push(`expiry_date < CURRENT_DATE AND perishable = true`);
        } else if (expired === 'false') {
            whereConditions.push(`(expiry_date >= CURRENT_DATE OR expiry_date IS NULL OR perishable = false)`);
        }

        // Build the WHERE clause string
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Calculate pagination values
        const offset = (page - 1) * limit;

        // Validate sort_by to prevent SQL injection
        const validSortFields = ['id', 'category', 'weight', 'timestamp_in', 'expiry_date'];
        const validSortField = validSortFields.includes(sort_by) ? sort_by : 'id';

        // Validate sort_order
        const sortDirection = sort_order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM items
            ${whereClause}
        `;
        
        const countResult = await pool.query(countQuery, queryParams);
        const totalItems = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalItems / limit);

        // Get items with pagination
        const itemsQuery = `
            SELECT * 
            FROM items
            ${whereClause}
            ORDER BY ${validSortField} ${sortDirection}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        const finalQueryParams = [...queryParams, limit, offset];
        const itemsResult = await pool.query(itemsQuery, finalQueryParams);

        res.status(200).json({
            items: itemsResult.rows,
            pagination: {
                total: totalItems,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ 
            message: 'Error fetching items', 
            error: err.message 
        });
    }
};

// @desc    Get a single item by ID
// @route   GET /api/items/:id
// @access  Private
module.exports.getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM items WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching item:', err);
        res.status(500).json({ 
            message: 'Error fetching item', 
            error: err.message 
        });
    }
};

// @desc    Update an item's status
// @route   PUT /api/items/:id
// @access  Private
module.exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            category, 
            weight, 
            dry, 
            fragile, 
            threshold,
            expiry_date,
            camera_id,
            timestamp_out
        } = req.body;

        // Check if item exists
        const itemCheck = await pool.query(
            'SELECT * FROM items WHERE id = $1',
            [id]
        );

        if (itemCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const currentItem = itemCheck.rows[0];

        // Validate weight and threshold if provided
        if (weight !== undefined && (isNaN(weight) || weight <= 0)) {
            throw new Error('Invalid weight value');
        }

        if (threshold !== undefined && (isNaN(threshold) || threshold <= 0)) {
            throw new Error('Invalid threshold value');
        }

        // Validate expiry date format if provided
        if (expiry_date && !validator.isDate(expiry_date)) {
            throw new Error('Invalid expiry date format');
        }

        // Validate camera_id exists if provided
        if (camera_id) {
            const cameraResult = await pool.query(
                'SELECT * FROM camera WHERE camera_id = $1',
                [camera_id]
            );

            if (cameraResult.rows.length === 0) {
                return res.status(404).json({ 
                    message: 'Camera ID not found',
                    errors: { camera_id: 'Camera ID does not exist in the system' }
                });
            }
        }

        // Build update query dynamically
        let updateFields = [];
        let queryParams = [];
        let paramIndex = 1;

        if (category !== undefined) {
            updateFields.push(`category = $${paramIndex}`);
            queryParams.push(category);
            paramIndex++;
        }

        if (weight !== undefined) {
            updateFields.push(`weight = $${paramIndex}`);
            queryParams.push(weight);
            paramIndex++;
        }

        if (dry !== undefined) {
            updateFields.push(`dry = $${paramIndex}`);
            queryParams.push(dry);
            paramIndex++;
        }

        if (fragile !== undefined) {
            updateFields.push(`fragile = $${paramIndex}`);
            queryParams.push(fragile);
            paramIndex++;
        }

        if (threshold !== undefined) {
            updateFields.push(`threshold = $${paramIndex}`);
            queryParams.push(threshold);
            paramIndex++;
        }

        if (expiry_date !== undefined) {
            updateFields.push(`expiry_date = $${paramIndex}`);
            queryParams.push(expiry_date ? new Date(expiry_date) : null);
            paramIndex++;
        }

        if (camera_id !== undefined) {
            updateFields.push(`camera_id = $${paramIndex}`);
            queryParams.push(camera_id);
            paramIndex++;
        }

        // Handle timestamp_out (item leaving the warehouse)
        let rfidReleased = false;
        
        if (timestamp_out === true) {
            updateFields.push(`timestamp_out = $${paramIndex}`);
            queryParams.push(new Date().toISOString());
            paramIndex++;
            rfidReleased = true;
        }

        // If no fields to update, return the current item
        if (updateFields.length === 0) {
            return res.status(200).json({
                message: 'No changes to update',
                item: currentItem
            });
        }

        // Execute update query
        const updateQuery = `
            UPDATE items 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        queryParams.push(id);
        const result = await pool.query(updateQuery, queryParams);

        // If item is leaving warehouse, release the RFID tag
        if (rfidReleased && currentItem.rfid) {
            await pool.query(
                'UPDATE rfid_tags SET used = false WHERE rfid = $1',
                [currentItem.rfid]
            );
        }

        res.status(200).json({
            message: 'Item updated successfully',
            item: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating item:', err);
        const errors = handleItemError(err);
        res.status(400).json({ 
            message: 'Failed to update item', 
            errors 
        });
    }
};

// @desc    Check expired items
// @route   GET /api/items/expired
// @access  Private
module.exports.getExpiredItems = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM items 
             WHERE perishable = true 
             AND expiry_date < CURRENT_DATE
             AND timestamp_out IS NULL
             ORDER BY expiry_date ASC`
        );

        res.status(200).json({
            count: result.rows.length,
            items: result.rows
        });
    } catch (err) {
        console.error('Error fetching expired items:', err);
        res.status(500).json({ 
            message: 'Error fetching expired items', 
            error: err.message 
        });
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private (Admin only)
module.exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if item exists and get RFID before deletion
        const itemCheck = await pool.query(
            'SELECT * FROM items WHERE id = $1',
            [id]
        );

        if (itemCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const rfidToRelease = itemCheck.rows[0].rfid;

        // Delete the item
        await pool.query(
            'DELETE FROM items WHERE id = $1',
            [id]
        );

        // Release the RFID tag if one was assigned
        if (rfidToRelease) {
            await pool.query(
                'UPDATE rfid_tags SET used = false WHERE rfid = $1',
                [rfidToRelease]
            );
        }

        res.status(200).json({ 
            message: 'Item deleted successfully',
            id
        });
    } catch (err) {
        console.error('Error deleting item:', err);
        res.status(500).json({ 
            message: 'Error deleting item', 
            error: err.message 
        });
    }
};