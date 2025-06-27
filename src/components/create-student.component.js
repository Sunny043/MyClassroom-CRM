import React from "react";

function CreateStudent() {
  return (
    <div className="create-student-card">
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Create Student</h2>
      <form style={{ width: "100%" }}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter name"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
          />
        </div>
        <div className="form-group">
          <label>Roll No</label>
          <input
            type="text"
            placeholder="Enter roll number"
          />
        </div>
        <button type="submit" className="submit-button">
          Create Student
        </button>
      </form>
    </div>
  );
}

export default CreateStudent;
