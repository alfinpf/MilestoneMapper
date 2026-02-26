function generateSchedule() {
    const currentModInput = document.getElementById('currentModule');
    const currentMod = parseInt(currentModInput.value);
    const startDateVal = document.getElementById('startDate').value;
    const tableBody = document.getElementById('tableBody');
    const resultsSection = document.getElementById('results');
    const downloadBtn = document.getElementById('downloadBtn');

    if (!startDateVal) {
        alert("Please select a starting date.");
        return;
    }

    // Reset UI
    tableBody.innerHTML = "";
    resultsSection.classList.remove('hidden');
    downloadBtn.style.display = "inline-block";

    // Initialize date from input
    let currentDate = new Date(startDateVal);

    for (let i = currentMod; i <= 52; i++) {
        // CONDITION: If the calculated date is a Sunday (0), move to Monday (1)
        if (currentDate.getDay() === 0) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const row = document.createElement('tr');

        // Formatting for the Table
        const dateString = currentDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
        const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

        row.innerHTML = `
            <td>Module ${i}</td>
            <td>${dateString}</td>
            <td>${weekday}</td>
        `;

        tableBody.appendChild(row);

        // LOGIC: Set up for the next module (8-day gap)
        // We do this AFTER rendering the current row
        currentDate.setDate(currentDate.getDate() + 8);
    }
}

function exportToCSV() {
    let csv = ["Module No,Date of Review,Weekday"];
    const rows = document.querySelectorAll("#tableBody tr");

    rows.forEach(tr => {
        let row = [];
        tr.querySelectorAll("td").forEach(td => row.push(`"${td.innerText}"`));
        csv.push(row.join(","));
    });

    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    const downloadLink = document.createElement("a");
    const timestamp = new Date().toISOString().split('T')[0];

    downloadLink.download = `Course_Plan_${timestamp}.csv`;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
}