const pool = require('../config');

// Helper function to handle errors
const handleRfidError = (err) => {
    let errors = { rfid: '' };
    
    if (err.constraint === 'rfid_tags_pkey') {
        errors.rfid = 'RFID tag already exists in the system';
    } else if (err.message === 'Invalid RFID value') {
        errors.rfid = err.message;
    }
    
    return errors;
};

// @desc    Register a new RFID tag
// @route   POST /api/rfid/register
// @access  Private
module.exports.registerRfid = async (req, res) => {
    try {
        const { rfid } = req.body;

        // Validate RFID as a positive integer
        if (!Number.isInteger(Number(rfid)) || Number(rfid) <= 0) {
            throw new Error('Invalid RFID value');
        }

        // Check if RFID tag already exists
        const rfidCheck = await pool.query(
            'SELECT * FROM rfid_tags WHERE rfid = $1',
            [rfid]
        );

        if (rfidCheck.rows.length > 0) {
            return res.status(400).json({ 
                message: 'RFID tag already exists',
                errors: { rfid: 'This RFID tag is already registered in the system' }
            });
        }

        // Register new RFID tag with used set to false
        const result = await pool.query(
            'INSERT INTO rfid_tags (rfid, used) VALUES ($1, false) RETURNING *',
            [rfid]
        );

        res.status(201).json({
            message: 'RFID tag registered successfully',
            rfid: result.rows[0]
        });
    } catch (err) {
        console.error('Error registering RFID tag:', err);
        const errors = handleRfidError(err);
        res.status(400).json({ 
            message: 'Failed to register RFID tag', 
            errors 
        });
    }
};

// @desc    Get all RFID tags
// @route   GET /api/rfid
// @access  Private
module.exports.getRfidTags = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM rfid_tags ORDER BY rfid'
        );

        res.status(200).json({
            count: result.rows.length,
            rfidTags: result.rows
        });
    } catch (err) {
        console.error('Error fetching RFID tags:', err);
        res.status(500).json({ 
            message: 'Error fetching RFID tags', 
            error: err.message 
        });
    }
};

// @desc    Delete an RFID tag
// @route   DELETE /api/rfid/:rfid
// @access  Private (Admin only)
module.exports.deleteRfid = async (req, res) => {
    try {
        const { rfid } = req.params;
        
        // Check if the RFID is currently in use
        const checkResult = await pool.query(
            'SELECT used FROM rfid_tags WHERE rfid = $1',
            [rfid]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'RFID tag not found' });
        }
        
        if (checkResult.rows[0].used) {
            return res.status(400).json({ 
                message: 'Cannot delete RFID tag that is currently in use',
                errors: { rfid: 'RFID tag is currently associated with an item' }
            });
        }
        
        // Delete the RFID tag
        await pool.query(
            'DELETE FROM rfid_tags WHERE rfid = $1',
            [rfid]
        );
        
        res.status(200).json({ 
            message: 'RFID tag deleted successfully',
            rfid
        });
    } catch (err) {
        console.error('Error deleting RFID tag:', err);
        res.status(500).json({ 
            message: 'Error deleting RFID tag', 
            error: err.message 
        });
    }
};