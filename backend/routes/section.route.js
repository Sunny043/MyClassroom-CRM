const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const Branch = require('../models/Branch');
const Student = require('../models/Student');

// GET all sections with optional filtering
router.route('/').get(async (req, res) => {
  try {
    const { branchId, year, semester, active } = req.query;
    const filter = {};

    // Apply filters
    if (branchId) filter.branchId = branchId;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (active !== undefined) filter.isActive = active === 'true';

    const sections = await Section.find(filter)
      .populate('branchId', 'name code')
      .sort({ branchId: 1, year: 1, semester: 1, name: 1 });

    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET sections by branch
router.route('/branch/:branchId').get(async (req, res) => {
  try {
    const { branchId } = req.params;
    const { year, semester } = req.query;

    const filter = { branchId, isActive: true };
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);

    const sections = await Section.find(filter)
      .populate('branchId', 'name code')
      .sort({ year: 1, semester: 1, name: 1 });

    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections by branch:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET single section
router.route('/:id').get(async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('branchId', 'name code');
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// CREATE new section
router.route('/create').post(async (req, res) => {
  try {
    const { name, branchId, year, semester, maxCapacity, classTeacher } = req.body;

    // Validate input
    if (!name || !branchId || !year || !semester) {
      return res.status(400).json({ 
        message: 'Section name, branch, year, and semester are required' 
      });
    }

    // Validate year and semester ranges
    if (year < 1 || year > 4) {
      return res.status(400).json({ message: 'Year must be between 1 and 4' });
    }
    if (semester < 1 || semester > 8) {
      return res.status(400).json({ message: 'Semester must be between 1 and 8' });
    }

    // Check if branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check if section already exists for this branch, year, semester, and name
    const existingSection = await Section.findOne({
      branchId,
      year: parseInt(year),
      semester: parseInt(semester),
      name: name.trim(),
      isActive: true
    });

    if (existingSection) {
      return res.status(400).json({ 
        message: 'Section with this name already exists for the specified branch, year, and semester' 
      });
    }

    const newSection = new Section({
      name: name.trim(),
      branchId,
      year: parseInt(year),
      semester: parseInt(semester),
      maxCapacity: maxCapacity ? parseInt(maxCapacity) : 60,
      classTeacher: classTeacher?.trim() || ''
    });

    const savedSection = await newSection.save();
    
    // Update branch's total sections count
    await Branch.findByIdAndUpdate(branchId, { $inc: { totalSections: 1 } });

    // Populate branch info before sending response
    const populatedSection = await Section.findById(savedSection._id)
      .populate('branchId', 'name code');

    res.status(201).json(populatedSection);
  } catch (error) {
    console.error('Error creating section:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Section with this combination already exists' 
      });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// UPDATE section
router.route('/update/:id').put(async (req, res) => {
  try {
    const { name, maxCapacity, classTeacher, isActive } = req.body;
    const sectionId = req.params.id;

    // Find existing section
    const existingSection = await Section.findById(sectionId);
    if (!existingSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Prepare update object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (maxCapacity !== undefined) updateData.maxCapacity = parseInt(maxCapacity);
    if (classTeacher !== undefined) updateData.classTeacher = classTeacher.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    // Check if name is being changed and if it conflicts
    if (name && name.trim() !== existingSection.name) {
      const conflictingSection = await Section.findOne({
        _id: { $ne: sectionId },
        branchId: existingSection.branchId,
        year: existingSection.year,
        semester: existingSection.semester,
        name: name.trim(),
        isActive: true
      });

      if (conflictingSection) {
        return res.status(400).json({ 
          message: 'Section with this name already exists for the specified branch, year, and semester' 
        });
      }
    }

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      updateData,
      { new: true, runValidators: true }
    ).populate('branchId', 'name code');

    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// UPDATE section student count
router.route('/update-count/:id').patch(async (req, res) => {
  try {
    const sectionId = req.params.id;
    
    // Count students in this section
    const studentCount = await Student.countDocuments({ sectionId, isActive: true });
    
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { currentStrength: studentCount },
      { new: true }
    ).populate('branchId', 'name code');

    if (!updatedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating section count:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// SOFT DELETE section (check for students first)
router.route('/delete/:id').delete(async (req, res) => {
  try {
    const sectionId = req.params.id;

    // Find the section
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Check if there are active students in this section
    const studentCount = await Student.countDocuments({ sectionId, isActive: true });
    if (studentCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete section. ${studentCount} active student(s) are assigned to this section.`,
        studentCount 
      });
    }

    // Soft delete the section
    const deletedSection = await Section.findByIdAndUpdate(
      sectionId,
      { isActive: false },
      { new: true }
    ).populate('branchId', 'name code');

    // Update branch's total sections count
    await Branch.findByIdAndUpdate(section.branchId, { $inc: { totalSections: -1 } });

    res.json({
      message: 'Section deleted successfully',
      section: deletedSection
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET section statistics
router.route('/stats/:id').get(async (req, res) => {
  try {
    const sectionId = req.params.id;

    const section = await Section.findById(sectionId).populate('branchId', 'name code');
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Get student statistics
    const totalStudents = await Student.countDocuments({ sectionId, isActive: true });
    const maleStudents = await Student.countDocuments({ sectionId, gender: 'Male', isActive: true });
    const femaleStudents = await Student.countDocuments({ sectionId, gender: 'Female', isActive: true });

    const stats = {
      section,
      totalStudents,
      maleStudents,
      femaleStudents,
      availableCapacity: section.maxCapacity - totalStudents,
      utilizationPercentage: section.maxCapacity > 0 ? Math.round((totalStudents / section.maxCapacity) * 100) : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching section stats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET all sections statistics
router.route('/stats').get(async (req, res) => {
  try {
    const { branchId } = req.query;
    const filter = { isActive: true };
    if (branchId) filter.branchId = branchId;

    const sections = await Section.find(filter).populate('branchId', 'name code');
    
    const sectionStats = await Promise.all(sections.map(async (section) => {
      const totalStudents = await Student.countDocuments({ sectionId: section._id, isActive: true });
      const maleStudents = await Student.countDocuments({ sectionId: section._id, gender: 'Male', isActive: true });
      const femaleStudents = await Student.countDocuments({ sectionId: section._id, gender: 'Female', isActive: true });
      
      return {
        section,
        totalStudents,
        maleStudents,
        femaleStudents,
        availableCapacity: section.maxCapacity - totalStudents,
        utilizationPercentage: section.maxCapacity > 0 ? Math.round((totalStudents / section.maxCapacity) * 100) : 0
      };
    }));

    res.json(sectionStats);
  } catch (error) {
    console.error('Error fetching sections stats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
