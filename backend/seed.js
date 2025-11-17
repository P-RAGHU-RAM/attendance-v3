const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/user.model');
const Subject = require('./models/subject.model');
const Enrollment = require('./models/enrollment.model');

async function seed() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Subject.deleteMany({});
        await Enrollment.deleteMany({});
        console.log('Cleared existing data');

        // Create Teacher user
        const teacher = await User.create({
            phoneNumber: '+15550001111',
            role: 'teacher'
        });
        console.log('Created Teacher user:', teacher.phoneNumber);

        // Create Student user
        const student = await User.create({
            phoneNumber: '+15550002222',
            role: 'student'
        });
        console.log('Created Student user:', student.phoneNumber);

        // Create Subject
        const subject = await Subject.create({
            subjectName: 'Physics 101'
        });
        console.log('Created Subject:', subject.subjectName);

        // Enroll teacher in subject
        const teacherEnrollment = await Enrollment.create({
            user: teacher._id,
            subject: subject._id
        });
        console.log('Enrolled teacher in Physics 101');

        // Enroll student in subject
        const studentEnrollment = await Enrollment.create({
            user: student._id,
            subject: subject._id
        });
        console.log('Enrolled student in Physics 101');

        console.log('✅ Database successfully seeded!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
