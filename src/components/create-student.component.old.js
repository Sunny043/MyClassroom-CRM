import React, { useState, useEffect, useCallback } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
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
    sectionId: "",
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
  const history = useHistory();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchSections = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:4000/sections/branch/${formData.branchId}?year=${formData.year}&semester=${formData.semester}`);
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching sections:", error);
      setSections([]);
    }
  }, [formData.branchId, formData.year, formData.semester]);

  useEffect(() => {
    if (formData.branchId && formData.year && formData.semester) {
      fetchSections();
    } else {
      setSections([]);
      setFormData(prev => ({ ...prev, sectionId: "" }));
    }
  }, [formData.branchId, formData.year, formData.semester, fetchSections]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get("http://localhost:4000/branches");
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError("Failed to fetch branches");
    }
  };

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
    
    // Clear error when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    const required = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender',
      'studentId', 'rollNo', 'branchId', 'sectionId', 'year', 'semester',
      'admissionDate', 'academicYear', 'guardianName', 'guardianPhone'
    ];

    for (let field of required) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        return `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      return "Please enter a valid 10-digit phone number";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:4000/students/create-student", formData);
      console.log("Student created successfully:", response.data);
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
        branchId: "",
        sectionId: "",
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

      // Redirect to student list after 2 seconds
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
    <div className="form-wrapper" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Create Student</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <h5 className="mb-3">Personal Information</h5>
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
              <Form.Label>Phone *</Form.Label>
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
          <Col md={4}>
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
          <Col md={4}>
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
          <Col md={4}>
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
        </Row>

        {/* Address */}
        <h5 className="mb-3 mt-4">Address</h5>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Street</Form.Label>
              <Form.Control
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="Enter street address"
              />
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

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>ZIP Code</Form.Label>
              <Form.Control
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                placeholder="Enter ZIP code"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Academic Information */}
        <h5 className="mb-3 mt-4">Academic Information</h5>
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
                style={{ textTransform: 'uppercase' }}
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
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.code} - {branch.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={3}>
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
          <Col md={3}>
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
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Section *</Form.Label>
              <Form.Control
                as="select"
                name="sectionId"
                value={formData.sectionId}
                onChange={handleChange}
                required
                disabled={!formData.branchId || !formData.year || !formData.semester}
              >
                <option value="">
                  {!formData.branchId || !formData.year || !formData.semester 
                    ? "Select branch, year & semester first" 
                    : "Select Section"}
                </option>
                {sections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.name} ({section.currentStrength}/{section.maxCapacity})
                  </option>
                ))}
              </Form.Control>
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

        {/* Guardian Information */}
        <h5 className="mb-3 mt-4">Guardian Information</h5>
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

        {/* Emergency Contact */}
        <h5 className="mb-3 mt-4">Emergency Contact (Optional)</h5>
        <Row>
          <Col md={4}>
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
          <Col md={4}>
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
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Relation</Form.Label>
              <Form.Control
                type="text"
                name="emergencyContact.relation"
                value={formData.emergencyContact.relation}
                onChange={handleChange}
                placeholder="Enter relation"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-grid gap-2 mt-4">
          <Button 
            variant="primary" 
            type="submit" 
            size="lg" 
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Student"}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default CreateStudent;
