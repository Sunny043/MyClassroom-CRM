const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const Student = require('../models/Student');
const User = require('../models/User');
const { verifyToken } = require('./auth.route');

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
router.route('/create').post(verifyToken, async (req, res) => {
  try {
    // Only admin can create branches
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create branches' });
    }

    const { 
      name, 
      code, 
      description, 
      hodName, 
      hodEmail, 
      coordinatorUsername, 
      coordinatorPassword,
      coordinatorFullName,
      coordinatorEmail 
    } = req.body;

    // Validate input
    if (!name || !code || !coordinatorUsername || !coordinatorPassword) {
      return res.status(400).json({ message: 'Branch name, code, and coordinator credentials are required' });
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

    // Check if coordinator username already exists
    const existingUser = await User.findOne({ username: coordinatorUsername });
    if (existingUser) {
      return res.status(400).json({ message: 'Coordinator username already exists' });
    }

    const newBranch = new Branch({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description?.trim() || '',
      hodName: hodName?.trim() || '',
      hodEmail: hodEmail?.trim() || '',
      coordinatorCredentials: {
        username: coordinatorUsername.trim(),
        password: coordinatorPassword
      },
      sections: [
        {
          name: 'A',
          maxCapacity: 60,
          currentStrength: 0,
          isActive: true
        }
      ]
    });

    const savedBranch = await newBranch.save();

    // Create coordinator user
    const coordinator = new User({
      username: coordinatorUsername.trim(),
      password: coordinatorPassword,
      role: 'coordinator',
      branchId: savedBranch._id,
      fullName: coordinatorFullName || `${name} Coordinator`,
      email: coordinatorEmail || `${coordinatorUsername}@myclassroom.com`
    });

    await coordinator.save();

    res.status(201).json(savedBranch);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET branch by ID
router.route('/:id').get(verifyToken, async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check authorization - coordinators can only view their own branch
    if (req.user.role === 'coordinator' && req.user.branchId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(branch);
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// UPDATE branch
router.route('/update/:id').put(verifyToken, async (req, res) => {
  try {
    // Only admin can update branches
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can update branches' });
    }

    const { name, description, hodName, hodEmail } = req.body;

    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim(),
        description: description?.trim() || '',
        hodName: hodName?.trim() || '',
        hodEmail: hodEmail?.trim() || '',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json(updatedBranch);
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ADD section to branch
router.route('/:id/sections').post(verifyToken, async (req, res) => {
  try {
    const { name, maxCapacity = 60 } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Section name is required' });
    }

    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check authorization
    if (req.user.role === 'coordinator' && req.user.branchId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if section already exists
    const existingSection = branch.sections.find(section => section.name === name.trim());
    if (existingSection) {
      return res.status(400).json({ message: 'Section with this name already exists in this branch' });
    }

    branch.sections.push({
      name: name.trim(),
      maxCapacity,
      currentStrength: 0,
      isActive: true
    });

    const updatedBranch = await branch.save();
    res.json(updatedBranch);
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// UPDATE section in branch
router.route('/:branchId/sections/:sectionId').put(verifyToken, async (req, res) => {
  try {
    const { name, maxCapacity, isActive } = req.body;

    const branch = await Branch.findById(req.params.branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check authorization
    if (req.user.role === 'coordinator' && req.user.branchId !== req.params.branchId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const section = branch.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    if (name) section.name = name.trim();
    if (maxCapacity) section.maxCapacity = maxCapacity;
    if (typeof isActive === 'boolean') section.isActive = isActive;

    const updatedBranch = await branch.save();
    res.json(updatedBranch);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET branch statistics
router.route('/:id/stats').get(verifyToken, async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check authorization
    if (req.user.role === 'coordinator' && req.user.branchId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalStudents = await Student.countDocuments({ branchId: req.params.id });
    
    const sectionStats = await Promise.all(
      branch.sections.map(async (section) => {
        const studentCount = await Student.countDocuments({
          branchId: req.params.id,
          sectionName: section.name
        });
        return {
          sectionName: section.name,
          capacity: section.maxCapacity,
          enrolled: studentCount,
          available: section.maxCapacity - studentCount
        };
      })
    );

    res.json({
      branch,
      totalStudents,
      totalSections: branch.sections.length,
      sectionStats
    });
  } catch (error) {
    console.error('Error fetching branch stats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// DELETE/DEACTIVATE branch
router.route('/delete/:id').delete(verifyToken, async (req, res) => {
  try {
    // Only admin can delete branches
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete branches' });
    }

    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check if branch has students
    const studentCount = await Student.countDocuments({ branchId: req.params.id });
    if (studentCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete branch. It has ${studentCount} students enrolled.` 
      });
    }

    // Soft delete
    branch.isActive = false;
    await branch.save();

    // Deactivate coordinator
    await User.updateOne(
      { branchId: req.params.id, role: 'coordinator' },
      { isActive: false }
    );

    res.json({ message: 'Branch deactivated successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
