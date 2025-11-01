import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { subjectsAPI, projectsAPI } from "../services/api";
import logo from "../assets/logos/logo.png";
import "./Dashboard.css";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [subjects, setSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");

  // Project upload form state
  const [uploadForm, setUploadForm] = useState({
    projectTitle: "",
    description: "",
    subjectId: "",
    projectFile: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, availableRes, projectsRes] = await Promise.all([
        subjectsAPI.getStudentSubjects(),
        subjectsAPI.getSubjects(),
        projectsAPI.getStudentProjects(),
      ]);

      setSubjects(subjectsRes.data.data || []);
      setAvailableSubjects(availableRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      setMessage("Error loading data");
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const enrollInSubject = async (subjectId) => {
    try {
      const response = await subjectsAPI.enrollStudent(subjectId);
      setMessage("Successfully enrolled in subject!");
      loadData(); // Reload data
    } catch (error) {
      setMessage(error.response?.data?.message || "Error enrolling in subject");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setMessage("File size must be less than 10MB");
        return;
      }

      // Check file type
      const allowedTypes = [
        ".pdf",
        ".doc",
        ".docx",
        ".zip",
        ".rar",
        ".txt",
        ".py",
        ".java",
        ".cpp",
        ".js",
        ".html",
        ".css",
      ];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();

      if (!allowedTypes.includes(fileExtension)) {
        setMessage(
          "Invalid file type. Please upload documents, code files, or archives."
        );
        return;
      }

      setUploadForm({
        ...uploadForm,
        projectFile: file,
      });
    }
  };

  const uploadProject = async (e) => {
    e.preventDefault();

    if (!uploadForm.projectFile) {
      setMessage("Please select a project file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("projectTitle", uploadForm.projectTitle);
      formData.append("description", uploadForm.description);
      formData.append("subjectId", uploadForm.subjectId);
      formData.append("projectFile", uploadForm.projectFile);

      await projectsAPI.uploadProject(formData);

      setMessage("Project uploaded successfully!");
      setShowUploadForm(false);
      setUploadForm({
        projectTitle: "",
        description: "",
        subjectId: "",
        projectFile: null,
      });
      loadData(); // Reload projects
    } catch (error) {
      setMessage(error.response?.data?.message || "Error uploading project");
    }
    setLoading(false);
  };

  const startUpload = (subjectId) => {
    setSelectedSubject(subjectId);
    setUploadForm({
      ...uploadForm,
      subjectId: subjectId,
    });
    setShowUploadForm(true);
  };

  const renderOverview = () => (
    <div className="dashboard-section">
      <h3>Welcome, {user?.username}!</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Enrolled Subjects</h4>
          <p className="stat-number">{subjects.length}</p>
        </div>
        <div className="stat-card">
          <h4>Projects Submitted</h4>
          <p className="stat-number">{projects.length}</p>
        </div>
        <div className="stat-card">
          <h4>Evaluated Projects</h4>
          <p className="stat-number">
            {projects.filter((p) => p.status === "evaluated").length}
          </p>
        </div>
        <div className="stat-card">
          <h4>Average Marks</h4>
          <p className="stat-number">
            {projects.filter((p) => p.status === "evaluated").length > 0
              ? Math.round(
                  projects
                    .filter((p) => p.status === "evaluated")
                    .reduce((acc, p) => acc + p.marks, 0) /
                    projects.filter((p) => p.status === "evaluated").length
                )
              : "--"}
          </p>
        </div>
      </div>

      {/* Recent Projects */}
      <div style={{ marginTop: "30px" }}>
        <h4>Recent Project Submissions</h4>
        {projects.slice(0, 3).map((project) => (
          <div key={project._id} className="project-item">
            <div>
              <strong>{project.projectTitle}</strong> - {project.subjectCode}
              <br />
              <small>
                Status:{" "}
                <span className={`status-badge ${project.status}`}>
                  {project.status.replace("_", " ")}
                </span>
              </small>
              {project.marks && <small> - Marks: {project.marks}/100</small>}
            </div>
          </div>
        ))}
        {projects.length === 0 && <p>No projects submitted yet.</p>}
      </div>
    </div>
  );

  const renderSubjects = () => (
    <div className="dashboard-section">
      <h3>My Subjects</h3>
      {loading ? (
        <p>Loading subjects...</p>
      ) : subjects.length === 0 ? (
        <p>You are not enrolled in any subjects yet.</p>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <div key={subject._id} className="subject-card">
              <h4>{subject.subjectName}</h4>
              <p>Code: {subject.subjectCode}</p>
              <p>Faculty: {subject.facultyName}</p>
              <p>Department: {subject.department}</p>
              <p>Credits: {subject.credits}</p>
              <button
                onClick={() => startUpload(subject._id)}
                className="upload-btn"
                style={{ marginTop: "10px" }}
              >
                Upload Project
              </button>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: "30px" }}>Available Subjects</h3>
      {availableSubjects.length === 0 ? (
        <p>No available subjects.</p>
      ) : (
        <div className="subjects-grid">
          {availableSubjects.map((subject) => {
            const isEnrolled = subjects.some((s) => s._id === subject._id);
            return (
              <div key={subject._id} className="subject-card">
                <h4>{subject.subjectName}</h4>
                <p>Code: {subject.subjectCode}</p>
                <p>Faculty: {subject.facultyName}</p>
                <p>Department: {subject.department}</p>
                {!isEnrolled ? (
                  <button
                    onClick={() => enrollInSubject(subject._id)}
                    className="enroll-btn"
                  >
                    Enroll
                  </button>
                ) : (
                  <span className="enrolled-badge">Enrolled</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h3>My Projects</h3>
        <button onClick={() => setShowUploadForm(true)} className="create-btn">
          + Upload New Project
        </button>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects submitted yet.</p>
      ) : (
        <div className="projects-list">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              <div className="project-header">
                <h4>{project.projectTitle}</h4>
                <span className={`status-badge ${project.status}`}>
                  {project.status.replace("_", " ")}
                </span>
              </div>
              <p>
                <strong>Subject:</strong> {project.subjectCode} -{" "}
                {project.subject?.subjectName}
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(project.submissionDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Description:</strong> {project.description}
              </p>
              <p>
                <strong>File:</strong> {project.fileName} (
                {(project.fileSize / 1024 / 1024).toFixed(2)} MB)
              </p>

              {project.status === "evaluated" && (
                <div className="evaluation-details">
                  <h5>Evaluation Results:</h5>
                  <p>
                    <strong>Marks:</strong> {project.marks}/100
                  </p>
                  <p>
                    <strong>Feedback:</strong> {project.facultyFeedback}
                  </p>
                  {project.evaluationCriteria && (
                    <div className="criteria-grid-small">
                      <span>
                        Innovation: {project.evaluationCriteria.innovation}/25
                      </span>
                      <span>
                        Functionality:{" "}
                        {project.evaluationCriteria.functionality}/25
                      </span>
                      <span>
                        Documentation:{" "}
                        {project.evaluationCriteria.documentation}/25
                      </span>
                      <span>
                        Presentation: {project.evaluationCriteria.presentation}
                        /25
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="project-actions">
                <a
                  href={`${process.env.BASE_URL}/${project.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-btn"
                >
                  View File
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUploadForm = () =>
    showUploadForm && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Upload Project</h3>
            <button
              onClick={() => setShowUploadForm(false)}
              className="close-btn"
            >
              ×
            </button>
          </div>

          <form onSubmit={uploadProject}>
            <div className="form-group">
              <label>Project Title:</label>
              <input
                type="text"
                value={uploadForm.projectTitle}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, projectTitle: e.target.value })
                }
                required
                placeholder="Enter project title"
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, description: e.target.value })
                }
                required
                placeholder="Describe your project..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Subject:</label>
              <select
                value={uploadForm.subjectId}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, subjectId: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.subjectCode} - {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Project File:</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                accept=".pdf,.doc,.docx,.zip,.rar,.txt,.py,.java,.cpp,.c,.js,.html,.css"
              />
              <small>
                Supported formats: PDF, DOC, ZIP, Code files (Max: 10MB)
              </small>
            </div>

            {uploadForm.projectFile && (
              <div className="file-preview">
                <strong>Selected file:</strong> {uploadForm.projectFile.name}(
                {(uploadForm.projectFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload Project"}
              </button>
              <button type="button" onClick={() => setShowUploadForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="brand">
            <img src={logo} alt="Logo" className="brand-logo" />
            <span className="brand-text">Projects Portal - {user?.role}</span>
          </div>
          <div className="nav-links">
            <span>Welcome, {user?.username}</span>
            <button onClick={logout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "subjects" ? "active" : ""}
          onClick={() => setActiveTab("subjects")}
        >
          Subjects
        </button>
        <button
          className={activeTab === "projects" ? "active" : ""}
          onClick={() => setActiveTab("projects")}
        >
          My Projects
        </button>
      </div>

      <div className="dashboard-content">
        {message && (
          <div
            className={`message ${
              message.includes("successfully") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        {activeTab === "overview" && renderOverview()}
        {activeTab === "subjects" && renderSubjects()}
        {activeTab === "projects" && renderProjects()}

        {/* Upload Form Modal */}
        {renderUploadForm()}
      </div>
    </div>
  );
};

export default StudentDashboard;
