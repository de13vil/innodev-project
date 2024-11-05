document.getElementById('viewComplaints').addEventListener('click', function() {
    fetch('/api/complaints') // Fetch all complaints
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
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
            complaints.forEach((complaint, index) => {
                const complaintDiv = document.createElement('div');
                complaintDiv.classList.add('p-4', 'border', 'border-gray-300', 'rounded-md', 'mt-2');
                complaintDiv.innerHTML = `
                    <strong>Type:</strong> ${complaint.type}<br>
                    <strong>Description:</strong> ${complaint.description}<br>
                    <strong>Status:</strong> <span id="status-${index}">${complaint.status}</span><br>
                    <button class="update-status" data-index="${index}">Update Status</button>
                    <input type="text" id="response-${index}" placeholder="Response" class="mt-2 border rounded p-1">
                `;
                complaintList.appendChild(complaintDiv);
            });

            // Add event listeners to update buttons
            const updateButtons = document.querySelectorAll('.update-status');
            updateButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const index = this.getAttribute('data-index');
                    const response = document.getElementById(`response-${index}`).value;
                    updateComplaintStatus(index, response);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching complaints:', error);
            alert('An error occurred while fetching complaints. Please try again later.');
        });
});

function updateComplaintStatus(index, response) {
    const status = prompt("Update the complaint status (e.g., Resolved, In Progress):");
    if (status) {
        fetch('/api/update-complaint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ index: index, status: status }),
        })
        .then(response => {
            if (response.ok) {
                document.getElementById(`status-${index}`).innerText = status; // Update the displayed status
                alert('Complaint status updated successfully!');
            } else {
                alert('Failed to update complaint status. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error updating complaint status:', error);
            alert('An error occurred while updating the complaint status.');
        });
    }
}