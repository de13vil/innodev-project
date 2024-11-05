document.getElementById('complaintForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const issueType = document.getElementById('issueType').value;
    const description = document.getElementById('description').value;

    // Send complaint data to the server
    fetch('/submit-complaint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: issueType, description: description })
    })
    .then(response => {
        if (response.ok) {
            alert('Complaint submitted successfully!');
            document.getElementById('complaintForm').reset(); // Reset the form
        } else {
            alert('Error submitting complaint. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});

// Event listener for the "View My Complaints" button
document.getElementById('viewComplaints').addEventListener('click', function() {
    fetch('/api/user-complaints') // Endpoint to fetch user's complaints
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(complaints => {
        const complaintList = document.getElementById('complaintList');
        complaintList.innerHTML = ''; // Clear previous complaints
        if (complaints.length === 0) {
            complaintList.innerHTML = '<p class="text-gray-600">No complaints found.</p>';
            return;
        }

        // Display each complaint
        complaints.forEach(complaint => {
            const complaintDiv = document.createElement('div');
            complaintDiv.classList.add('p-4', 'border', 'border-gray-300', 'rounded-md', 'mt-2');
            complaintDiv.innerHTML = `
                <strong>Type:</strong> ${complaint.type}<br>
                <strong>Description:</strong> ${complaint.description}<br>
                <strong>Status:</strong> ${complaint.status}<br>
                <strong>Response:</strong> ${complaint.response || 'No response yet.'}
            `;
            complaintList.appendChild(complaintDiv);
        });
    })
    .catch(error => {
        console.error('Error fetching complaints:', error);
        alert('An error occurred while fetching complaints. Please try again later.');
    });
});



