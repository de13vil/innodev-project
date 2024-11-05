const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

app.use(express.static(__dirname));

const users = [];
const complaints = [];

const JWT_SECRET = "mysecretkey";

function authenticateToken(req, res, next) {
    const token = req.cookies.jwt;
    if (!token) return res.redirect('/index.html');

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.redirect('/index.html');
        req.user = user;
        next();
    });
}

app.post("/register", async (req, res) => {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userExists = users.find(user => user.email === email);
    if (userExists) return res.send("User already exists with same email!");

    users.push({ username, email, password: hashedPassword, role });
    res.redirect("/index.html");
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(user => user.email === email);
    if (!user) return res.send("User not found!");

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.send("Incorrect password!");

    // Generate a JWT token
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("jwt", token, { httpOnly: true }); // Set JWT as an HTTP-only cookie

    // Redirect based on role
    if (user.role === "admin") {
        return res.redirect("/admin-dashboard.html"); // Admin dashboard
    } else {
        return res.redirect("/dashboard.html"); // User dashboard
    }
});


app.post("/submit-complaint", authenticateToken, (req, res) => {
    const { type, description } = req.body;
    const newComplaint = {
        type,
        description,
        status: 'Received',
        response: '',
        userEmail: req.user.email
    };
    complaints.push(newComplaint);
    res.status(200).send('Complaint submitted successfully.');
});

app.get("/api/user-complaints", authenticateToken, (req, res) => {
    const userComplaints = complaints.filter(complaint => complaint.userEmail === req.user.email);
    res.json(userComplaints);
});

app.get("/api/complaints", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") return res.status(403).send('Forbidden');
    res.json(complaints);
});

app.post("/api/update-complaint", authenticateToken, (req, res) => {
    const { index, status, response: adminResponse } = req.body;
    if (req.user.role !== "admin") return res.status(403).send('Forbidden');

    if (complaints[index]) {
        complaints[index].status = status;
        complaints[index].response = adminResponse;
        res.send('Complaint status and response updated successfully.');
    } else {
        res.status(404).send('Complaint not found.');
    }
});

app.get("/dashboard", authenticateToken, (req, res) => {
    if (req.user.role !== "user") return res.redirect("/index.html");
    res.sendFile(__dirname + "/dashboard.html");
});

app.get("/admin-dashboard", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") return res.redirect("/index.html");
    res.sendFile(__dirname + "/admin-dashboard.html");
});

app.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/index.html");
});

// Route to get the counts of pending and resolved complaints
app.get("/api/complaint-stats", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") return res.status(403).send("Forbidden");

    const pendingCount = complaints.filter(complaint => complaint.status === "Received").length;
    const resolvedCount = complaints.filter(complaint => complaint.status === "Resolved").length;

    res.json({ pending: pendingCount, resolved: resolvedCount });
});

// Endpoint to get the count of pending complaints
app.get("/api/complaints/pending-count", (req, res) => {
    const pendingCount = complaints.filter(complaint => complaint.status === "Received" || complaint.status === "Pending").length;
    res.json({ count: pendingCount });
});

// Endpoint to get the count of resolved complaints
app.get("/api/complaints/resolved-count", (req, res) => {
    const resolvedCount = complaints.filter(complaint => complaint.status === "Resolved").length;
    res.json({ count: resolvedCount });
});


app.listen(3000, () => console.log("Server running on http://localhost:3000"));

