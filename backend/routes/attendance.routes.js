const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const AttendanceSession = require('../models/attendanceSession.model');
const AttendanceRecord = require('../models/attendanceRecord.model');
const Enrollment = require('../models/enrollment.model');
const User = require('../models/user.model');

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
 * POST /api/attendance/start
 * Protected, Teacher-only
 * Starts an attendance session and notifies connected students
 */
router.post('/start', verifyToken, checkTeacher, async (req, res) => {
    try {
        const { subjectId } = req.body;

        if (!subjectId) {
            return res.status(400).json({ error: 'Subject ID is required' });
        }

        // Generate session ID
        const sessionId = uuidv4();

        // Create attendance session
        const session = await AttendanceSession.create({
            sessionId,
            subject: subjectId,
            teacher: req.userId,
            status: 'active'
        });

        // Find all students enrolled in this subject
        const enrollments = await Enrollment.find({ subject: subjectId })
            .populate('user');

        // Get io and connectedUsers from app settings
        const io = req.app.get('io');
        const connectedUsers = req.app.get('connectedUsers');

        // Notify each connected student
        enrollments.forEach(enrollment => {
            const studentId = enrollment.user._id.toString();
            const socketId = connectedUsers[studentId];

            if (socketId) {
                io.to(socketId).emit('start-attendance', { sessionId });
                console.log(`Sent start-attendance event to student ${studentId}`);
            } else {
                console.log(`Student ${studentId} is not connected`);
            }
        });

        return res.status(200).json({
            message: 'Attendance session started',
            sessionId,
            studentsNotified: enrollments.length
        });
    } catch (error) {
        console.error('Start attendance error:', error);
        return res.status(500).json({ error: 'Failed to start attendance session' });
    }
});

/**
 * POST /api/attendance/submit
 * Protected, Teacher-only
 * Submits attendance records for students
 */
router.post('/submit', verifyToken, checkTeacher, async (req, res) => {
    try {
        const { sessionId, studentIds } = req.body;

        if (!sessionId || !studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({ error: 'Session ID and student IDs array are required' });
        }

        // Find the attendance session
        const session = await AttendanceSession.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({ error: 'Attendance session not found' });
        }

        // Create attendance records for each student
        const records = await AttendanceRecord.insertMany(
            studentIds.map(studentId => ({
                session: session._id,
                student: studentId,
                status: 'present'
            }))
        );

        // Update session status to completed
        await AttendanceSession.findByIdAndUpdate(session._id, {
            status: 'completed',
            completedAt: new Date()
        });

        return res.status(201).json({
            message: 'Attendance records created successfully',
            recordsCreated: records.length
        });
    } catch (error) {
        console.error('Submit attendance error:', error);
        return res.status(500).json({ error: 'Failed to submit attendance records' });
    }
});

module.exports = router;
