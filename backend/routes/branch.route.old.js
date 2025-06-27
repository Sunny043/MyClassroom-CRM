const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const Section = require('../models/Section');
const Student = require('../models/Student');

// GET all branches
router.route('/').get(async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).sort({ name: 1 });
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// CREATE new branch
router.route('/create').post(async (req, res) => {
  try {
    const { name, code, description } = req.body;

    // Validate input
    if (!name || !code) {
      return res.status(400).json({ message: 'Branch name and code are required' });
    }

    // Check if branch already exists
    const existingBranch = await Branch.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { code: code.toUpperCase() }
      ]
    });

    if (existingBranch) {
      return res.status(400).json({ message: 'Branch with this name or code already exists' });
    }

    const newBranch = new Branch({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description?.trim() || ''
    });

    const savedBranch = await newBranch.save();
    res.status(201).json(savedBranch);
  } catch (error) {
    console.error('Error creating branch:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Branch with this name or code already exists' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET single branch
router.route('/:id').get(async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// UPDATE branch
router.route('/update/:id').put(async (req, res) => {
  try {
    const { name, code, description, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (code) updateData.code = code.toUpperCase().trim();
    if (description !== undefined) updateData.description = description.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json(updatedBranch);
  } catch (error) {
    console.error('Error updating branch:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Branch with this name or code already exists' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// DELETE branch (soft delete)
router.route('/delete/:id').delete(async (req, res) => {
  try {
    // Check if branch has students
    const studentCount = await Student.countDocuments({ branchId: req.params.id });
    if (studentCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete branch. It has ${studentCount} students assigned.` 
      });
    }

    // Soft delete branch
    const deletedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deletedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Also deactivate sections in this branch
    await Section.updateMany(
      { branchId: req.params.id },
      { isActive: false }
    );

    res.json({
      message: 'Branch deactivated successfully',
      branch: deletedBranch
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET statistics for a branch
router.route('/:id/stats').get(async (req, res) => {
  try {
    const branchId = req.params.id;
    
    const [totalSections, totalStudents, activeStudents] = await Promise.all([
      Section.countDocuments({ branchId, isActive: true }),
      Student.countDocuments({ branchId }),
      Student.countDocuments({ branchId, status: 'Active' })
    ]);

    // Update branch statistics
    await Branch.findByIdAndUpdate(branchId, {
      totalSections,
      totalStudents
    });

    res.json({
      totalSections,
      totalStudents,
      activeStudents,
      inactiveStudents: totalStudents - activeStudents
    });
  } catch (error) {
    console.error('Error fetching branch statistics:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
