const subjects = [];
let nextStudentId = 1;

/* =========================
   Student Object
========================= */
function Student(id, name, email, grades = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.grades = grades;
}

Student.prototype.addSubject = function (subject) {
    if (!this.grades[subject]) {
        this.grades[subject] = [];
    }
};

Student.prototype.addGrade = function (subject, score) {
    this.addSubject(subject);
    this.grades[subject].push(score);
};

Student.prototype.addGrades = function (subject, gradesArray) {
    for (const score of gradesArray) {
        this.addGrade(subject, score);
    }
};

Student.prototype.replaceGrades = function (subject, gradesArray) {
    this.grades[subject] = [...gradesArray];
};

Student.prototype.getGrade = function (subject) {
    return this.grades[subject] || [];
};

Student.prototype.getSubjectAverage = function (subject) {
    const grades = this.getGrade(subject);

    if (grades.length === 0) {
        return "";
    }

    const sum = grades.reduce((a, b) => a + b, 0);
    return (sum / grades.length).toFixed(2);
};

Student.prototype.getAverageGrade = function () {
    let allGrades = [];

    for (const subject of Object.keys(this.grades)) {
        allGrades.push(...this.grades[subject]);
    }

    if (allGrades.length === 0) {
        return "";
    }

    const sum = allGrades.reduce((a, b) => a + b, 0);
    return (sum / allGrades.length).toFixed(2);
};

Object.defineProperty(Student.prototype, "GPA", {
    get: function () {
        const avg = this.getAverageGrade();
        return avg === "" ? "" : avg;
    }
});

/* =========================
   Grade Manager
========================= */
const gradeManager = {
    students: [],

    addStudent(student) {
        this.students.push(student);
    },

    removeStudent(id) {
        this.students = this.students.filter(student => student.id !== id);
    },

    updateStudent(id, data) {
        const student = this.getStudent(id);

        if (!student) {
            return false;
        }

        const { name, email } = data;

        if (name !== undefined) {
            student.name = name;
        }

        if (email !== undefined) {
            student.email = email;
        }

        return true;
    },

    getStudent(id) {
        return this.students.find(student => student.id === id);
    },

    addStudentGrade(studentId, subject, score) {
        const student = this.getStudent(studentId);

        if (!student) {
            return false;
        }

        student.addGrade(subject, score);
        return true;
    },

    getStudentsByAverage(minAverage) {
        return this.students.filter(student => {
            const avg = student.getAverageGrade();
            return avg !== "" && Number(avg) >= minAverage;
        });
    },

    getTopStudents(n) {
        return [...this.students]
            .filter(student => student.getAverageGrade() !== "")
            .sort((a, b) => Number(b.getAverageGrade()) - Number(a.getAverageGrade()))
            .slice(0, n);
    },

    getClassAverage() {
        let allGrades = [];

        for (const student of this.students) {
            for (const subject of Object.keys(student.grades)) {
                allGrades.push(...student.grades[subject]);
            }
        }

        if (allGrades.length === 0) {
            return "";
        }

        const sum = allGrades.reduce((a, b) => a + b, 0);
        return (sum / allGrades.length).toFixed(2);
    },

    getSubjectAverage(subject) {
        let allGrades = [];

        for (const student of this.students) {
            if (student.grades[subject] && student.grades[subject].length > 0) {
                allGrades.push(...student.grades[subject]);
            }
        }

        if (allGrades.length === 0) {
            return "";
        }

        const sum = allGrades.reduce((a, b) => a + b, 0);
        return (sum / allGrades.length).toFixed(2);
    },

    getGradeDistribution() {
        const distribution = {};

        for (let i = 1; i <= 12; i++) {
            distribution[i] = 0;
        }

        for (const student of this.students) {
            for (const subject of Object.keys(student.grades)) {
                for (const grade of student.grades[subject]) {
                    if (distribution[grade] !== undefined) {
                        distribution[grade]++;
                    }
                }
            }
        }

        return distribution;
    },

    getFailingStudents() {
        return this.students.filter(student => {
            const avg = student.getAverageGrade();
            return avg !== "" && Number(avg) < 4;
        });
    }
};

/* =========================
   UI helpers
========================= */
function showMessage(text) {
    document.getElementById("message").innerHTML = text;
}

function updateStudentSelect() {
    const select = document.getElementById("studentSelect");
    select.innerHTML = '<option value="">Оберіть студента</option>';

    for (const student of gradeManager.students) {
        select.innerHTML += `<option value="${student.id}">${student.id} — ${student.name}</option>`;
    }
}

function updateSubjectSelect() {
    const select = document.getElementById("subjectSelect");
    select.innerHTML = '<option value="">Оберіть предмет</option>';

    for (const subject of subjects) {
        select.innerHTML += `<option value="${subject}">${subject}</option>`;
    }
}

/* =========================
   LocalStorage
========================= */
function saveData() {
    localStorage.setItem("students", JSON.stringify(gradeManager.students));
    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.setItem("nextStudentId", nextStudentId);
    localStorage.setItem("groupName", document.getElementById("groupName").value);
}

function loadData() {
    const savedStudents = localStorage.getItem("students");
    const savedSubjects = localStorage.getItem("subjects");
    const savedNextId = localStorage.getItem("nextStudentId");
    const savedGroupName = localStorage.getItem("groupName");

    if (savedSubjects) {
        subjects.push(...JSON.parse(savedSubjects));
    }

    if (savedStudents) {
        const parsedStudents = JSON.parse(savedStudents);

        for (const s of parsedStudents) {
            const student = new Student(s.id, s.name, s.email, s.grades || {});
            gradeManager.addStudent(student);
        }
    }

    if (savedNextId) {
        nextStudentId = Number(savedNextId);
    }

    if (savedGroupName) {
        document.getElementById("groupName").value = savedGroupName;
    }

    updateStudentSelect();
    updateSubjectSelect();
    renderJournal();
}

/* =========================
   Main actions
========================= */
function addStudent() {
    const name = document.getElementById("studentName").value.trim();
    const email = document.getElementById("studentEmail").value.trim();

    if (name === "" || email === "") {
        showMessage("Заповніть ім'я та email.");
        return;
    }

    if (gradeManager.students.length >= 30) {
        showMessage("Не можна додати більше 30 студентів.");
        return;
    }

    const student = new Student(nextStudentId, name, email);

    for (const subject of subjects) {
        student.addSubject(subject);
    }

    gradeManager.addStudent(student);
    nextStudentId++;

    document.getElementById("studentName").value = "";
    document.getElementById("studentEmail").value = "";

    updateStudentSelect();
    saveData();
    showMessage("Студента додано.");
    renderJournal();
}

function addSubject() {
    const subject = document.getElementById("subjectName").value.trim();

    if (subject === "") {
        showMessage("Введіть назву предмета.");
        return;
    }

    if (subjects.includes(subject)) {
        showMessage("Такий предмет вже існує.");
        return;
    }

    if (subjects.length >= 10) {
        showMessage("Максимум 10 предметів.");
        return;
    }

    subjects.push(subject);

    for (const student of gradeManager.students) {
        student.addSubject(subject);
    }

    document.getElementById("subjectName").value = "";

    updateSubjectSelect();
    saveData();
    showMessage("Предмет додано.");
    renderJournal();
}

function addGrades() {
    const studentId = Number(document.getElementById("studentSelect").value);
    const subject = document.getElementById("subjectSelect").value;
    const text = document.getElementById("gradesInput").value.trim();

    if (!studentId || subject === "" || text === "") {
        showMessage("Оберіть студента, предмет і введіть оцінки.");
        return;
    }

    const student = gradeManager.getStudent(studentId);

    if (!student) {
        showMessage("Студента не знайдено.");
        return;
    }

    const grades = text
        .split(",")
        .map(x => Number(x.trim()))
        .filter(x => !Number.isNaN(x));

    if (grades.length === 0) {
        showMessage("Неправильний формат оцінок.");
        return;
    }

    student.addGrades(subject, grades);

    document.getElementById("gradesInput").value = "";

    saveData();
    showMessage("Оцінки додано.");
    renderJournal();
}

function replaceGrades() {
    const studentId = Number(document.getElementById("studentSelect").value);
    const subject = document.getElementById("subjectSelect").value;
    const text = document.getElementById("gradesInput").value.trim();

    if (!studentId || subject === "" || text === "") {
        showMessage("Оберіть студента, предмет і введіть оцінки.");
        return;
    }

    const student = gradeManager.getStudent(studentId);

    if (!student) {
        showMessage("Студента не знайдено.");
        return;
    }

    const grades = text
        .split(",")
        .map(x => Number(x.trim()))
        .filter(x => !Number.isNaN(x));

    if (grades.length === 0) {
        showMessage("Неправильний формат оцінок.");
        return;
    }

    student.replaceGrades(subject, grades);

    document.getElementById("gradesInput").value = "";

    saveData();
    showMessage("Оцінки замінено.");
    renderJournal();
}

/* =========================
   Journal rendering
========================= */
function renderJournal() {
    const group = document.getElementById("groupName").value.trim();
    const journal = document.getElementById("journal");

    if (gradeManager.students.length === 0) {
        journal.innerHTML = "<p>Студентів ще немає.</p>";
        return;
    }

    let html = "";

    if (group !== "") {
        html += `<h3>Група: ${group}</h3>`;
    }

    html += "<table border='1' cellpadding='8' cellspacing='0'>";
    html += "<tr>";
    html += "<th>ID</th>";
    html += "<th>Student</th>";
    html += "<th>Email</th>";

    for (const subject of subjects) {
        html += `<th>${subject}</th>`;
    }

    html += "<th>Середній бал</th>";
    html += "<th>GPA</th>";
    html += "</tr>";

    for (const student of gradeManager.students) {
        html += "<tr>";
        html += `<td>${student.id}</td>`;
        html += `<td>${student.name}</td>`;
        html += `<td>${student.email}</td>`;

        for (const subject of subjects) {
            const grades = student.getGrade(subject);

            if (grades.length === 0) {
                html += "<td>—</td>";
            } else {
                const avg = student.getSubjectAverage(subject);
                html += `<td>${grades.join(", ")}<br><b>Сер. бал:</b> ${avg}</td>`;
            }
        }

        html += `<td>${student.getAverageGrade() || "—"}</td>`;
        html += `<td>${student.GPA || "—"}</td>`;
        html += "</tr>";
    }

    html += "</table>";

    html += `<h3>Середній бал групи: ${gradeManager.getClassAverage() || "—"}</h3>`;

    html += "<h3>Середній бал групи по предметах</h3>";
    html += "<ul>";

    for (const subject of subjects) {
        html += `<li>${subject}: ${gradeManager.getSubjectAverage(subject) || "—"}</li>`;
    }

    html += "</ul>";

    const topStudents = gradeManager.getTopStudents(3);
    html += "<h3>Топ студенти</h3>";

    if (topStudents.length === 0) {
        html += "<p>Немає даних.</p>";
    } else {
        html += "<ul>";
        for (const student of topStudents) {
            html += `<li>${student.name}: ${student.getAverageGrade()}</li>`;
        }
        html += "</ul>";
    }

    const failingStudents = gradeManager.getFailingStudents();
    html += "<h3>Студенти з низьким середнім балом</h3>";

    if (failingStudents.length === 0) {
        html += "<p>Немає.</p>";
    } else {
        html += "<ul>";
        for (const student of failingStudents) {
            html += `<li>${student.name}: ${student.getAverageGrade()}</li>`;
        }
        html += "</ul>";
    }

    const distribution = gradeManager.getGradeDistribution();
    html += "<h3>Розподіл оцінок</h3>";
    html += "<ul>";

    for (const [grade, count] of Object.entries(distribution)) {
        html += `<li>${grade}: ${count}</li>`;
    }

    html += "</ul>";

    journal.innerHTML = html;
}

/* =========================
   Auto save group
========================= */
document.getElementById("groupName").addEventListener("input", function () {
    saveData();
    renderJournal();
});
function clearJournal() {
    localStorage.clear();
    location.reload();
}
loadData();