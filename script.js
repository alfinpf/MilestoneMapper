const DATE_FLOOR = new Date("2024-01-01");
let maxCompletionDate = null;

function validateModuleInput(input) {
    let val = input.value;
    if (val.length > 2) val = val.slice(0, 2);
    let num = parseInt(val);
    if (num > 51) val = "51";
    else if (num < 1 && val !== "") val = "1";
    input.value = val;
}

function calculateDeadline() {
    const startVal = document.getElementById('courseStartDate').value;
    if (!startVal) return;

    const startDate = new Date(startVal);
    if (startDate < DATE_FLOOR) {
        alert("The Course Commencement Date must be January 1st, 2024 or later.");
        document.getElementById('courseStartDate').value = "";
        return;
    }

    maxCompletionDate = new Date(startDate);
    maxCompletionDate.setMonth(startDate.getMonth() + 30);

    document.getElementById('maxEndDateDisplay').innerText = maxCompletionDate.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    document.getElementById('deadlineBanner').classList.remove('hidden');
}

function resetForm() {
    document.getElementById('courseStartDate').value = "";
    document.getElementById('currentModule').value = "1";
    document.getElementById('reviewDate').value = "";
    document.getElementById('deadlineBanner').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('downloadBtn').style.display = "none";
    document.getElementById('tableBody').innerHTML = "";
    maxCompletionDate = null;
}

function generateSchedule() {
    const currentMod = parseInt(document.getElementById('currentModule').value);
    const reviewDateVal = document.getElementById('reviewDate').value;
    const startDateVal = document.getElementById('courseStartDate').value;
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

    let checkDate = new Date(reviewDate);
    for (let i = currentMod; i <= 52; i++) {
        if (checkDate.getDay() === 0) checkDate.setDate(checkDate.getDate() + 1);
        if (i < 52) checkDate.setDate(checkDate.getDate() + 8);
    }

    if (checkDate > maxCompletionDate) {
        const userProceed = confirm("Warning: You may not be able to complete the course before the 2.5-year deadline. Are you sure you want to display the schedule?");
        if (!userProceed) return;
    }

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = "";
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('downloadBtn').style.display = "inline-block";

    let loopDate = new Date(reviewDate);

    for (let i = currentMod; i <= 52; i++) {
        if (loopDate.getDay() === 0) {
            loopDate.setDate(loopDate.getDate() + 1);
        }

        const isOverdue = loopDate > maxCompletionDate;
        const row = document.createElement('tr');
        if (isOverdue) row.classList.add('overdue-row');

        row.innerHTML = `
            <td>Module ${String(i).padStart(2, '0')} ${isOverdue ? '⚠️' : ''}</td>
            <td>${loopDate.toLocaleDateString('en-GB')}</td>
            <td>${loopDate.toLocaleDateString('en-US', { weekday: 'long' })}</td>
        `;

        tableBody.appendChild(row);
        loopDate.setDate(loopDate.getDate() + 8);
    }
}

function exportToCSV() {
    let csv = ["Module,Date,Day"];
    document.querySelectorAll("#tableBody tr").forEach(tr => {
        let cols = Array.from(tr.querySelectorAll("td")).map(td => `"${td.innerText.replace('⚠️', '').trim()}"`);
        csv.push(cols.join(","));
    });

    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Roadmap_Mod_${document.getElementById('currentModule').value}.csv`;
    link.click();
}