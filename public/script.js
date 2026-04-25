let chart;
let pieChart;
let globalData = [];

async function addStudent() {
    const name = document.getElementById("name").value;
    const marks = document.getElementById("marks").value;

    if (!name || !marks) {
        alert("Enter all fields");
        return;
    }

    await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, marks: Number(marks) })
    });

    document.getElementById("name").value = "";
    document.getElementById("marks").value = "";

    loadData();
}

async function loadData() {
    const res = await fetch('/students');
    globalData = await res.json();

    renderData(globalData);
}

function renderData(data) {

    // Update list
    displayList(data);

    // Calculate analytics (always from FULL data)
    let total = 0;
    let topper = { name: "", marks: 0 };

    let labels = [];
    let values = [];

    globalData.forEach(s => {
        total += s.marks;

        if (s.marks > topper.marks) {
            topper = s;
        }

        labels.push(s.name);
        values.push(s.marks);
    });

    // Cards
    document.getElementById("avgCard").innerText =
        "Average\n" + (globalData.length ? (total / globalData.length).toFixed(2) : 0);

    document.getElementById("topperCard").innerText =
        "Topper\n" + (topper.name || "N/A");

    document.getElementById("totalCard").innerText =
        "Total\n" + globalData.length;

    drawChart(labels, values);
    drawPieChart(globalData);
}

function displayList(data) {

    const list = document.getElementById("list");
    list.innerHTML = "";

    data.forEach(s => {

        let status = "";
        let className = "";

        if (s.marks < 40) {
            status = "At Risk";
            className = "risk";
        } else if (s.marks < 75) {
            status = "Average";
            className = "avg";
        } else {
            status = "Top Performer";
            className = "top";
        }

        const li = document.createElement("li");
        li.className = className;

        li.innerHTML = `
            ${s.name} - ${s.marks}
            <span>${status}</span>
            <button onclick="deleteStudent('${s.name}')">❌</button>
        `;

        list.appendChild(li);
    });
}

function drawChart(labels, values) {
    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Marks',
                data: values
            }]
        }
    });
}

function drawPieChart(data) {

    let top = 0, avg = 0, risk = 0;

    data.forEach(s => {
        if (s.marks < 40) risk++;
        else if (s.marks < 75) avg++;
        else top++;
    });

    if (pieChart) pieChart.destroy();

    pieChart = new Chart(document.getElementById("pieChart"), {
        type: 'pie',
        data: {
            labels: ['Top Performer', 'Average', 'At Risk'],
            datasets: [{
                data: [top, avg, risk]
            }]
        }
    });
}

function searchStudent() {
    const keyword = document.getElementById("search").value.toLowerCase();

    const filtered = globalData.filter(s =>
        s.name.toLowerCase().includes(keyword)
    );

    displayList(filtered); // ONLY list changes
}

async function deleteStudent(name) {

    globalData = globalData.filter(s => s.name !== name);

    await fetch('/overwrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalData)
    });

    renderData(globalData);
}

loadData();