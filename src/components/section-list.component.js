import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Swal from "sweetalert2";

export default class SectionList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sections: [],
      branches: [],
      loading: true,
      error: null,
      searchTerm: "",
      filterBranch: "",
      filterYear: "",
      filterSemester: ""
    };
  }

  componentDidMount() {
    this.fetchSections();
    this.fetchBranches();
  }

  fetchSections = () => {
    this.setState({ loading: true });
    const { filterBranch, filterYear, filterSemester } = this.state;
    
    let url = "http://localhost:4000/sections";
    const params = new URLSearchParams();
    
    if (filterBranch) params.append('branchId', filterBranch);
    if (filterYear) params.append('year', filterYear);
    if (filterSemester) params.append('semester', filterSemester);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }

    axios
      .get(url)
      .then((res) => {
        this.setState({
          sections: res.data,
          loading: false,
          error: null
        });
      })
      .catch((error) => {
        console.error("Error fetching sections:", error);
        this.setState({
          loading: false,
          error: "Failed to fetch sections"
        });
      });
  };

  fetchBranches = () => {
    axios
      .get("http://localhost:4000/branches")
      .then((res) => {
        this.setState({ branches: res.data });
      })
      .catch((error) => {
        console.error("Error fetching branches:", error);
      });
  };

  deleteSection = (id, sectionName, branchName) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete section "${sectionName}" from ${branchName}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:4000/sections/delete/${id}`)
          .then((res) => {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Section has been deleted successfully",
              showConfirmButton: false,
              timer: 1500
            });
            this.fetchSections(); // Refresh the list
          })
          .catch((error) => {
            console.error("Error deleting section:", error);
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: error.response?.data?.message || "Failed to delete section"
            });
          });
      }
    });
  };

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleFilterChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value }, () => {
      this.fetchSections();
    });
  };

  clearFilters = () => {
    this.setState({
      filterBranch: "",
      filterYear: "",
      filterSemester: "",
      searchTerm: ""
    }, () => {
      this.fetchSections();
    });
  };

  render() {
    const { sections, branches, loading, error, searchTerm, filterBranch, filterYear, filterSemester } = this.state;

    // Filter sections based on search term
    const filteredSections = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.branchId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.branchId?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.classTeacher.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
      return (
        <div className="text-center mt-4">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <p>Loading sections...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>Error!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={this.fetchSections}>
            Try Again
          </Button>
        </Alert>
      );
    }

    return (
      <div className="table-wrapper">
        <Row className="mb-3">
          <Col md={8}>
            <h2>Section Management</h2>
          </Col>
          <Col md={4} className="text-right">
            <Link className="btn btn-success" to="/create-section">
              Add New Section
            </Link>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-3">
          <Col md={3}>
            <Form.Control
              as="select"
              name="filterBranch"
              value={filterBranch}
              onChange={this.handleFilterChange}
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.code} - {branch.name}
                </option>
              ))}
            </Form.Control>
          </Col>
          <Col md={2}>
            <Form.Control
              as="select"
              name="filterYear"
              value={filterYear}
              onChange={this.handleFilterChange}
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </Form.Control>
          </Col>
          <Col md={2}>
            <Form.Control
              as="select"
              name="filterSemester"
              value={filterSemester}
              onChange={this.handleFilterChange}
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Sem {sem}
                </option>
              ))}
            </Form.Control>
          </Col>
          <Col md={3}>
            <Form.Control
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={this.handleSearchChange}
            />
          </Col>
          <Col md={2}>
            <Button variant="outline-secondary" onClick={this.clearFilters}>
              Clear Filters
            </Button>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={12} className="text-right">
            <Badge variant="info" className="mr-2">
              Total Sections: {filteredSections.length}
            </Badge>
          </Col>
        </Row>

        {filteredSections.length === 0 ? (
          <Alert variant="info">
            {searchTerm || filterBranch || filterYear || filterSemester 
              ? "No sections found matching your criteria." 
              : "No sections available. Create your first section!"}
          </Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Section</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Capacity</th>
                <th>Current Strength</th>
                <th>Class Teacher</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSections.map((section) => (
                <tr key={section._id}>
                  <td>
                    <Badge variant="primary">{section.name}</Badge>
                  </td>
                  <td>
                    <div>
                      <strong>{section.branchId?.code}</strong>
                      <br />
                      <small>{section.branchId?.name}</small>
                    </div>
                  </td>
                  <td>{section.year}</td>
                  <td>{section.semester}</td>
                  <td>{section.maxCapacity}</td>
                  <td>
                    <Badge 
                      variant={section.currentStrength > section.maxCapacity * 0.9 ? "warning" : "info"}
                    >
                      {section.currentStrength}/{section.maxCapacity}
                    </Badge>
                  </td>
                  <td>{section.classTeacher || "N/A"}</td>
                  <td>
                    <Badge variant={section.isActive ? "success" : "danger"}>
                      {section.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <Link
                      className="btn btn-primary btn-sm me-2"
                      to={`/edit-section/${section._id}`}
                    >
                      Edit
                    </Link>
                    <Link
                      className="btn btn-info btn-sm me-2"
                      to={`/students/section/${section._id}`}
                    >
                      Students
                    </Link>
                    <Button
                      className="btn btn-danger btn-sm"
                      onClick={() => this.deleteSection(section._id, section.name, section.branchId?.name)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    );
  }
}
