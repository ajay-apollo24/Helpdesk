const Department = require('../models/Department');
const User = require('../models/User');
const { USER_ROLES } = require('../../../shared/constants');

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'name email')
      .populate('agents', 'name email');
    
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('agents', 'name email');
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, managerId, categories, settings } = req.body;
    
    // Verify manager exists and is an agent or admin
    const manager = await User.findOne({
      _id: managerId,
      role: { $in: [USER_ROLES.AGENT, USER_ROLES.ADMIN] }
    });
    
    if (!manager) {
      return res.status(400).json({ error: 'Invalid manager ID' });
    }
    
    const department = new Department({
      name,
      description,
      manager: managerId,
      categories: categories || [],
      settings: settings || {},
      metrics: {
        totalTickets: 0,
        openTickets: 0,
        lastUpdated: new Date()
      }
    });
    
    await department.save();
    await department.populate('manager', 'name email');
    
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['name', 'description', 'manager', 'categories', 'settings', 'isActive'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    // If manager is being updated, verify new manager
    if (updates.manager) {
      const manager = await User.findOne({
        _id: updates.manager,
        role: { $in: [USER_ROLES.AGENT, USER_ROLES.ADMIN] }
      });
      
      if (!manager) {
        return res.status(400).json({ error: 'Invalid manager ID' });
      }
    }
    
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('manager', 'name email')
     .populate('agents', 'name email');
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Instead of deleting, mark as inactive
    department.isActive = false;
    await department.save();
    
    res.json({ message: 'Department deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add agent to department
exports.addAgent = async (req, res) => {
  try {
    const { agentId } = req.body;
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Verify agent exists and is an agent
    const agent = await User.findOne({
      _id: agentId,
      role: USER_ROLES.AGENT
    });
    
    if (!agent) {
      return res.status(400).json({ error: 'Invalid agent ID' });
    }
    
    await department.addAgent(agentId);
    await department.populate('agents', 'name email');
    
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove agent from department
exports.removeAgent = async (req, res) => {
  try {
    const { agentId } = req.body;
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    await department.removeAgent(agentId);
    await department.populate('agents', 'name email');
    
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get department metrics
exports.getDepartmentMetrics = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(department.metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 