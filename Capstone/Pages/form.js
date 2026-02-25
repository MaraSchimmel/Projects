// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getAnalytics } from "/node_modules/@firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = window.CONFIG

// require('dotenv').config()
// console.log(process.env)
// Initialize Firebase
// const analytics = getAnalytics(app);

// ...

// Add the Firebase products and methods that you want to use
import {
    getAuth,
    setPersistence,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    browserSessionPersistence
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getBlob,
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

initializeApp(firebaseConfig);
let auth = await getAuth();
let db = getFirestore();
let userDocData
let accountType
let userName
let rNumber
let studentRNumber
let studentName
let facultyRNumber
let facultyName
let displayFileData = {}
const storage = getStorage()

// Calculate the number of current admins needed to approve or deny a proposal
const numAdmins = 1
// const numAdminsRequired = Math.floor(numAdmins / 2) + 1
const numAdminsRequired = 1


onAuthStateChanged(auth, async (user) => {
    if (auth.currentUser) {    
        document.getElementById("sign-out").classList.remove("hidden")
        document.getElementById("sign-out").addEventListener("click", userSignOut)
    
        await signInFunction()
    }
    else {
        document.getElementById("sign-out").classList.add("hidden")
        document.getElementById("sign-out").removeEventListener("click", userSignOut)
    }
})

async function main() {
    const firebaseConfig = {};

    let signInForm = document.getElementById("sign-in")
    

    signInForm.addEventListener('submit', signIn)

    document.getElementById("password").addEventListener("blur", resetError)

}
main();

async function userSignOut() {
    document.getElementById("sign-out").classList.add("hidden")
    document.getElementById("sign-out").removeEventListener("click", userSignOut)

    await signOut(auth)

    document.getElementById("sign-in").reset()
    document.getElementById("sign-in-div").classList.remove("hidden")

    // Close views for all account types
    switch (accountType) {
        case "Student":
            document.getElementById("student-view").classList.add("hidden")

            resetStudentDisplay()
            break
        case "Faculty":
            document.getElementById("faculty-view").classList.add("hidden")
            
            resetFaculty()
            break
        case "Admin":
            document.getElementById("admin-view").classList.add("hidden")

            resetAdmin()
            break
        default:
            console.log("default")
    }

    document.getElementById("user-name").innerHTML = ""

    let infoDiv = document.getElementById("info-print")
    infoDiv.innerHTML = ""

    // Reset saved user data
    userDocData = undefined
    accountType = undefined
    userName = undefined
    rNumber = undefined
    studentRNumber = undefined
    studentName = undefined
    facultyRNumber = undefined
    facultyName = undefined
}

function resetError() {
    document.getElementById("login-error").innerHTML = ""
}

function signIn(e) {
    e.preventDefault()

    let email = document.getElementById("email").value
    let password = document.getElementById("password").value

    setPersistence(auth, browserSessionPersistence)
        .then(() => {

            signInWithEmailAndPassword(auth, email, password)
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode)
                    console.log(errorMessage)
                    if (errorCode == "auth/invalid-credential") {
                        document.getElementById("login-error").innerHTML = "<p class='row'>Invalid email or password, please try again</p>"
                    } else {
                        document.getElementById("login-error").innerHTML = "<p class='row'>Error logging in, please contact <a class='anchorBlack' href='mailto:crfRollins@gmail.com'>crfRollins@gmail.com</a></p>"
                    }
                    document.getElementById("password").value = ""
                });
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });
    
}

async function signInFunction() {
    document.getElementById("sign-out").classList.remove("hidden")
    document.getElementById("sign-out").addEventListener("click", userSignOut)
    document.getElementById("login-error").innerHTML = ""
    document.getElementById("password").removeEventListener("blur", resetError)

    accountType = await getAccountType()

    switch (accountType) {
        case "Student":
            await getFacultyNameRNUmber()
            await getStudentFormData()
            populateStudent()
            break
        case "Faculty":
            await getFacultyData()
            const studentList = await getStudentList()
            populateFaculty(studentList)
            break
        case "Admin":
            populateAdmin()
            break
        default:
            console.log("Failed to find account")
            return
    }
}

async function getAccountType() {
    const userRef = doc(db, "ID collection", auth.currentUser.uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
        userDocData = userDoc.data()
        userName = userDocData['name']
        rNumber = userDocData['rNumber']
        
    } else {
        console.log("No such document!")
        return 0
    }

    return userDocData['accountType']
}

async function getStudentFormData() {
    const studentDataRef = doc(db, "Faculty", facultyRNumber, "Students", studentRNumber)
    const userDoc = await getDoc(studentDataRef)

    if (userDoc.exists()) {
        userDocData = userDoc.data()
        
    } else {
        console.log("No such document!")
        return 0
    }
}

async function getFacultyNameRNUmber() {
    facultyName = userDocData['facultyName']
    facultyRNumber = userDocData['facultyRNumber']
    studentRNumber = userDocData['rNumber']
    studentName = userName
}

function populateStudent() {
    let nameDiv = document.getElementById("user-name")
    nameDiv.innerHTML = `<h2>Welcome ${userName}!</h2>`

    // Eventually remove sign-in-div.innerHTML and populate student
    document.getElementById("sign-in-div").classList.add("hidden")
    document.getElementById("student-view").classList.remove("hidden")

    populateStudentData()
}

async function populateStudentData() {
    let studentDataDoc = await getDoc(doc(db, "Faculty", facultyRNumber, "Students", studentRNumber))
    let studentData = studentDataDoc.data()

    let studentSubmissionDataDoc = await getDoc(doc(db, "Faculty", facultyRNumber))
    let studentSubmissionData = studentSubmissionDataDoc.data()

    let studentForm = document.getElementById("form-student")
    studentForm.addEventListener('submit', studentUpload)

    if (studentData != undefined) {
        // Populate the submitted student data

        let students = studentSubmissionData['students']

        document.getElementById("status-student").innerHTML = students[studentRNumber]['status']
        document.getElementById("submitted-student").value = studentData['submitDate']
        document.getElementById("submitted-student").classList.remove("hidden")

        document.getElementById("student-name-student-display").parentNode.classList.remove("hidden")
        document.getElementById("student-name-student-display").value = studentData['studentName']
        document.getElementById("student-rNumber-student-display").value = studentData['studentRNumber']

        displayFileData = {
            'timeline': {'address': studentData['timelineAddress'], 'name': studentData['timelineActualName']},
            'proposal': {'address': studentData['proposalAddress'], 'name': studentData['proposalActualName']},
            'studentCV': {'address': studentData['studentCVAddress'], 'name': studentData['studentCVActualName']}
        }

        document.getElementById("timeline-student-display").addEventListener("click", downloadTimeline)
        document.getElementById("proposal-student-display").addEventListener("click", downloadProposal)
        document.getElementById("student-cv-student-display").addEventListener("click", downloadStudentCV)

        if (students[studentRNumber]['status'] == "In Progress") {
            // Allow the user to upload data
            document.getElementById("update-student-info").addEventListener("click", populateStudentForm)
            document.getElementById("update-student-info").classList.remove("hidden")
        } else {
            document.getElementById("update-student-info").removeEventListener("click", populateStudentForm)
            document.getElementById("update-student-info").classList.add("hidden")
        }

        
        document.getElementById("prev-submission-student").classList.remove("hidden")
        
    } else {
        // Populate the submitted student data when there is no previous submission
        document.getElementById("status-student").innerHTML = "Not Started Yet"
        document.getElementById("submitted-student").value = ""
        document.getElementById("submitted-student").classList.add("hidden")

        // Allow the user to upload data
        document.getElementById("update-student-info").addEventListener("click", populateStudentForm)
        document.getElementById("update-student-info").classList.remove("hidden")

        document.getElementById("timeline-student-display").removeEventListener("click", downloadTimeline)
        document.getElementById("proposal-student-display").removeEventListener("click", downloadProposal)
        document.getElementById("student-cv-student-display").removeEventListener("click", downloadStudentCV)

        document.getElementById("prev-submission-student").classList.add("hidden")
    }
    
    selectPicture()
    
}

function selectPicture() {
    let pictureDiv
    let statusDiv

    switch (accountType) {
        case "Student":
            pictureDiv = document.getElementById("status-fox-student")
            statusDiv = document.getElementById("status-student")
            break
        case "Faculty":
            pictureDiv = document.getElementById("status-fox-faculty")
            statusDiv = document.getElementById("status-faculty")
            break
        case "Admin":
            pictureDiv = document.getElementById("status-fox-admin")
            statusDiv = document.getElementById("status-admin")
            break
        default:
            console.log("Error: Student type not found")
            return
    }

    switch (statusDiv.innerHTML) {
        case "Approved":
            pictureDiv.src = "../ImageFiles/BilbotBagginsApproved.png"
            pictureDiv.alt = "Happy fox ˶ᵔ ᵕ ᵔ˶"
            break
        case "Denied":
            pictureDiv.src = "../ImageFiles/BilbotBagginsDenied.png"
            pictureDiv.alt = "Sad fox ˙◠˙"
            break
        case "Under Review":
            pictureDiv.src = "../ImageFiles/BilbotBagginsUnderReview.png"
            pictureDiv.alt = "Thinking fox ('-')?"
            break
        case "Not Started Yet":
        case "In Progress":
            pictureDiv.src = "../ImageFiles/BilbotBagginsFox.png"
            pictureDiv.alt = "Neutral fox (𝋧)"
    }
}

async function downloadTimeline() {
    if (displayFileData == {}) {
        return
    }
    await downloadFile(displayFileData['timeline']['address'], displayFileData['timeline']['name'])
}

async function downloadProposal() {
    if (displayFileData == {}) {
        return
    }
    await downloadFile(displayFileData['proposal']['address'], displayFileData['proposal']['name'])
}

async function downloadStudentCV() {
    if (displayFileData == {}) {
        return
    }
    await downloadFile(displayFileData['studentCV']['address'], displayFileData['studentCV']['name'])
}

function resetStudentDisplay() {
    document.getElementById("update-student-info").removeEventListener("click", populateStudentForm)

    // Reset submission data
    document.getElementById("status-student").innerHTML = ""
    document.getElementById("submitted-student").value = ""

    // Reset student upload form
    document.getElementById("form-student").removeEventListener("submit", studentUpload)
    if (!document.getElementById("form-student").classList.contains("hidden")) {
        closeStudentForm()
    }

    document.getElementById("update-student-info").removeEventListener("click", populateStudentForm)
    document.getElementById("update-student-info").classList.add("hidden")

    // Reset previous submission data
    // document.getElementById("student-name-student-display").parentNode.classList.remove("hidden")
    document.getElementById("student-name-student-display").value = ""
    document.getElementById("student-rNumber-student-display").value = ""

    document.getElementById("status-fox-student").src = ""
    document.getElementById("status-fox-student").alt = ""

    document.getElementById("timeline-student-display").removeEventListener("click", downloadTimeline)
    document.getElementById("proposal-student-display").removeEventListener("click", downloadProposal)
    document.getElementById("student-cv-student-display").removeEventListener("click", downloadStudentCV)
    displayFileData = {}
}

function populateStudentForm() {
    document.getElementById("form-student-background").classList.remove("hidden");
    document.getElementById("update-student-info").disabled = true

    document.getElementById("student-r-number").value = studentRNumber
    document.getElementById("student-name").value = studentName

    document.getElementById("student-close-form").addEventListener("click", closeStudentForm)

    document.getElementById("form-student").classList.remove("hidden")
}

async function studentUpload(e) {
    e.preventDefault()

    // Name
    const formName = document.getElementById("student-name").value

    // R Number
    const formRNumber = document.getElementById("student-r-number").value

    // Forms
    const fileIds = ['timeline', 'proposal', 'student-cover-letter']

    let fileData = [] // Used for file upload
    let dictFileData = {} // Used for database upload
    for (let fileId of fileIds) {
        const fileLocation = document.getElementById(fileId).value

        let address = fileLocation
        address = address.replaceAll("C:\\fakepath\\", "")

        if (address == "") {
            console.log("No file")
            return
        }

        // Check on the back end if the file is a pdf
        if (!(await isPdf(fileId))) {
            return
        }

        switch (fileId) { 
            case 'timeline':
                fileData.push({"fileId": fileId, "desName": `${studentRNumber}/Timeline.pdf`, "address": address})
                dictFileData['timeline'] = {"fileId": fileId, "desName": `${studentRNumber}/Timeline.pdf`, "address": address}
                break
            case 'proposal':
                fileData.push({"fileId": fileId, "desName": `${studentRNumber}/Proposal.pdf`, "address": address})
                dictFileData['proposal'] = {"fileId": fileId, "desName": `${studentRNumber}/Proposal.pdf`, "address": address}
                break
            case 'student-cover-letter':
                fileData.push({"fileId": fileId, "desName": `${studentRNumber}/StudentCoverLetter.pdf`, "address": address})
                dictFileData['cv'] = {"fileId": fileId, "desName": `${studentRNumber}/StudentCoverLetter.pdf`, "address": address}
        }
    }

    let docRef = doc(db, "Faculty", facultyRNumber, "Students", rNumber)
    let studentDataDoc = await getDoc(docRef)

    let today = new Date()
    let todayStr = await getDateStr(today)

    if (studentDataDoc.data() == undefined) {
        await setDoc(docRef, {
        })
    }

    await updateDoc(docRef, {
        timelineAddress: dictFileData['timeline']['desName'],
        timelineActualName: dictFileData['timeline']['address'],
        proposalAddress: dictFileData['proposal']['desName'],
        proposalActualName: dictFileData['proposal']['address'],
        studentCVAddress: dictFileData['cv']['desName'],
        studentCVActualName: dictFileData['cv']['address'],
        studentRNumber: formRNumber,
        studentName: formName,
        submitDate: todayStr
    });

    // Add student to faculty data
    const facultyStudentRef = doc(db, "Faculty", facultyRNumber)

    let facultyStudentData = (await getDoc(facultyStudentRef)).data()

    if (facultyStudentData == undefined) {
        let updateStudents = {}
        updateStudents[studentRNumber] = {'name' : studentName, 'status' : 'In Progress', 'adminApproved': [], 'adminDenied': []}
        await setDoc(facultyStudentRef, {
            facultyName,
            students: updateStudents
        })
    } else {
        let updateStudents = facultyStudentData['students']

        updateStudents[studentRNumber]= {'name' : studentName, 'status' : 'In Progress', 'adminApproved': [], 'adminDenied': []}

        await updateDoc(facultyStudentRef, {
            students: updateStudents,
        })
    }

    let success = await uploadMultipleFiles(fileData)

    if (success) {
        closeStudentForm()
        populateStudentData()
    }
}

function closeStudentForm() {
    document.getElementById("form-student-background").classList.add("hidden"); // Maggie Edit
    let studentForm = document.getElementById("form-student")

    
    studentForm.reset()
    studentForm.removeEventListener('submit', studentUpload)
    setTimeout(() => {
        studentForm.classList.add("hidden")
    }, 0)
    
    document.getElementById("student-close-form").removeEventListener("click", closeStudentForm)

    document.getElementById("update-student-info").disabled = false
}

async function isPdf(fileId) {
    let file = document.getElementById(fileId).files[0]
    if (file && file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        document.getElementById(fileId).value = ''; // Clear the input
        return false
    }
    return true
}



// Faculty


function populateFaculty(studentList) {

    document.getElementById("sign-in-div").classList.add("hidden")
    document.getElementById("faculty-view").classList.remove("hidden")

    document.getElementById("user-name").innerHTML = `<h2>Welcome ${facultyName}!</h2>`
    
    if (studentList == undefined) {
        document.getElementById("info-print").innerHTML += "<p class='row'>You currently have no associated students with started applications. If this is an error, please contact <a class='anchorBlack' href='mailto:crfRollins@gmail.com'>crfRollins@gmail.com</a></p>"
        document.getElementById("faculty-student-select").classList.add("hidden")
        document.getElementById("faculty-student-select").previousElementSibling.classList.add("hidden")
        return
    }
    document.getElementById("faculty-student-select").classList.remove("hidden")
    document.getElementById("faculty-student-select").previousElementSibling.classList.remove("hidden")

    for (let [studentRNumber, studentName] of Object.entries(studentList)) {
        document.getElementById("faculty-student-select").innerHTML += `<option value="${studentRNumber}">${studentName['name']}</option>`
    }

    let studentSelect = document.getElementById("faculty-student-select")
    studentSelect.addEventListener("change", viewFacultyStudentData)

}

async function getStudentList() {
    
    const facultyDocRef = doc(db, "Faculty", facultyRNumber)

    const facultyDoc = await getDoc(facultyDocRef)
    const facultyData = facultyDoc.data()
    if (facultyData == undefined) {
        return undefined
    }

    let studentList = facultyData['students']

    return studentList
}

async function getFacultyData() {
    facultyName = userDocData['name']
    facultyRNumber = userDocData['rNumber']
}

function populateFacultyForm() {
    document.getElementById("form-faculty-background").classList.remove("hidden");
    document.getElementById("form-faculty").classList.remove("hidden")
    document.getElementById("update-faculty-info").disabled = true
    document.getElementById("faculty-student-select").disabled = true
    document.getElementById("submit-btn").disabled = true
    document.getElementById("submit-btn").removeEventListener("click", openConfirmFaculty)
    document.getElementById("confirm-continue-faculty").removeEventListener("click", submitForm)

    let uploadForm = document.getElementById("form-faculty")

    let today = new Date()
    let tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    let todayStr = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1 <= 9 ? '0' + (today.getUTCMonth() + 1) : today.getUTCMonth() + 1}-${today.getUTCDate() <= 9 ?  '0' + today.getUTCDate() : today.getUTCDate()}`
    let tomorrowStr = `${tomorrow.getUTCFullYear()}-${tomorrow.getUTCMonth() + 1 <= 9 ? '0' + (tomorrow.getUTCMonth() + 1) : tomorrow.getUTCMonth() + 1}-${tomorrow.getUTCDate() <= 9 ?  '0' + tomorrow.getUTCDate() : tomorrow.getUTCDate()}`

    let startDate = document.getElementById("date-start")
    let endDate = document.getElementById("date-end")

    startDate.min = todayStr
    endDate.min = tomorrowStr

    startDate.addEventListener("blur", checkStartDate)
    endDate.addEventListener("blur", checkEndDate)

    document.getElementById("faculty-name").value = facultyName
    document.getElementById("faculty-r-number").value = facultyRNumber

    uploadForm.addEventListener("submit", facultyUpload)

    document.getElementById("faculty-close-form").addEventListener("click", closeFacultyForm)
}

async function viewFacultyStudentData(e) {
    // Populate previously uploaded data

    let studentList = await getStudentList()

    // If Faculty has not submitted their stuff, only show student stuff
    document.getElementById("prev-submission-faculty").classList.remove("hidden") 
    document.getElementById("faculty-status-div").classList.remove("hidden")

    let studentSelect = document.getElementById("faculty-student-select")
    studentRNumber = studentSelect.value

    studentName = studentList[studentRNumber]['name']

    let studentDataDoc = await getDoc(doc(db, "Faculty", facultyRNumber, "Students", studentRNumber))
    let studentData = studentDataDoc.data()

    let studentSubmissionDataDoc = await getDoc(doc(db, "Faculty", facultyRNumber))
    let studentSubmissionData = studentSubmissionDataDoc.data()

    let students = studentSubmissionData['students']


    // Populate the submitted student data
    document.getElementById("status-faculty").innerHTML = students[studentRNumber]['status']
    document.getElementById("submitted-faculty").value = studentData['submitDate']

    document.getElementById("student-name-faculty-display").value = studentData['studentName']
    document.getElementById("student-rNumber-faculty-display").value = studentData['studentRNumber']

    displayFileData = {
        'timeline': {'address': studentData['timelineAddress'], 'name': studentData['timelineActualName']},
        'proposal': {'address': studentData['proposalAddress'], 'name': studentData['proposalActualName']},
        'studentCV': {'address': studentData['studentCVAddress'], 'name': studentData['studentCVActualName']},
        'budget': {'address': studentData['budgetAddress'], 'name': studentData['budgetActualName']},
        'facultyCV': {'address': studentData['facultyCVAddress'], 'name': studentData['facultyCVActualName']},
    }

    document.getElementById("timeline-faculty-display").addEventListener("click", downloadTimeline)
    document.getElementById("proposal-faculty-display").addEventListener("click", downloadProposal)
    document.getElementById("student-cv-faculty-display").addEventListener("click", downloadStudentCV)

    if (students[studentRNumber]['status'] == "In Progress") {
        // Allow the user to upload data
        document.getElementById("update-faculty-info").addEventListener("click", populateFacultyForm)
        document.getElementById("update-faculty-info").classList.remove("hidden")
    } else {
        document.getElementById("update-faculty-info").removeEventListener("click", populateFacultyForm)
        document.getElementById("update-faculty-info").classList.add("hidden")
    }

    document.getElementById("confirm-div-faculty").classList.add("hidden")
    document.getElementById("confirm-faculty-background").classList.add("hidden")

    if (studentData['facultyName'] != undefined) { // If there is previous faculty data
        // Populate the rest of the submitted data for faculty
        
        document.getElementById("faculty-data-faculty-display").classList.remove("hidden")

        document.getElementById("faculty-name-faculty-display").value = studentData['facultyName']
        document.getElementById("faculty-rNumber-faculty-display").value = studentData['facultyRNumber']

        document.getElementById("date-start-faculty-display").value = studentData['startDate']
        document.getElementById("date-end-faculty-display").value = studentData['endDate']

        document.getElementById("budget-faculty-display").addEventListener("click", downloadBudget)
        document.getElementById("faculty-cv-faculty-display").addEventListener("click", downloadFacultyCV)


        if (students[studentRNumber]['status'] != "In Progress") { // If the status is in progress, show the review button
            document.getElementById("submit-btn").disabled = true
            document.getElementById("submit-btn").removeEventListener("click", openConfirmFaculty)
            document.getElementById("confirm-continue-faculty").removeEventListener("click", submitForm)
            document.getElementById("confirm-cancel-faculty").removeEventListener("click", closeConfirmFaculty)
            document.getElementById("submit-btn").classList.add("hidden")
        } else {
            document.getElementById("submit-btn").disabled = false
            document.getElementById("submit-btn").addEventListener("click", openConfirmFaculty)
            document.getElementById("confirm-continue-faculty").addEventListener("click", submitForm)
            document.getElementById("confirm-cancel-faculty").addEventListener("click", closeConfirmFaculty)
            document.getElementById("submit-btn").classList.remove("hidden")
        }
    } else { // Clear the remaining contents if there is no previous faculty data
        document.getElementById("faculty-data-faculty-display").classList.add("hidden")
        document.getElementById("faculty-name-faculty-display").value = ""
        document.getElementById("faculty-rNumber-faculty-display").value = ""

        document.getElementById("date-start-faculty-display").value = ""
        document.getElementById("date-end-faculty-display").value = ""

        document.getElementById("budget-faculty-display").removeEventListener("click", downloadBudget)
        document.getElementById("faculty-cv-faculty-display").removeEventListener("click", downloadFacultyCV)

        
        document.getElementById("submit-btn").disabled = true
        document.getElementById("submit-btn").removeEventListener("click", openConfirmFaculty)
        document.getElementById("confirm-continue-faculty").removeEventListener("click", submitForm)
        document.getElementById("confirm-cancel-faculty").removeEventListener("click", closeConfirmFaculty)
        document.getElementById("submit-btn").classList.add("hidden")
    }

    selectPicture()
    document.getElementById("status-fox-div-faculty").classList.remove("hidden")
    
}

async function downloadBudget() {
    if (displayFileData == {}) {
        return
    }
    await downloadFile(displayFileData['budget']['address'], displayFileData['budget']['name'])
}

async function downloadFacultyCV() {
    if (displayFileData == {}) {
        return
    }
    await downloadFile(displayFileData['facultyCV']['address'], displayFileData['facultyCV']['name'])
}

async function submitForm(e) {
    const facultyStudentRef = doc(db, "Faculty", facultyRNumber)

    let facultyStudentData = (await getDoc(facultyStudentRef)).data()

    let updateStudents = facultyStudentData['students']

    updateStudents[studentRNumber]['status'] = 'Under Review'

    await updateDoc(facultyStudentRef, {
        students: updateStudents,
    })

    await viewFacultyStudentData(e)
}

async function facultyUpload(e) {
    e.preventDefault()

    // Name
    const formName = document.getElementById("faculty-name").value

    // R Number
    const formRNumber = document.getElementById("faculty-r-number").value

    // Dates
    let startDateSuccess = await checkStartDate()
    let endDateSuccess = await checkEndDate()
    if (!(startDateSuccess && endDateSuccess)) {
        alert("Invalid start or end date, please confirm your start and end date is correct")
        return
    }
    const formStartDate = document.getElementById("date-start").value
    const formEndDate = document.getElementById("date-end").value

    // Forms
    const fileIds = ['budget', 'faculty-cover-letter']

    let fileData = [] // Used for file upload
    let dictFileData = {} // Used for database upload
    for (let fileId of fileIds) {
        const fileLocation = document.getElementById(fileId).value

        let address = fileLocation
        address = address.replaceAll("C:\\fakepath\\", "")

        if (address == "") {
            console.log(fileId, "No file")
            return
        }

        // Check on the back end if the file is a pdf
        if (!(await isPdf(fileId))) {
            return
        }

        switch (fileId) { //Switch from studentRNumber to uid maybe
            case 'budget':
                fileData.push({"fileId": fileId, "desName": `${studentRNumber}/Budget.pdf`, "address": address})
                dictFileData['budget'] = {"fileId": fileId, "desName": `${studentRNumber}/Budget.pdf`, "address": address}
                break
            case 'faculty-cover-letter':
                fileData.push({"fileId": fileId, "desName": `${studentRNumber}/FacultyCoverLetter.pdf`, "address": address})
                dictFileData['cv'] = {"fileId": fileId, "desName": `${studentRNumber}/FacultyCoverLetter.pdf`, "address": address}
        }
    }   

    let today = new Date()
    let todayStr = await getDateStr(today)

    await updateDoc(doc(db, "Faculty", facultyRNumber, "Students", studentRNumber), {
        budgetAddress: dictFileData['budget']['desName'],
        budgetActualName: dictFileData['budget']['address'],
        facultyCVAddress: dictFileData['cv']['desName'],
        facultyCVActualName: dictFileData['cv']['address'],
        facultyRNumber: formRNumber,
        facultyName: formName,
        startDate: formStartDate,
        endDate: formEndDate,
        submitDate: todayStr,
    });

    const facultyStudentRef = doc(db, "Faculty", facultyRNumber)

    let facultyStudentData = (await getDoc(facultyStudentRef)).data()

    let updateStudents = facultyStudentData['students']

    updateStudents[studentRNumber]['status'] = 'In Progress'
    updateStudents[studentRNumber]['adminApproved'] = []
    updateStudents[studentRNumber]['adminDenied'] = []

    await updateDoc(facultyStudentRef, {
        students: updateStudents,
    })

    let success = await uploadMultipleFiles(fileData)

    if (success) {
        closeFacultyForm()
        viewFacultyStudentData()
    }
}

function resetFaculty() {
    // Reset student selector
    document.getElementById("faculty-student-select").innerHTML = '<option value="" selected disabled></option>'
    document.getElementById("faculty-student-select").removeEventListener("change", viewFacultyStudentData)

    // Reset displayed student and facultydata
    if (studentName) {
        document.getElementById("prev-submission-faculty").classList.add("hidden") 
        document.getElementById("faculty-status-div").classList.add("hidden")

        let updateInfoButton = document.getElementById("update-faculty-info")
        updateInfoButton.removeEventListener("click", populateFacultyForm)
        updateInfoButton.classList.add("hidden")

        // Reset submission data
        document.getElementById("status-faculty").innerHTML = ""
        document.getElementById("submitted-faculty").value = ""

        // Reset student info
        document.getElementById("student-name-faculty-display").value = ""
        document.getElementById("student-rNumber-faculty-display").value = ""

        
        document.getElementById("timeline-faculty-display").removeEventListener("click", downloadTimeline)
        document.getElementById("proposal-faculty-display").removeEventListener("click", downloadProposal)
        document.getElementById("student-cv-faculty-display").removeEventListener("click", downloadStudentCV)

        // Reset faculty info
        document.getElementById("faculty-data-faculty-display").classList.add("hidden")
        document.getElementById("faculty-name-faculty-display").value = ""
        document.getElementById("faculty-rNumber-faculty-display").value = ""

        document.getElementById("date-start-faculty-display").value = ""
        document.getElementById("date-end-faculty-display").value = ""

        document.getElementById("budget-faculty-display").removeEventListener("click", downloadBudget)
        document.getElementById("faculty-cv-faculty-display").removeEventListener("click", downloadFacultyCV)

        document.getElementById("confirm-div-faculty").classList.add("hidden")
        document.getElementById("confirm-faculty-background").classList.add("hidden")
        document.getElementById("submit-btn").disabled = true
        document.getElementById("submit-btn").removeEventListener("click", openConfirmFaculty)
        document.getElementById("confirm-continue-faculty").removeEventListener("click", submitForm)
        document.getElementById("confirm-cancel-faculty").removeEventListener("click", closeConfirmFaculty)
        document.getElementById("submit-btn").classList.add("hidden")

        
        document.getElementById("status-fox-div-faculty").classList.add("hidden")
        document.getElementById("status-fox-faculty").src = ""
        document.getElementById("status-fox-faculty").alt = ""

    }
    displayFileData = {}

    // Reset form
    if (!document.getElementById("form-faculty").classList.contains("hidden")) {
        closeFacultyForm()
    }
}

function openConfirmFaculty() {
    document.getElementById("confirm-div-faculty").classList.remove("hidden")
    document.getElementById("confirm-faculty-background").classList.remove("hidden")
}

function closeConfirmFaculty() {
    document.getElementById("confirm-div-faculty").classList.add("hidden")
    document.getElementById("confirm-faculty-background").classList.add("hidden")
}

function closeFacultyForm() {
    document.getElementById("form-faculty-background").classList.add("hidden"); // Maggie Edit
    let facultyForm = document.getElementById("form-faculty")

    
    facultyForm.reset()
    document.getElementById("date-start").min = ""
    document.getElementById("date-start").max = ""

    document.getElementById("date-end").min = ""
    document.getElementById("date-end").max = ""

    facultyForm.removeEventListener('submit', facultyUpload)
    setTimeout(() => {
        facultyForm.classList.add("hidden")
    }, 0)
    
    document.getElementById("faculty-close-form").removeEventListener("click", closeFacultyForm)
    document.getElementById("faculty-student-select").disabled = false
    
    if (document.getElementById("status-faculty").innerHTML == "In Progress") {
        document.getElementById("submit-btn").disabled = false
        document.getElementById("confirm-continue-faculty").addEventListener("click", submitForm)
        document.getElementById("submit-btn").classList.remove("hidden")
    }

    document.getElementById("update-faculty-info").disabled = false
}

async function checkStartDate(e, prevFunc = "", isAdmin = false) {
    let startDate = document.getElementById("date-start")
    let endDate = document.getElementById("date-end")
    if (isAdmin) { // If the supervising faculty is an admin
        startDate = document.getElementById("admin-date-start")
        endDate = document.getElementById("admin-date-end")
    }
    if (startDate.value == '') {
        let today = new Date()
        let tomorrow = await getNextDay(today)
        let tomorrowStr = await getDateStr(tomorrow)
        endDate.min = tomorrowStr
        return false
    }
    let minDate = new Date(startDate.min)
    const minDateStr = await getDateStr(minDate)
    let startDateDate = new Date(startDate.value)

    if (startDateDate < minDate) { // Reset start date to minimum date
        startDate.value = minDateStr
        let nextDay = await getNextDay(minDate)
        let nextDayStr = await getDateStr(nextDay)
        endDate.min = nextDayStr
        return false
    }

    if (startDate.max != '') { // If there is a maximum date
        let maxDate = new Date(startDate.max)
        const maxDateStr = await getDateStr(maxDate)
        let startDateDate = new Date(startDate.value)

        if (startDateDate > maxDate) { // Reset start date to maximum date
            startDate.value = maxDateStr
            let nextDay = await getNextDay(maxDate)
            let nextDayStr = await getDateStr(nextDay)
            endDate.min = nextDayStr
            return false
        }
    }
    let nextDay = await getNextDay(startDateDate)
    let nextDayStr = await getDateStr(nextDay)
    endDate.min = nextDayStr
    if (prevFunc != "checkEndDate") { // Prevent infinite loop
        await checkEndDate(e, "checkStartDate", isAdmin) // Make sure adjusting min date did not mess up the end date
    }
    return true
}

async function checkEndDate(e, prevFunc = "", isAdmin = false) {
    let startDate = document.getElementById("date-start")
    let endDate = document.getElementById("date-end")
    if (isAdmin) { // If the supervising faculty is an admin
        startDate = document.getElementById("admin-date-start")
        endDate = document.getElementById("admin-date-end")
    }

    if (endDate.value == '') { // No date is provided
        startDate.max = ""
        return false
    }
    let minDate = new Date(endDate.min)
    const minDateStr = await getDateStr(minDate)
    let endDateDate = new Date(endDate.value)

    if (endDateDate < minDate) { // Reset end date to minimum date
        endDate.value = minDateStr
        let prevDay = await getPrevDay(minDate)
        let prevDayStr = await getDateStr(prevDay)
        startDate.max = prevDayStr
        return false
    }

    if (endDate.max != '') { // If there is a maximum date
        let maxDate = new Date(endDate.max)
        const maxDateStr = await getDateStr(maxDate)
        let endDateDate = new Date(endDate.value)

        if (endDateDate > maxDate) { // Reset end date to maximum date
            endDate.value = maxDateStr
            let prevDay = await getPrevDay(maxDate)
            let prevDayStr = await getDateStr(prevDay)
            startDate.max = prevDayStr
            return false
        }
    }
    let prevDay = await getPrevDay(endDateDate)
    let prevDayStr = await getDateStr(prevDay)
    startDate.max = prevDayStr

    if (prevFunc != "checkStartDate") { // Prevent infinite loop
        await checkStartDate(e, "checkEndDate", isAdmin) // Make sure adjusting max date did not mess up the start date
    }
    return true
}

async function getNextDay(dateObj) {
    let nextDay = new Date(dateObj)
    nextDay.setUTCDate(nextDay.getUTCDate() + 1)
    return nextDay
}

async function getPrevDay(dateObj) {
    let nextDay = new Date(dateObj)
    nextDay.setUTCDate(nextDay.getUTCDate() - 1)
    return nextDay
}

async function getDateStr(dateObj) {
    const year = dateObj.getUTCFullYear()
    const month = dateObj.getUTCMonth() + 1 <= 9 ? '0' + (dateObj.getUTCMonth() + 1) : dateObj.getUTCMonth() + 1
    const date = dateObj.getUTCDate() <= 9 ?  '0' + dateObj.getUTCDate() : dateObj.getUTCDate()
    let dateStr = `${year}-${month}-${date}`
    return dateStr
}





// Admin 



function populateAdmin() {

    // Eventually remove sign-in-div.innerHTML and populate faculty
    document.getElementById("sign-in-div").classList.add("hidden")
    document.getElementById("admin-view").classList.remove("hidden")

    document.getElementById("user-name").innerHTML = `<h2>Welcome ${userName}!</h2>`

    document.getElementById("admin-sort-select").addEventListener("change", selectSortAdmin)
}

async function selectSortAdmin() { // Select between sorting by student or faculty
    let selectSort = document.getElementById("admin-sort-select").value

    if (selectSort == "faculty") {
        await populateFacultyList()
        document.getElementById("student-sort").classList.add("hidden")
        document.getElementById("faculty-sort").classList.remove("hidden")
    } else {
        await populateStudentOnlyList()
        document.getElementById("faculty-sort").classList.add("hidden")
        document.getElementById("student-sort").classList.remove("hidden")
    }
    
    document.getElementById("admin-student-select-faculty-sort").parentNode.classList.add("hidden")
    document.getElementById("admin-student-select-faculty-sort").innerHTML = '<option value="" selected disabled></option>'
    resetAdminStudentDisplay()
}

let studentOnlyList

async function populateStudentOnlyList() {
    let facultyCollection = collection(db, "Faculty")
    
    let studentSelect = document.getElementById("admin-student-select-student-sort")
    studentSelect.innerHTML = '<option value="" selected disabled></option>'

    // Remove previous event listeners from sort by faculty
    let studentSelectFaculty = document.getElementById("admin-student-select-faculty-sort")
    studentSelectFaculty.removeEventListener("change", populateAdminStudentFacultyDisplay)

    let facultySelect = document.getElementById("admin-faculty-select-faculty-sort")
    facultySelect.removeEventListener("change", populateStudentList)

    studentOnlyList = {}
    await getDocs(facultyCollection).then((snapshot) => {
        // Loop through each
        snapshot.forEach((doc) => {
            let studentData = doc.data()

            let students = studentData['students']
        
            // Loop through the list of students
            for (let [studentRNumber, selectedStudentData] of Object.entries(students)) {
                studentSelect.innerHTML += `<option value="${studentRNumber}${doc.id}">${selectedStudentData['name']} (${studentData['facultyName']})</option>`
                studentOnlyList[studentRNumber + doc.id] = {
                    'studentRNumber': studentRNumber,
                    'studentName': selectedStudentData['name'], 
                    'facultyRNumber': doc.id,
                    'facultyName': studentData['facultyName']
                }
            }

        })

        if (studentSelect.innerHTML == "<option value=\"\" selected=\"\" disabled=\"\"></option>") {
            throw("No students found")
        }

        studentSelect.addEventListener("change", populateAdminStudentOnlyDisplay)
        document.getElementById("info-print").innerHTML = ""
        studentSelect.disabled = false
    })
    .catch((error) => {
        studentSelect.disabled = true
        studentSelect.removeEventListener("change", populateAdminStudentOnlyDisplay)
        console.error("Error getting documents: ", error);
        document.getElementById("info-print").innerHTML = "<p class='row'>There was an error retrieving students, please contact <a class='anchorBlack' href='mailto:crfRollins@gmail.com'>crfRollins@gmail.com</a></p>"
      })
}

async function populateAdminStudentOnlyDisplay(e) {
    let specificStudentData = studentOnlyList[e.target.value]
    facultyRNumber = specificStudentData['facultyRNumber']
    facultyName = specificStudentData['facultyName']
    studentRNumber = specificStudentData['studentRNumber']
    studentName = specificStudentData['studentName']
    await populateAdminStudentDisplay()
}

async function populateFacultyList() {
    let facultyCollection = collection(db, "Faculty")

    let studentSelect = document.getElementById("admin-student-select-student-sort")
    studentSelect.removeEventListener("change", populateAdminStudentOnlyDisplay)

    let facultySelect = document.getElementById("admin-faculty-select-faculty-sort")
    facultySelect.innerHTML = '<option value="" selected disabled></option>'

    let facultyList = {}
    await getDocs(facultyCollection).then((snapshot) => {
        snapshot.forEach((doc) => {
            let facultyData = doc.data()

            if (doc.id.charAt(0) != "R" || facultyData['facultyName'] == undefined) {
                throw("Invalid faculty members")
            }

            facultySelect.innerHTML += `<option value="${doc.id}">${facultyData['facultyName']}</option>`
            facultyList[doc.id] = facultyData['facultyName']
        })
        if (facultySelect.innerHTML == "<option value=\"\" selected=\"\" disabled=\"\"></option>") {
            throw("No faculty members found")
        }
        facultySelect.addEventListener("change", populateStudentList)
        facultySelect.disabled = false
        document.getElementById("info-print").innerHTML = ""
    })
    .catch((error) => {
        facultySelect.disabled = true
        facultySelect.removeEventListener("change", populateStudentList)
        console.error("Error getting documents: ", error);
        document.getElementById("info-print").innerHTML = "<p class='row'>There was an error retrieving faculty members, please contact <a class='anchorBlack' href='mailto:crfRollins@gmail.com'>crfRollins@gmail.com</a></p>"
      })

}

async function populateStudentList() {
    let facultySelect = document.getElementById("admin-faculty-select-faculty-sort")
    facultyRNumber = facultySelect.value
    facultyName = facultySelect.options[facultySelect.selectedIndex].text

    let studentList = await getStudentList()

    if (studentList == undefined) {
        document.getElementById("info-print").innerHTML = "<p class='row'>There was an error retrieving students, please contact <a class='anchorBlack' href='mailto:crfRollins@gmail.com'>crfRollins@gmail.com</a></p>"
        return
    }
    
    let studentSelect = document.getElementById("admin-student-select-faculty-sort")
    studentSelect.innerHTML = '<option value="" selected disabled></option>'

    for (let [studentRNumber, studentName] of Object.entries(studentList)) {
        studentSelect.innerHTML += `<option value="${studentRNumber}">${studentName['name']}</option>`
    }
    studentSelect.parentNode.classList.remove("hidden")
    studentSelect.addEventListener("change", populateAdminStudentFacultyDisplay)

}

async function populateAdminStudentFacultyDisplay(e) {
    studentRNumber = e.target.value
    studentName = e.target.options[e.target.selectedIndex].text
    await populateAdminStudentDisplay()
    
}

async function populateAdminStudentDisplay() {
    document.getElementById("admin-status-div").classList.remove("hidden")
    document.getElementById("prev-submission-admin").classList.remove("hidden")

    let studentDataDoc = await getDoc(doc(db, "Faculty", facultyRNumber, "Students", studentRNumber))
    let studentData = studentDataDoc.data()

    let studentSubmissionDataDoc = await getDoc(doc(db, "Faculty", facultyRNumber))
    let studentSubmissionData = studentSubmissionDataDoc.data()

    let students = studentSubmissionData['students']


    // Populate the submitted student data
    document.getElementById("status-admin").innerHTML = students[studentRNumber]['status']
    document.getElementById("submitted-admin").value = studentData['submitDate']
    document.getElementById("approve-deny-status").innerHTML = ""

    if (rNumber == facultyRNumber && students[studentRNumber]['status'] == "In Progress") {
        document.getElementById("update-admin-info").classList.remove("hidden")
        document.getElementById("update-admin-info").addEventListener("click", populateAdminForm)

    } else {
        document.getElementById("update-admin-info").classList.add("hidden")
        document.getElementById("update-admin-info").removeEventListener("click", populateAdminForm)
    }

    document.getElementById("student-name-admin-display").value = studentData['studentName']
    document.getElementById("student-rNumber-admin-display").value = studentData['studentRNumber']

    displayFileData = {
        'timeline': {'address': studentData['timelineAddress'], 'name': studentData['timelineActualName']},
        'proposal': {'address': studentData['proposalAddress'], 'name': studentData['proposalActualName']},
        'studentCV': {'address': studentData['studentCVAddress'], 'name': studentData['studentCVActualName']},
        'budget': {'address': studentData['budgetAddress'], 'name': studentData['budgetActualName']},
        'facultyCV': {'address': studentData['facultyCVAddress'], 'name': studentData['facultyCVActualName']},
    }

    document.getElementById("timeline-admin-display").addEventListener("click", downloadTimeline)
    document.getElementById("proposal-admin-display").addEventListener("click", downloadProposal)
    document.getElementById("student-cv-admin-display").addEventListener("click", downloadStudentCV)

    document.getElementById("confirm-admin-background").classList.add("hidden")
    document.getElementById("confirm-div-admin").classList.add("hidden")

    if (studentData['facultyName'] != undefined) { // If there is previous faculty data
        // Populate the rest of the submitted data for faculty
        
        document.getElementById("faculty-data-admin-display").classList.remove("hidden")

        document.getElementById("faculty-name-admin-display").value = studentData['facultyName']
        document.getElementById("faculty-rNumber-admin-display").value = studentData['facultyRNumber']

        document.getElementById("date-start-admin-display").value = studentData['startDate']
        document.getElementById("date-end-admin-display").value = studentData['endDate']

        document.getElementById("budget-admin-display").addEventListener("click", downloadBudget)
        document.getElementById("faculty-cv-admin-display").addEventListener("click", downloadFacultyCV)

        if (students[studentRNumber]['status'] == "Under Review") { // Only allow approve or deny if a proposal is currently under review
            document.getElementById("approve").classList.remove("hidden")
            document.getElementById("approve").addEventListener("click", approve)
            document.getElementById("approve").disabled = false
            document.getElementById("deny").classList.remove("hidden")
            document.getElementById("deny").addEventListener("click", deny)
            document.getElementById("deny").disabled = false
        } else {
            document.getElementById("approve").classList.add("hidden")
            document.getElementById("approve").removeEventListener("click", approve)
            document.getElementById("deny").classList.add("hidden")
            document.getElementById("deny").removeEventListener("click", deny)
        }

        // Check if an admin is viewing their student, and allow them to submit the form for review
        if (rNumber == facultyRNumber && students[studentRNumber]['status'] == "In Progress") {
            document.getElementById("submit-btn-admin").addEventListener("click", openConfirmAdmin)
            document.getElementById("confirm-continue-admin").addEventListener("click", submitFormAdmin)
            document.getElementById("confirm-cancel-admin").addEventListener("click", closeConfirmAdmin)
            document.getElementById("submit-btn-admin").classList.remove("hidden")
        } else {
            document.getElementById("submit-btn-admin").removeEventListener("click", openConfirmAdmin)
            document.getElementById("confirm-continue-admin").removeEventListener("click", submitFormAdmin)
            document.getElementById("confirm-cancel-admin").removeEventListener("click", closeConfirmAdmin)
            document.getElementById("submit-btn-admin").classList.add("hidden")
        }
    } else { // Clear the remaining contents if there is no previous faculty data
        document.getElementById("faculty-data-admin-display").classList.add("hidden")
        document.getElementById("faculty-name-admin-display").value = ""
        document.getElementById("faculty-rNumber-admin-display").value = ""

        document.getElementById("date-start-admin-display").value = ""
        document.getElementById("date-end-admin-display").value = ""

        document.getElementById("budget-admin-display").removeEventListener("click", downloadBudget)
        document.getElementById("faculty-cv-admin-display").removeEventListener("click", downloadFacultyCV)

        document.getElementById("submit-btn-admin").removeEventListener("click", openConfirmAdmin)
        document.getElementById("confirm-continue-admin").removeEventListener("click", submitFormAdmin)
        document.getElementById("confirm-cancel-admin").removeEventListener("click", closeConfirmAdmin)
        document.getElementById("submit-btn-admin").classList.add("hidden")

        document.getElementById("approve").classList.add("hidden")
        document.getElementById("approve").removeEventListener("click", approve)
        document.getElementById("deny").classList.add("hidden")
        document.getElementById("deny").removeEventListener("click", deny)

    }

    selectPicture()
    document.getElementById("status-fox-div-admin").classList.remove("hidden")
}

function openConfirmAdmin() {
    document.getElementById("confirm-div-admin").classList.remove("hidden")
    document.getElementById("confirm-admin-background").classList.remove("hidden")
}

function closeConfirmAdmin() {
    document.getElementById("confirm-div-admin").classList.add("hidden")
    document.getElementById("confirm-admin-background").classList.add("hidden")
}

function resetAdminStudentDisplay() {
    document.getElementById("admin-status-div").classList.add("hidden")
    document.getElementById("prev-submission-admin").classList.add("hidden")

    let studentSelect = document.getElementById("admin-student-select-faculty-sort")
    studentSelect.removeEventListener("change", populateAdminStudentFacultyDisplay)
    studentSelect.innerHTML = '<option value="" selected disabled></option>'
    displayFileData = {}

    // Reset submission details
    document.getElementById("status-admin").innerHTML = ""
    document.getElementById("submitted-admin").value = ""
    document.getElementById("approve-deny-status").innerHTML = ""

    document.getElementById("approve").classList.add("hidden")
    document.getElementById("approve").removeEventListener("click", approve)
    document.getElementById("deny").classList.add("hidden")
    document.getElementById("deny").removeEventListener("click", deny)

    document.getElementById("update-admin-info").classList.remove("hidden")
    document.getElementById("update-admin-info").removeEventListener("click", populateAdminForm)

    // Reset student display
    document.getElementById("status-admin").innerHTML = ""
    document.getElementById("submitted-admin").value = ""

    document.getElementById("student-name-admin-display").value = ""
    document.getElementById("student-rNumber-admin-display").value = ""

    document.getElementById("timeline-admin-display").removeEventListener("click", downloadTimeline)
    document.getElementById("proposal-admin-display").removeEventListener("click", downloadProposal)
    document.getElementById("student-cv-admin-display").removeEventListener("click", downloadStudentCV)

    // Reset faculty display
    document.getElementById("faculty-data-admin-display").classList.add("hidden")
    document.getElementById("faculty-name-admin-display").value = ""
    document.getElementById("faculty-rNumber-admin-display").value = ""

    document.getElementById("date-start-admin-display").value = ""
    document.getElementById("date-end-admin-display").value = ""

    document.getElementById("budget-admin-display").removeEventListener("click", downloadBudget)
    document.getElementById("faculty-cv-admin-display").removeEventListener("click", downloadFacultyCV)

    document.getElementById("confirm-admin-background").classList.add("hidden")
    document.getElementById("confirm-div-admin").classList.add("hidden")
    document.getElementById("submit-btn-admin").removeEventListener("click", openConfirmAdmin)
    document.getElementById("confirm-continue-admin").removeEventListener("click", submitFormAdmin)
    document.getElementById("confirm-cancel-admin").removeEventListener("click", closeConfirmAdmin)
    document.getElementById("submit-btn-admin").classList.add("hidden")

    document.getElementById("status-fox-div-admin").classList.add("hidden")
    document.getElementById("status-fox-admin").src = ""
    document.getElementById("status-fox-admin").alt = ""

    if (!document.getElementById("form-admin").classList.contains("hidden")) {
        closeAdminForm()
    }

}

async function populateAdminForm() {
    document.getElementById("form-admin-background").classList.remove("hidden"); // Maggie Edit

    document.getElementById("approve").disabled = true
    document.getElementById("approve").removeEventListener("click", approve)
    document.getElementById("deny").disabled = true
    document.getElementById("deny").removeEventListener("click", deny)

    document.getElementById("form-admin").classList.remove("hidden")
    document.getElementById("update-admin-info").disabled = true
    document.getElementById("submit-btn-admin").disabled = true
    document.getElementById("confirm-continue-admin").removeEventListener("click", submitFormAdmin)

    // Disable all student selection boxes
    document.getElementById("admin-sort-select").disabled = true
    document.getElementById("admin-student-select-student-sort").disabled = true
    document.getElementById("admin-faculty-select-faculty-sort").disabled = true
    document.getElementById("admin-student-select-faculty-sort").disabled = true

    let uploadForm = document.getElementById("form-admin")


    // Set up date elements
    let today = new Date()
    let tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    let todayStr = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1 <= 9 ? '0' + (today.getUTCMonth() + 1) : today.getUTCMonth() + 1}-${today.getUTCDate() <= 9 ?  '0' + today.getUTCDate() : today.getUTCDate()}`
    let tomorrowStr = `${tomorrow.getUTCFullYear()}-${tomorrow.getUTCMonth() + 1 <= 9 ? '0' + (tomorrow.getUTCMonth() + 1) : tomorrow.getUTCMonth() + 1}-${tomorrow.getUTCDate() <= 9 ?  '0' + tomorrow.getUTCDate() : tomorrow.getUTCDate()}`

    let startDate = document.getElementById("admin-date-start")
    let endDate = document.getElementById("admin-date-end")

    startDate.min = todayStr
    endDate.min = tomorrowStr

    startDate.addEventListener("blur", checkStartDateAdmin)
    endDate.addEventListener("blur", checkEndDateAdmin)

    document.getElementById("admin-name").value = facultyName
    document.getElementById("admin-r-number").value = facultyRNumber

    uploadForm.addEventListener("submit", adminUpload)

    document.getElementById("admin-close-form").addEventListener("click", closeAdminForm)
}

function closeAdminForm() {
    document.getElementById("form-admin-background").classList.add("hidden"); // Maggie Edit

    let adminForm = document.getElementById("form-admin")

    adminForm.reset()
    
    document.getElementById("admin-date-start").min = ""
    document.getElementById("admin-date-start").max = ""

    document.getElementById("admin-date-end").min = ""
    document.getElementById("admin-date-end").max = ""

    adminForm.removeEventListener('submit', adminUpload)
    setTimeout(() => {
        adminForm.classList.add("hidden")
    }, 0)
    
    if (facultyRNumber == rNumber && document.getElementById("status-admin").innerHTML == "In Progress") {
        document.getElementById("submit-btn-admin").disabled = false
        document.getElementById("confirm-continue-admin").addEventListener("click", submitFormAdmin)
        document.getElementById("submit-btn-admin").classList.remove("hidden")
    }
    
    if (document.getElementById("status-admin").innerHTML == "Under Review") { // Only allow approve or deny if a proposal is currently under review
        document.getElementById("approve").classList.remove("hidden")
        document.getElementById("approve").addEventListener("click", approve)
        document.getElementById("approve").disabled = false
        document.getElementById("deny").classList.remove("hidden")
        document.getElementById("deny").addEventListener("click", deny)
        document.getElementById("deny").disabled = false
    }

    document.getElementById("admin-close-form").removeEventListener("click", closeAdminForm)
    document.getElementById("admin-sort-select").disabled = false
    document.getElementById("admin-student-select-student-sort").disabled = false
    document.getElementById("admin-faculty-select-faculty-sort").disabled = false
    document.getElementById("admin-student-select-faculty-sort").disabled = false

    document.getElementById("update-admin-info").disabled = false
}

function resetAdmin() {
    // Reset student and faculty selectors
    document.getElementById("admin-sort-select").value = ""
    document.getElementById("admin-sort-select").removeEventListener("change", selectSortAdmin)

    // Reset sort by student selectors
    document.getElementById("student-sort").classList.add("hidden")

    let studentSelect = document.getElementById("admin-student-select-student-sort")
    studentSelect.removeEventListener("change", populateAdminStudentOnlyDisplay)
    studentSelect.innerHTML = '<option value="" selected disabled></option>'

    // Reset sort by faculty selectors
    document.getElementById("faculty-sort").classList.add("hidden")

    let facultySelect = document.getElementById("admin-faculty-select-faculty-sort")
    facultySelect.innerHTML = '<option value="" selected disabled></option>'
    facultySelect.removeEventListener("change", populateStudentList)

    studentOnlyList = {}

    let studentSelectFaculty = document.getElementById("admin-student-select-faculty-sort")
    studentSelectFaculty.removeEventListener("change", populateAdminStudentFacultyDisplay)
    studentSelectFaculty.parentNode.classList.add("hidden")
    studentSelectFaculty.innerHTML = '<option value="" selected disabled></option>'

    // Reset displayed student and faculty data
    if (studentName) {
        resetAdminStudentDisplay()
    }

    // Reset form
    if (!document.getElementById("form-admin").classList.contains("hidden")) {
        closeAdminForm()
    }
}

async function checkStartDateAdmin(e) {
    return await checkStartDate(e, "", true)
}

async function checkEndDateAdmin(e) {
    return await checkEndDate(e, "", true)
}

async function submitFormAdmin() {
    const facultyStudentRef = doc(db, "Faculty", facultyRNumber)

    let facultyStudentData = (await getDoc(facultyStudentRef)).data()

    let updateStudents = facultyStudentData['students']

    updateStudents[studentRNumber]['status'] = 'Under Review'

    await updateDoc(facultyStudentRef, {
        students: updateStudents,
    })

    await populateAdminStudentDisplay()
}

async function adminUpload(e) {
    e.preventDefault()

    // Name
    const formName = document.getElementById("admin-name").value

    // R Number
    const formRNumber = document.getElementById("admin-r-number").value

    // Dates
    let startDateSuccess = await checkStartDateAdmin()
    let endDateSuccess = await checkEndDateAdmin()
    if (!(startDateSuccess && endDateSuccess)) {
        alert("Invalid start or end date, please confirm your start and end date is correct")
        return
    }
    const formStartDate = document.getElementById("admin-date-start").value
    const formEndDate = document.getElementById("admin-date-end").value

    // Forms
    const fileIds = ['admin-budget', 'admin-cover-letter']

    let fileData = [] // Used for file upload
    let dictFileData = {} // Used for database upload
    for (let fileId of fileIds) {
        const fileLocation = document.getElementById(fileId).value

        let address = fileLocation
        address = address.replaceAll("C:\\fakepath\\", "")

        if (address == "") {
            console.log(fileId, "No file")
            return
        }

        // Check on the back end if the file is a pdf
        if (!(await isPdf(fileId))) {
            return
        }

        switch (fileId) { //Switch from studentRNumber to uid maybe
            case 'admin-budget':
                fileData.push({"fileId": fileId, "desName": `${studentRNumber}/Budget.pdf`, "address": address})
                dictFileData['budget'] = {"fileId": fileId, "desName": `${studentRNumber}/Budget.pdf`, "address": address}
                break
            case 'admin-cover-letter':
                fileData.push({"fileId": fileId, "desName": `${studentRNumber}/FacultyCoverLetter.pdf`, "address": address})
                dictFileData['cv'] = {"fileId": fileId, "desName": `${studentRNumber}/FacultyCoverLetter.pdf`, "address": address}
        }
    }   

    let today = new Date()
    let todayStr = await getDateStr(today)

    await updateDoc(doc(db, "Faculty", facultyRNumber, "Students", studentRNumber), {
        budgetAddress: dictFileData['budget']['desName'],
        budgetActualName: dictFileData['budget']['address'],
        facultyCVAddress: dictFileData['cv']['desName'],
        facultyCVActualName: dictFileData['cv']['address'],
        facultyRNumber: formRNumber,
        facultyName: formName,
        startDate: formStartDate,
        endDate: formEndDate,
        submitDate: todayStr,
    });

    const facultyStudentRef = doc(db, "Faculty", facultyRNumber)

    let facultyStudentData = (await getDoc(facultyStudentRef)).data()

    let updateStudents = facultyStudentData['students']

    updateStudents[studentRNumber]['status'] = 'In Progress'
    updateStudents[studentRNumber]['adminApproved'] = []
    updateStudents[studentRNumber]['adminDenied'] = []

    await updateDoc(facultyStudentRef, {
        students: updateStudents,
    })

    let success = await uploadMultipleFiles(fileData)

    if (success) {
        closeAdminForm()
        populateAdminStudentDisplay()
    }
}

async function approve(e) { 

    e.preventDefault()

    // Add current admin to list of admins approved if not already there
    // check if required number of admins is reached and change status

    let adminStudentDocRef = doc(db, "Faculty", facultyRNumber)
    let adminStudentDoc = await getDoc(adminStudentDocRef)
    let adminStudentData = adminStudentDoc.data()

    let updatedStudents = adminStudentData['students']
    let student = updatedStudents[studentRNumber]


    switch (student['status']) {
        case "Approved":
        case "Denied":
            document.getElementById("approve-deny-status").innerHTML = `This proposal is already ${student['status']}`
            return
        case "In Progress":
            document.getElementById("approve-deny-status").innerHTML = "This prospoal is not ready for review"
            return
        case "Under Review":
            if (student['adminApproved'].includes(rNumber)) {
                document.getElementById("approve-deny-status").innerHTML = "You already approved this proposal"

                if (student['adminApproved'].length >= numAdminsRequired) {
                    student['status'] = "Approved"

                    updatedStudents[studentRNumber] = student

                    await updateDoc(adminStudentDocRef, {
                        students: updatedStudents,
                    })

                    await populateAdminStudentDisplay()
                }
                return
            }

            student['adminApproved'].push(rNumber)
            if (student['adminDenied'].includes(rNumber)) { // Remove the admin from the denied count
                student['adminDenied'] = student['adminDenied'].filter(item => item !== rNumber);
            }

            // numAdminsRequired is a temp variable to account for the system not being able to read how many admin accounts are active at the moment
            if (student['adminApproved'].length >= numAdminsRequired) {
                student['status'] = "Approved"
            }

            updatedStudents[studentRNumber] = student

            await updateDoc(adminStudentDocRef, {
                students: updatedStudents,
            })

            await populateAdminStudentDisplay()

            break

    }
    
}

async function deny(e) {
    e.preventDefault()

    // Add current admin to list of admins denied if not already there
    // check if required number of admins is reached and change status

    let adminStudentDocRef = doc(db, "Faculty", facultyRNumber)
    let adminStudentDoc = await getDoc(adminStudentDocRef)
    let adminStudentData = adminStudentDoc.data()

    let updatedStudents = adminStudentData['students']
    let student = updatedStudents[studentRNumber]


    switch (student['status']) {
        case "Approved":
        case "Denied":
            document.getElementById("approve-deny-status").innerHTML = `This proposal is already ${student['status']}`
            return
        case "In Progress":
            document.getElementById("approve-deny-status").innerHTML = "This prospoal is not ready for review"
            return
        case "Under Review":
            if (student['adminDenied'].includes(rNumber)) {
                document.getElementById("approve-deny-status").innerHTML = "You already denied this proposal"

                if (student['adminDenied'].length >= numAdminsRequired) {
                    student['status'] = "Denied"

                    updatedStudents[studentRNumber] = student

                    await updateDoc(adminStudentDocRef, {
                        students: updatedStudents,
                    })

                    await populateAdminStudentDisplay()
                }

                return
            }

            student['adminDenied'].push(rNumber)
            if (student['adminApproved'].includes(rNumber)) { // Remove the admin from the denied count
                student['adminApproved'] = student['adminApproved'].filter(item => item !== rNumber);
            }

            // numAdminsRequired is a temp variable to account for the system not being able to read how many admin accounts are active at the moment
            if (student['adminDenied'].length >= numAdminsRequired) {
                student['status'] = "Denied"
            }

            updatedStudents[studentRNumber] = student

            await updateDoc(adminStudentDocRef, {
                students: updatedStudents,
            })

            await populateAdminStudentDisplay()

            break

    }
}

async function uploadMultipleFiles(files) {
    // files is an array containing fileIds and desired names
    let uploadFiles = []
    for (let fileData of files) {
        const fileId = fileData['fileId']
        const file = document.getElementById(fileId).files[0]
        const storageRef = ref(storage, fileData['desName'])
        uploadFiles.push({'storageRef': storageRef, 'file': file})

    }

    try {
        uploadFiles.forEach(async (fileData) => {
            await uploadBytes(fileData['storageRef'], fileData['file'])
        })
    } catch {
        console.log("Failed to upload files")
        return false
    } finally {
        alert("Files uploaded successfully")
        return true
    }
}

async function downloadFile(fileSrc, desFileName) {

    const storageRef = ref(storage, fileSrc)

    getBlob(storageRef)
            .then(blob => {
                // Create a temporary URL to download the file
                const url = URL.createObjectURL(blob);
    
                // Create a hidden <a> element and trigger download
                const a = document.createElement("a");
                a.href = url;
                a.download = desFileName; // Set the new name for download
                document.body.appendChild(a);
                a.click();
    
                // Clean up after download
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            })
        .catch(error => console.error("Error downloading file:", error));
}
