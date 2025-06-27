import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Row, Col, Card, Badge, Modal } from "react-bootstrap";
import axios from "axios";

function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);

  const [branchForm, setBranchForm] = useState({
    name: "",
    code: "",
    description: "",
    hodName: "",
    hodEmail: "",
    coordinatorUsername: "",
    coordinatorPassword: "",
    coordinatorFullName: "",
    coordinatorEmail: ""
  });

  const [sectionForm, setSectionForm] = useState({
    name: "",
    maxCapacity: 60
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/branches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError("Failed to fetch branches");
    }
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:4000/branches/create", branchForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Branch created successfully!");
      setBranchForm({
        name: "",
        code: "",
        description: "",
        hodName: "",
        hodEmail: "",
        coordinatorUsername: "",
        coordinatorPassword: "",
        coordinatorFullName: "",
        coordinatorEmail: ""
      });
      setShowCreateModal(false);
      fetchBranches();
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create branch");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBranch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:4000/branches/update/${selectedBranch._id}`, {
        name: branchForm.name,
        description: branchForm.description,
        hodName: branchForm.hodName,
        hodEmail: branchForm.hodEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Branch updated successfully!");
      setShowEditModal(false);
      fetchBranches();
      resetBranchForm();
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update branch");
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:4000/branches/${selectedBranch._id}/sections`, sectionForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Section added successfully!");
      setSectionForm({ name: "", maxCapacity: 60 });
      setShowSectionModal(false);
      fetchBranches();
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (branch) => {
    setSelectedBranch(branch);
    setBranchForm({
      name: branch.name,
      code: branch.code,
      description: branch.description || "",
      hodName: branch.hodName || "",
      hodEmail: branch.hodEmail || "",
      coordinatorUsername: "",
      coordinatorPassword: "",
      coordinatorFullName: "",
      coordinatorEmail: ""
    });
    setShowEditModal(true);
  };

  const openSectionModal = (branch) => {
    setSelectedBranch(branch);
    setShowSectionModal(true);
  };

  const resetBranchForm = () => {
    setBranchForm({
      name: "",
      code: "",
      description: "",
      hodName: "",
      hodEmail: "",
      coordinatorUsername: "",
      coordinatorPassword: "",
      coordinatorFullName: "",
      coordinatorEmail: ""
    });
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <Card className="shadow-lg">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Branch Management</h3>
          {user?.role === "admin" && (
            <Button 
              variant="light" 
              onClick={() => setShowCreateModal(true)}
            >
              Create New Branch
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Row>
            {branches.map((branch) => (
              <Col md={6} lg={4} key={branch._id} className="mb-4">
                <Card className="h-100 border-primary">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">{branch.name}</h5>
                    <small className="text-muted">Code: {branch.code}</small>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted">{branch.description}</p>
                    
                    {branch.hodName && (
                      <div className="mb-2">
                        <strong>HOD:</strong> {branch.hodName}
                      </div>
                    )}

                    <div className="mb-3">
                      <strong>Sections:</strong>
                      <div className="mt-1">
                        {branch.sections?.map((section) => (
                          <Badge 
                            key={section._id} 
                            bg="secondary" 
                            className="me-2 mb-1"
                          >
                            {section.name} ({section.currentStrength}/{section.maxCapacity})
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openSectionModal(branch)}
                        disabled={user?.role === "coordinator" && user?.branch?._id !== branch._id}
                      >
                        Add Section
                      </Button>
                      {user?.role === "admin" && (
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => openEditModal(branch)}
                        >
                          Edit Branch
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Create Branch Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Branch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleBranchSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Branch Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({...branchForm, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Branch Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({...branchForm, code: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={branchForm.description}
                onChange={(e) => setBranchForm({...branchForm, description: e.target.value})}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>HOD Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchForm.hodName}
                    onChange={(e) => setBranchForm({...branchForm, hodName: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>HOD Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={branchForm.hodEmail}
                    onChange={(e) => setBranchForm({...branchForm, hodEmail: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />
            <h6>Coordinator Details</h6>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coordinator Username *</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchForm.coordinatorUsername}
                    onChange={(e) => setBranchForm({...branchForm, coordinatorUsername: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coordinator Password *</Form.Label>
                  <Form.Control
                    type="password"
                    value={branchForm.coordinatorPassword}
                    onChange={(e) => setBranchForm({...branchForm, coordinatorPassword: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coordinator Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchForm.coordinatorFullName}
                    onChange={(e) => setBranchForm({...branchForm, coordinatorFullName: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coordinator Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={branchForm.coordinatorEmail}
                    onChange={(e) => setBranchForm({...branchForm, coordinatorEmail: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Branch"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Branch Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Branch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditBranch}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Branch Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({...branchForm, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Branch Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({...branchForm, code: e.target.value})}
                    required
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={branchForm.description}
                onChange={(e) => setBranchForm({...branchForm, description: e.target.value})}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>HOD Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchForm.hodName}
                    onChange={(e) => setBranchForm({...branchForm, hodName: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>HOD Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={branchForm.hodEmail}
                    onChange={(e) => setBranchForm({...branchForm, hodEmail: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Branch"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Section Modal */}
      <Modal show={showSectionModal} onHide={() => setShowSectionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Section to {selectedBranch?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSectionSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Section Name *</Form.Label>
              <Form.Control
                type="text"
                value={sectionForm.name}
                onChange={(e) => setSectionForm({...sectionForm, name: e.target.value})}
                placeholder="e.g., C, D, E"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Maximum Capacity</Form.Label>
              <Form.Control
                type="number"
                value={sectionForm.maxCapacity}
                onChange={(e) => setSectionForm({...sectionForm, maxCapacity: parseInt(e.target.value)})}
                min="1"
                max="100"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowSectionModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Section"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default BranchManagement;
