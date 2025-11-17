const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Subject = require('../models/subject.model');
const Enrollment = require('../models/enrollment.model');

/**
 * Middleware to verify JWT and check teacher role
 */
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    });
};

const checkTeacher = (req, res, next) => {
    if (req.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can access this route' });
    }
    next();
};

/**
 * GET /api/subjects
 * Protected, Teacher-only
 * Returns all subjects the teacher is enrolled in
 */
router.get('/', verifyToken, checkTeacher, async (req, res) => {
    try {
        // Find all enrollments for this teacher
        const enrollments = await Enrollment.find({ user: req.userId })
            .populate('subject');

        // Extract subjects from enrollments
        const subjects = enrollments.map(enrollment => enrollment.subject);

        return res.status(200).json({
            message: 'Subjects retrieved successfully',
            subjects
        });
    } catch (error) {
        console.error('Get subjects error:', error);
        return res.status(500).json({ error: 'Failed to retrieve subjects' });
    }
});

module.exports = router;
