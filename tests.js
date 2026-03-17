function runTests() {
    let results = "";

    // Тест 1: addGrade()
    const student1 = new Student(1, "Тест", "test@email.com");
    student1.addGrade("Математика", 10);

    if (
        student1.grades["Математика"] &&
        student1.grades["Математика"].length === 1 &&
        student1.grades["Математика"][0] === 10
    ) {
        results += "✅ Тест 1 пройдено: addGrade() працює<br>";
    } else {
        results += "❌ Тест 1 НЕ пройдено: addGrade() не працює<br>";
    }

    // Тест 2: getAverageGrade()
    const student2 = new Student(2, "Анна", "anna@email.com");
    student2.addGrade("Математика", 8);
    student2.addGrade("Математика", 10);
    student2.addGrade("Історія", 6);

    if (student2.getAverageGrade() === "8.00") {
        results += "✅ Тест 2 пройдено: getAverageGrade() працює<br>";
    } else {
        results += "❌ Тест 2 НЕ пройдено: getAverageGrade() не працює<br>";
    }

    // Тест 3: getTopStudents()
    const testManager = {
        students: [],
        getTopStudents(n) {
            return [...this.students]
                .filter(student => student.getAverageGrade() !== "")
                .sort((a, b) => Number(b.getAverageGrade()) - Number(a.getAverageGrade()))
                .slice(0, n);
        }
    };

    const s1 = new Student(1, "Іван", "ivan@email.com");
    s1.addGrade("Математика", 6);

    const s2 = new Student(2, "Лідія", "lidiya@email.com");
    s2.addGrade("Математика", 12);

    const s3 = new Student(3, "Василь", "vasyl@email.com");
    s3.addGrade("Математика", 9);

    testManager.students.push(s1, s2, s3);

    const topStudents = testManager.getTopStudents(2);

    if (
        topStudents.length === 2 &&
        topStudents[0].name === "Лідія" &&
        topStudents[1].name === "Василь"
    ) {
        results += "✅ Тест 3 пройдено: getTopStudents() працює<br>";
    } else {
        results += "❌ Тест 3 НЕ пройдено: getTopStudents() не працює<br>";
    }

    document.getElementById("testResults").innerHTML = results;
}