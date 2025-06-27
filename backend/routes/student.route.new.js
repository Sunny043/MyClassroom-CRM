const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Branch = require('../models/Branch');
const { verifyToken } = require('./auth.route');

// CREATE Student
router.route('/create-student').post(verifyToken, async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phone, dateOfBirth, gender, address,
      studentId, rollNo, branchId, sectionName, year, semester, admissionDate, academicYear,
      guardianName, guardianPhone, emergencyContact, bloodGroup
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !gender ||
        !studentId || !rollNo || !branchId || !sectionName || !year || !semester ||
        !admissionDate || !academicYear || !guardianName || !guardianPhone) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check authorization - coordinators can only create students in their branch
    if (req.user.role === 'coordinator' && req.user.branchId !== branchId) {
      return res.status(403).json({ message: 'You can only create students in your branch' });
    }

    // Validate branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Validate section exists in the branch
    const section = branch.sections.find(s => s.name === sectionName && s.isActive);
    if (!section) {
      return res.status(404).json({ message: 'Section not found or inactive in the specified branch' });
    }

    // Check section capacity
    const currentStudentsInSection = await Student.countDocuments({
      branchId,
      sectionName
    });

    if (currentStudentsInSection >= section.maxCapacity) {
      return res.status(400).json({ 
        message: `Section ${sectionName} is full. Maximum capacity: ${section.maxCapacity}` 
      });
    }

    // Check if student ID or email already exists
    const existingStudent = await Student.findOne({
      $or: [
        { studentId: studentId.toUpperCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingStudent) {
      return res.status(400).json({ 
        message: existingStudent.studentId === studentId.toUpperCase() 
          ? 'Student ID already exists' 
          : 'Email already exists' 
      });
    }

    // Generate roll number if not provided
    let finalRollNo = rollNo;
    if (!finalRollNo) {
      const studentsInYear = await Student.countDocuments({
        branchId,
        year,
        sectionName
      });
      finalRollNo = `${branch.code}${year}${sectionName}${String(studentsInYear + 1).padStart(3, '0')}`;
    }

    // Create student
    const newStudent = new Student({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      address: {
        street: address?.street?.trim() || '',
        city: address?.city?.trim() || '',
        state: address?.state?.trim() || '',
        zipCode: address?.zipCode?.trim() || '',
        country: address?.country?.trim() || 'India'
      },
      studentId: studentId.toUpperCase().trim(),
      rollNo: finalRollNo,
      branchId,
      sectionName,
      year: parseInt(year),
      semester: parseInt(semester),
      admissionDate: new Date(admissionDate),
      academicYear: academicYear.trim(),
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      emergencyContact: {
        name: emergencyContact?.name?.trim() || '',
        phone: emergencyContact?.phone?.trim() || '',
        relation: emergencyContact?.relation?.trim() || ''
      },
      bloodGroup: bloodGroup?.trim() || ''
    });

    const savedStudent = await newStudent.save();

    // Update section strength
    section.currentStrength = currentStudentsInSection + 1;
    await branch.save();

    res.status(201).json({
      message: 'Student created successfully',
      student: savedStudent
    });

  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

// GET all students
router.route('/').get(verifyToken, async (req, res) => {
  try {
    let query = {};
    
    // Coordinators can only see students from their branch
    if (req.user.role === 'coordinator') {
      query.branchId = req.user.branchId;
    }

    const students = await Student.find(query)
      .populate('branchId', 'name code')
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET student by ID
router.route('/edit-student/:id').get(verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('branchId');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check authorization
    if (req.user.role === 'coordinator' && 
        student.branchId._id.toString() !== req.user.branchId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// UPDATE student
router.route('/update-student/:id').put(verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check authorization
    if (req.user.role === 'coordinator' && 
        student.branchId.toString() !== req.user.branchId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      firstName, lastName, email, phone, dateOfBirth, gender, address,
      rollNo, sectionName, year, semester, academicYear,
      guardianName, guardianPhone, emergencyContact, bloodGroup
    } = req.body;

    // Update fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone) updateData.phone = phone.trim();
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (address) updateData.address = address;
    if (rollNo) updateData.rollNo = rollNo.trim();
    if (sectionName) updateData.sectionName = sectionName;
    if (year) updateData.year = parseInt(year);
    if (semester) updateData.semester = parseInt(semester);
    if (academicYear) updateData.academicYear = academicYear.trim();
    if (guardianName) updateData.guardianName = guardianName.trim();
    if (guardianPhone) updateData.guardianPhone = guardianPhone.trim();
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (bloodGroup) updateData.bloodGroup = bloodGroup.trim();

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('branchId');

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// DELETE student
router.route('/delete-student/:id').delete(verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check authorization
    if (req.user.role === 'coordinator' && 
        student.branchId.toString() !== req.user.branchId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Student.findByIdAndDelete(req.params.id);

    // Update section strength
    const branch = await Branch.findById(student.branchId);
    if (branch) {
      const section = branch.sections.find(s => s.name === student.sectionName);
      if (section && section.currentStrength > 0) {
        section.currentStrength--;
        await branch.save();
      }
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET students by branch
router.route('/branch/:branchId').get(verifyToken, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role === 'coordinator' && req.user.branchId !== req.params.branchId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const students = await Student.find({ branchId: req.params.branchId })
      .populate('branchId', 'name code')
      .sort({ sectionName: 1, rollNo: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students by branch:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET sections for a branch
router.route('/sections/:branchId').get(async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const activeSections = branch.sections.filter(section => section.isActive);
    res.json(activeSections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// SEARCH and FILTER students
router.route('/search').get(verifyToken, async (req, res) => {
  try {
    const { 
      search, 
      branchId, 
      sectionName, 
      year, 
      semester, 
      academicYear,
      page = 1, 
      limit = 10 
    } = req.query;

    let query = {};

    // Apply role-based filtering
    if (req.user.role === 'coordinator') {
      query.branchId = req.user.branchId;
    }

    // Apply filters
    if (branchId && req.user.role === 'admin') query.branchId = branchId;
    if (sectionName) query.sectionName = sectionName;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    if (academicYear) query.academicYear = academicYear;

    // Apply search
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ];
    }

    const totalStudents = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('branchId', 'name code')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      students,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: parseInt(page),
      totalStudents
    });

  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
