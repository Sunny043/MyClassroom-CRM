import React, { useState, useEffect, useCallback } from "react";
import { Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import { useHistory } from "react-router-dom";

function CreateStudent() {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India"
    },
    
    // Academic Information
    studentId: "",
    rollNo: "",
    branchId: "",
    sectionName: "A",
    year: "",
    semester: "",
    admissionDate: "",
    academicYear: "",
    
    // Additional Information
    guardianName: "",
    guardianPhone: "",
    emergencyContact: {
      name: "",
      phone: "",
      relation: ""
    },
    bloodGroup: ""
  });

  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const history = useHistory();

  // Get current user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // If coordinator, set their branch automatically
      if (parsedUser.role === "coordinator" && parsedUser.branch) {
        setFormData(prev => ({
          ...prev,
          branchId: parsedUser.branch._id
        }));
      }
    }
  }, []);

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:4000/branches");
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  }, []);

  // Fetch sections for selected branch
  const fetchSections = useCallback(async (branchId) => {
    if (!branchId) {
      setSections([]);
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:4000/students/sections/${branchId}`);
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching sections:", error);
      setSections([]);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (formData.branchId) {
      fetchSections(formData.branchId);
    }
  }, [formData.branchId, fetchSections]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender',
      'studentId', 'rollNo', 'branchId', 'sectionName', 'year', 'semester',
      'admissionDate', 'academicYear', 'guardianName', 'guardianPhone'
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate form before submission
    const isValid = validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to continue");
        return;
      }

      await axios.post("http://localhost:4000/students/create-student", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Student created successfully!");
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India"
        },
        studentId: "",
        rollNo: "",
        branchId: user?.role === "coordinator" ? user.branch?._id : "",
        sectionName: "A",
        year: "",
        semester: "",
        admissionDate: "",
        academicYear: "",
        guardianName: "",
        guardianPhone: "",
        emergencyContact: {
          name: "",
          phone: "",
          relation: ""
        },
        bloodGroup: ""
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        history.push("/student-list");
      }, 2000);

    } catch (error) {
      console.error("Error creating student:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to create student. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <Card className="shadow-lg">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0 text-center">Create New Student</h3>
        </Card.Header>
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">Personal Information</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date of Birth *</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Gender *</Form.Label>
                    <Form.Control
                      as="select"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Blood Group</Form.Label>
                    <Form.Control
                      as="select"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Academic Information */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">Academic Information</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Student ID *</Form.Label>
                    <Form.Control
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Enter student ID"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Roll Number *</Form.Label>
                    <Form.Control
                      type="text"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleChange}
                      placeholder="Enter roll number"
                      required
                    />
                    <Form.Text className="text-muted">
                      Please enter a unique roll number for the student
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Branch *</Form.Label>
                    <Form.Control
                      as="select"
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleChange}
                      required
                      disabled={user?.role === "coordinator"}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name} ({branch.code})
                        </option>
                      ))}
                    </Form.Control>
                    {user?.role === "coordinator" && (
                      <Form.Text className="text-muted">
                        You can only create students in your assigned branch
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Section *</Form.Label>
                    <Form.Control
                      as="select"
                      name="sectionName"
                      value={formData.sectionName}
                      onChange={handleChange}
                      required
                      disabled={!formData.branchId}
                    >
                      <option value="">
                        {!formData.branchId ? "Select branch first" : "Select Section"}
                      </option>
                      {sections.map((section) => (
                        <option key={section._id} value={section.name}>
                          {section.name} ({section.currentStrength}/{section.maxCapacity})
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Year *</Form.Label>
                    <Form.Control
                      as="select"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Semester *</Form.Label>
                    <Form.Control
                      as="select"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Semester</option>
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                      <option value="3">3rd Semester</option>
                      <option value="4">4th Semester</option>
                      <option value="5">5th Semester</option>
                      <option value="6">6th Semester</option>
                      <option value="7">7th Semester</option>
                      <option value="8">8th Semester</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Admission Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Academic Year *</Form.Label>
                    <Form.Control
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleChange}
                      placeholder="e.g., 2024-25"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Guardian Information */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">Guardian Information</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Guardian Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="guardianName"
                      value={formData.guardianName}
                      onChange={handleChange}
                      placeholder="Enter guardian name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Guardian Phone *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleChange}
                      placeholder="Enter guardian phone"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Emergency Contact Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      placeholder="Enter emergency contact name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Emergency Contact Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      placeholder="Enter emergency contact phone"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Submit Button */}
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg" 
                disabled={loading}
                className="mt-3"
              >
                {loading ? "Creating..." : "Create Student"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CreateStudent;
