import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";
import Swal from "sweetalert2";

export default class CreateBranch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      code: "",
      description: "",
      errors: {}
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      errors: { ...this.state.errors, [name]: "" }
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    const { name, code, description } = this.state;

    // Basic validation
    const errors = {};
    if (!name.trim()) errors.name = "Branch name is required";
    if (!code.trim()) errors.code = "Branch code is required";

    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    const branchObject = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim()
    };

    axios
      .post("http://localhost:4000/branches/create", branchObject)
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Branch created successfully",
          showConfirmButton: false,
          timer: 1500
        });

        this.setState({
          name: "",
          code: "",
          description: "",
          errors: {}
        });

        // Redirect to branch list after a short delay
        setTimeout(() => {
          this.props.history.push("/branch-list");
        }, 1500);
      })
      .catch((error) => {
        console.error("Error creating branch:", error.response?.data);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response?.data?.message || "Failed to create branch"
        });
      });
  };

  render() {
    const { name, code, description, errors } = this.state;

    return (
      <div className="form-wrapper">
        <h2>Add New Branch</h2>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="name">
                <Form.Label>Branch Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={name}
                  placeholder="Enter branch name (e.g., Computer Science)"
                  onChange={this.handleInputChange}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="code">
                <Form.Label>Branch Code</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={code}
                  placeholder="Enter branch code (e.g., CSE)"
                  onChange={this.handleInputChange}
                  isInvalid={!!errors.code}
                  style={{ textTransform: 'uppercase' }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="description">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={description}
              placeholder="Enter branch description"
              onChange={this.handleInputChange}
            />
          </Form.Group>

          <Button variant="success" size="lg" block="block" type="submit">
            Create Branch
          </Button>
        </Form>
      </div>
    );
  }
}
