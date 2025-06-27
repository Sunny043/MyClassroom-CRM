import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";
import Swal from "sweetalert2";

export default class CreateSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      branchId: "",
      year: "",
      semester: "",
      maxCapacity: 60,
      classTeacher: "",
      branches: [],
      errors: {}
    };
  }

  componentDidMount() {
    this.fetchBranches();
  }

  fetchBranches = () => {
    axios
      .get("http://localhost:4000/branches")
      .then((res) => {
        this.setState({ branches: res.data });
      })
      .catch((error) => {
        console.error("Error fetching branches:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to fetch branches"
        });
      });
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      errors: { ...this.state.errors, [name]: "" }
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    const { name, branchId, year, semester, maxCapacity, classTeacher } = this.state;

    // Basic validation
    const errors = {};
    if (!name.trim()) errors.name = "Section name is required";
    if (!branchId) errors.branchId = "Branch is required";
    if (!year) errors.year = "Year is required";
    if (!semester) errors.semester = "Semester is required";

    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    const sectionObject = {
      name: name.trim(),
      branchId,
      year: parseInt(year),
      semester: parseInt(semester),
      maxCapacity: parseInt(maxCapacity),
      classTeacher: classTeacher.trim()
    };

    axios
      .post("http://localhost:4000/sections/create", sectionObject)
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Section created successfully",
          showConfirmButton: false,
          timer: 1500
        });

        this.setState({
          name: "",
          branchId: "",
          year: "",
          semester: "",
          maxCapacity: 60,
          classTeacher: "",
          errors: {}
        });

        // Redirect to section list after a short delay
        setTimeout(() => {
          this.props.history.push("/section-list");
        }, 1500);
      })
      .catch((error) => {
        console.error("Error creating section:", error.response?.data);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to create section"
        });
      });
  };

  render() {
    const { name, branchId, year, semester, maxCapacity, classTeacher, branches, errors } = this.state;

    return (
      <div className="form-wrapper">
        <h2>Add New Section</h2>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="name">
                <Form.Label>Section Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={name}
                  placeholder="Enter section name (e.g., A, B, C)"
                  onChange={this.handleInputChange}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="branchId">
                <Form.Label>Branch</Form.Label>
                <Form.Control
                  as="select"
                  name="branchId"
                  value={branchId}
                  onChange={this.handleInputChange}
                  isInvalid={!!errors.branchId}
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.code} - {branch.name}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.branchId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group controlId="year">
                <Form.Label>Academic Year</Form.Label>
                <Form.Control
                  as="select"
                  name="year"
                  value={year}
                  onChange={this.handleInputChange}
                  isInvalid={!!errors.year}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.year}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="semester">
                <Form.Label>Semester</Form.Label>
                <Form.Control
                  as="select"
                  name="semester"
                  value={semester}
                  onChange={this.handleInputChange}
                  isInvalid={!!errors.semester}
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.semester}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="maxCapacity">
                <Form.Label>Max Capacity</Form.Label>
                <Form.Control
                  type="number"
                  name="maxCapacity"
                  value={maxCapacity}
                  min="1"
                  max="100"
                  onChange={this.handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="classTeacher">
            <Form.Label>Class Teacher (Optional)</Form.Label>
            <Form.Control
              type="text"
              name="classTeacher"
              value={classTeacher}
              placeholder="Enter class teacher name"
              onChange={this.handleInputChange}
            />
          </Form.Group>

          <Button variant="success" size="lg" block="block" type="submit">
            Create Section
          </Button>
        </Form>
      </div>
    );
  }
}
