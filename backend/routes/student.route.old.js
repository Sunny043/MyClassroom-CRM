const express = require('express');
const router = express.Router();

// Student Model
let Student = require('../models/Student');
let Branch = require('../models/Branch');
let Section = require('../models/Section');

// CREATE Student
router.route('/create-student').post(async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phone, dateOfBirth, gender, address,
      studentId, rollNo, branchId, sectionId, year, semester, admissionDate, academicYear,
      guardianName, guardianPhone, emergencyContact, bloodGroup
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !gender ||
        !studentId || !rollNo || !branchId || !sectionId || !year || !semester ||
        !admissionDate || !academicYear || !guardianName || !guardianPhone) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Validate section exists and belongs to the branch
    const section = await Section.findOne({ _id: sectionId, branchId });
    if (!section) {
      return res.status(404).json({ message: 'Section not found or does not belong to the specified branch' });
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

    // Create new student
    const newStudent = new Student({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      dateOfBirth,
      gender,
      address,
      studentId: studentId.toUpperCase(),
      rollNo,
      branchId,
      sectionId,
      year: parseInt(year),
      semester: parseInt(semester),
      admissionDate,
      academicYear,
      guardianName,
      guardianPhone,
      emergencyContact,
      bloodGroup
    });

    const savedStudent = await newStudent.save();

    // Update section and branch student counts
    await Section.findByIdAndUpdate(sectionId, { $inc: { currentStrength: 1 } });
    await Branch.findByIdAndUpdate(branchId, { $inc: { totalStudents: 1 } });

    // Populate branch and section info for response
    const populatedStudent = await Student.findById(savedStudent._id)
      .populate('branchId', 'name code')
      .populate('sectionId', 'name');

    res.status(201).json(populatedStudent);
  } catch (error) {
    console.error('Error creating student:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === 'studentId' ? 'Student ID' : 'Email'} already exists` 
      });
    }

    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// READ Students with Advanced Search and Filtering
router.route('/').get(async (req, res, next) => {
  try {
    const { 
      search, branchId, sectionId, year, semester, gender, status, 
      sort, limit, page, academicYear 
    } = req.query;

    const filter = { isActive: true };

    // Apply filters
    if (branchId) filter.branchId = branchId;
    if (sectionId) filter.sectionId = sectionId;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (gender) filter.gender = gender;
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;

    // Search functionality (across multiple fields)
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex },
        { rollNo: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'name_desc':
        sortOption = { firstName: -1, lastName: -1 };
        break;
      case 'student_id':
        sortOption = { studentId: 1 };
        break;
      case 'student_id_desc':
        sortOption = { studentId: -1 };
        break;
      case 'admission_date':
        sortOption = { admissionDate: 1 };
        break;
      case 'admission_date_desc':
        sortOption = { admissionDate: -1 };
        break;
      default:
        sortOption = { firstName: 1, lastName: 1 }; // Default: A-Z by name
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Execute query with population
    const students = await Student.find(filter)
      .populate('branchId', 'name code')
      .populate('sectionId', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalStudents = await Student.countDocuments(filter);
    const totalPages = Math.ceil(totalStudents / limitNum);

    res.json({
      students,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalStudents,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get Single Student
router.route('/edit-student/:id').get(async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('branchId', 'name code')
      .populate('sectionId', 'name');
      
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update Student
router.route('/update-student/:id').put(async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phone, dateOfBirth, gender, address,
      studentId, rollNo, branchId, sectionId, year, semester, admissionDate, academicYear,
      guardianName, guardianPhone, emergencyContact, bloodGroup, status
    } = req.body;

    // Get current student to check for changes
    const currentStudent = await Student.findById(req.params.id);
    if (!currentStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !gender ||
        !studentId || !rollNo || !branchId || !sectionId || !year || !semester ||
        !admissionDate || !academicYear || !guardianName || !guardianPhone) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Validate section exists and belongs to the branch
    const section = await Section.findOne({ _id: sectionId, branchId });
    if (!section) {
      return res.status(404).json({ message: 'Section not found or does not belong to the specified branch' });
    }

    // Check if student ID or email already exists (excluding current student)
    const existingStudent = await Student.findOne({
      _id: { $ne: req.params.id },
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

    // Track section changes for count updates
    const oldBranchId = currentStudent.branchId.toString();
    const oldSectionId = currentStudent.sectionId.toString();
    const newBranchId = branchId.toString();
    const newSectionId = sectionId.toString();

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        dateOfBirth,
        gender,
        address,
        studentId: studentId.toUpperCase(),
        rollNo,
        branchId,
        sectionId,
        year: parseInt(year),
        semester: parseInt(semester),
        admissionDate,
        academicYear,
        guardianName,
        guardianPhone,
        emergencyContact,
        bloodGroup,
        status: status || 'Active'
      },
      { new: true, runValidators: true }
    ).populate('branchId', 'name code')
     .populate('sectionId', 'name');

    // Update counts if section or branch changed
    if (oldSectionId !== newSectionId) {
      // Decrease count from old section
      await Section.findByIdAndUpdate(oldSectionId, { $inc: { currentStrength: -1 } });
      // Increase count in new section
      await Section.findByIdAndUpdate(newSectionId, { $inc: { currentStrength: 1 } });
    }

    if (oldBranchId !== newBranchId) {
      // Decrease count from old branch
      await Branch.findByIdAndUpdate(oldBranchId, { $inc: { totalStudents: -1 } });
      // Increase count in new branch
      await Branch.findByIdAndUpdate(newBranchId, { $inc: { totalStudents: 1 } });
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === 'studentId' ? 'Student ID' : 'Email'} already exists` 
      });
    }

    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete Student (Soft Delete)
router.route('/delete-student/:id').delete(async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Soft delete - set isActive to false instead of removing
    const deletedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false, status: 'Inactive' },
      { new: true }
    ).populate('branchId', 'name code')
     .populate('sectionId', 'name');

    // Update counts only if student was active
    if (student.isActive) {
      await Section.findByIdAndUpdate(student.sectionId, { $inc: { currentStrength: -1 } });
      await Branch.findByIdAndUpdate(student.branchId, { $inc: { totalStudents: -1 } });
    }

    res.status(200).json({
      message: 'Student deleted successfully',
      student: deletedStudent
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Additional routes for the new college structure

// GET students by branch
router.route('/branch/:branchId').get(async (req, res) => {
  try {
    const { branchId } = req.params;
    const { year, semester, sectionId } = req.query;

    const filter = { branchId, isActive: true };
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (sectionId) filter.sectionId = sectionId;

    const students = await Student.find(filter)
      .populate('branchId', 'name code')
      .populate('sectionId', 'name')
      .sort({ firstName: 1, lastName: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students by branch:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET students by section
router.route('/section/:sectionId').get(async (req, res) => {
  try {
    const { sectionId } = req.params;

    const students = await Student.find({ sectionId, isActive: true })
      .populate('branchId', 'name code')
      .populate('sectionId', 'name')
      .sort({ rollNo: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students by section:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET student statistics
router.route('/stats').get(async (req, res) => {
  try {
    const { branchId, sectionId } = req.query;
    const filter = { isActive: true };

    if (branchId) filter.branchId = branchId;
    if (sectionId) filter.sectionId = sectionId;

    const totalStudents = await Student.countDocuments(filter);
    const maleStudents = await Student.countDocuments({ ...filter, gender: 'Male' });
    const femaleStudents = await Student.countDocuments({ ...filter, gender: 'Female' });
    
    // Status breakdown
    const activeStudents = await Student.countDocuments({ ...filter, status: 'Active' });
    const inactiveStudents = await Student.countDocuments({ ...filter, status: 'Inactive' });
    const graduatedStudents = await Student.countDocuments({ ...filter, status: 'Graduated' });

    res.json({
      totalStudents,
      maleStudents,
      femaleStudents,
      activeStudents,
      inactiveStudents,
      graduatedStudents
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
