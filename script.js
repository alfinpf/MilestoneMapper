const DATE_FLOOR = new Date("2024-01-01");
let maxCompletionDate = null;

function validateModuleInput(input) {
    let num = parseInt(input.value);
    // Only validate if a number has actually been entered
    if (!isNaN(num)) {
        if (num > 51) input.value = "51";
        else if (num < 5) input.value = "5";
    }
}

function calculateDeadline() {
    const startVal = document.getElementById('courseStartDate').value;
    const banner = document.getElementById('deadlineBanner');
    if (!startVal) { banner.classList.add('hidden'); return; }
    const startDate = new Date(startVal);
    if (startDate < DATE_FLOOR) {
        alert("The Course Commencement Date must be January 1st, 2024 or later.");
        document.getElementById('courseStartDate').value = "";
        banner.classList.add('hidden');
        return;
    }
    maxCompletionDate = new Date(startDate);
    maxCompletionDate.setMonth(startDate.getMonth() + 30);
    document.getElementById('maxEndDateDisplay').innerText = maxCompletionDate.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    banner.classList.remove('hidden');
}

function resetForm() {
    document.getElementById('courseStartDate').value = "";
    document.getElementById('currentModule').value = "5";
    document.getElementById('reviewDate').value = "";
    document.getElementById('attempts').value = "1";
    document.getElementById('deadlineBanner').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('simulationSummary').classList.add('hidden');
    document.getElementById('downloadBtn').style.display = "none";
    document.getElementById('tableBody').innerHTML = "";
    maxCompletionDate = null;
}

function checkSunday(date) {
    if (date.getDay() === 0) {
        date.setDate(date.getDate() + 1);
    }
    return date;
}

function generateSchedule() {
    const currentMod = parseInt(document.getElementById('currentModule').value);
    const reviewDateVal = document.getElementById('reviewDate').value;
    const startDateVal = document.getElementById('courseStartDate').value;
    const attemptVal = parseInt(document.getElementById('attempts').value);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (!startDateVal || !reviewDateVal) {
        alert("Please ensure all dates are selected before generating the roadmap.");
        return;
    }

    const reviewDate = new Date(reviewDateVal);
    if (reviewDate < today) {
        alert("The Next Review Date should not be a date in the past. Please select a current or future date.");
        return;
    }

    if (!maxCompletionDate) calculateDeadline();

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = "";
    let loopDate = new Date(reviewDate);

    for (let i = currentMod; i <= 52; i++) {
        // Attempt 1
        checkSunday(loopDate);
        let status1 = (attemptVal === 2) ? "FAIL" : "PASS";
        addTableRow(i, loopDate, status1);

        if (attemptVal === 2) {
            // Reattempt happens 7 days later
            loopDate.setDate(loopDate.getDate() + 7);
            checkSunday(loopDate);
            addTableRow(i, loopDate, "PASS (on second attempt)");
        }

        // Prepare for next module: 8 days after the passing attempt
        if (i < 52) {
            loopDate.setDate(loopDate.getDate() + 8);
        }
    }

    updateSummary(loopDate, attemptVal);
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('downloadBtn').style.display = "inline-block";
}

function addTableRow(modNum, date, status) {
    const tableBody = document.getElementById('tableBody');
    const isOverdue = date > maxCompletionDate;
    const row = document.createElement('tr');
    if (isOverdue) row.classList.add('overdue-row');

    row.innerHTML = `
        <td>Module ${String(modNum).padStart(2, '0')} ${isOverdue ? '⚠️' : ''}</td>
        <td>${date.toLocaleDateString('en-GB')}</td>
        <td><strong>${status}</strong></td>
        <td>${date.toLocaleDateString('en-US', { weekday: 'long' })}</td>
    `;
    tableBody.appendChild(row);
}

function updateSummary(finalDate, attempts) {
    const summaryBox = document.getElementById('simulationSummary');
    const timeDiff = finalDate.getTime() - maxCompletionDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let resultHTML = dayDiff > 0
        ? `<span style="color:var(--danger)">Warning: Exceeds deadline by <strong>${dayDiff} days</strong>.</span>`
        : `<span style="color:var(--primary)">Success: Finishes <strong>${Math.abs(dayDiff)} days</strong> before deadline.</span>`;

    summaryBox.innerHTML = `
        <p><strong>Simulation Result (${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}/module):</strong> ${resultHTML}</p>
        <p style="font-size: 0.8rem; margin-top: 5px; color: var(--text-muted);">Final Completion: ${finalDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
    `;
    summaryBox.classList.remove('hidden');
}

function exportToCSV() {
    let csv = ["Module,Date,Status,Day"];
    document.querySelectorAll("#tableBody tr").forEach(tr => {
        let cols = Array.from(tr.querySelectorAll("td")).map(td => `"${td.innerText.replace('⚠️', '').trim()}"`);
        csv.push(cols.join(","));
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Course_Roadmap.csv";
    link.click();
}
