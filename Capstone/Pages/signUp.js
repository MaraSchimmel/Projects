// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getAnalytics } from "/node_modules/@firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = window.CONFIG

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Add the Firebase products and methods that you want to use
import {
    getAuth,
    setPersistence,
    EmailAuthProvider,
    createUserWithEmailAndPassword,
    onAuthStateChanged, 
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    onSnapshot,
    query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

initializeApp(firebaseConfig);
let auth = getAuth();
let db = getFirestore();


let rNumbersDocRef = doc(db, "FacultyInformation", "Rnumbers")
let rNumbersData

// Get the current docs at the beginning
const q = query(collection(db, "FacultyInformation"))
let facultyInfoData = {}

const facultyInfoUpdates = onSnapshot(q, (querySnapshot) => {
    facultyInfoData = {}
    querySnapshot.forEach((doc) => {
        facultyInfoData[doc.id] = doc.data()
    })
    rNumbersData = facultyInfoData['Rnumbers']
})

async function main() {
    const createAccountForm = document.getElementById("sign-up")
    const accountTypeSelect = document.getElementById("account-type")

    createAccountForm.addEventListener("submit", createAccount)
    accountTypeSelect.addEventListener("change", toggleStudentView)

    document.getElementById("email").addEventListener("blur", verifyUserEmail)
    document.getElementById("password").addEventListener("input", passwordListener)

    document.getElementById("rnumber").addEventListener("blur", confirmRNumbers)
    document.getElementById("confirm-rnumber").addEventListener("blur", confirmRNumbers)

    if (auth.currentUser) {
        console.log(auth.currentUser)
    } else {
        console.log("Not signed in")
    }
}

main()

async function createAccount(e) {
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const rNumber1 = document.getElementById("rnumber").value
    const rNumber2 = document.getElementById("confirm-rnumber").value
    const accountType = document.getElementById("account-type").value
    const emailErrorEle = document.getElementById("email-error")
    const facultyErrorEle = document.getElementById("faculty-error")
    const rErrorEle = document.getElementById("r-number-error")
    let success = true

    e.preventDefault()

    const validEmail = await validateEmail(email)

    if (!validEmail) { // Check user is attempting to use 
        emailErrorEle.innerHTML = "Your email must be a valid Rollins email"
        emailErrorEle.classList.remove("hidden")
        success = false
    } else {
        emailErrorEle.innerHTML = ""
        emailErrorEle.classList.add("hidden")
    }

    let isTaken = await (isRNumberTaken(rNumber1, accountType))

    if (rNumber1.charAt(0) != "R" || rNumber2.charAt(0) != "R") {
        rErrorEle.innerHTML = "Rollins ID number must begin with R"
        rErrorEle.classList.remove("hidden")
        success = false
    } else if (isNaN(+rNumber1.slice(1)) || isNaN(+rNumber2.slice(1)) || (rNumber1.slice(1).length != 8 || rNumber2.slice(1).length != 8)) {
        rErrorEle.innerHTML = "Rollins ID number must be valid"
        rErrorEle.classList.remove("hidden")
        success = false
    } else if (rNumber1 != rNumber2) {
        rErrorEle.innerHTML = "Rollins ID numbers do not match"
        rErrorEle.classList.remove("hidden")
        success = false
    } else if (isTaken) {
        rErrorEle.innerHTML = "Rollins ID is already taken. If this is an error please contact <a class='anchorBlack' href='mailto:crfRollins@gmail.com'>crfRollins@gmail.com</a>"
        rErrorEle.classList.remove("hidden")
        success = false        
    } else {
        rErrorEle.innerHTML = ""
        rErrorEle.classList.add("hidden")
    }

    let facultyEmail

    const validateEmailResult = await validateFacultyRNumber(email)

    if (accountType == "student") {
        facultyEmail = document.getElementById("faculty-email").value

        if (validateEmailResult['validEmail'] && emailErrorEle.innerHTML == "") {
            emailErrorEle.innerHTML = "Email is already in use"
            emailErrorEle.classList.remove("hidden")
            success = false
        }

    } else {
        facultyEmail = email
        if (!validateEmailResult['validEmail']) {
            facultyErrorEle.innerHTML = "Faculty email doesn't match records. Are you sure you typed the right email?"
            facultyErrorEle.classList.remove("hidden")
            success = false
        } else if (!validateEmailResult['validRNumber'] && rErrorEle.innerHTML == "") {
            rErrorEle.innerHTML = "Rollins ID doesn't match records. Are you sure you typed the right Rollins ID?"
            rErrorEle.classList.remove("hidden")
            success = false
        } else {
            facultyErrorEle.innerHTML = ""
            facultyErrorEle.classList.add("hidden")
        }
    }

    let result = await validateFacultyEmail(facultyEmail)
    if (!result['validEmail'] && facultyErrorEle.innerHTML == "") {
        facultyErrorEle.innerHTML = "Faculty email doesn't match records. Are you sure you typed the right email?"
        facultyErrorEle.classList.remove("hidden")
        success = false
    }

    if (!success) {
        return
    }

    let accountCreated = true
    // Create auth account
    await createUserWithEmailAndPassword(auth, email, password)
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            switch (errorCode) {
                case 'auth/email-already-in-use':
                    emailErrorEle.innerHTML = "Provided email already has an account"
                    emailErrorEle.classList.remove("hidden")
                    resetPassErrors("neutral")
                    console.log(errorCode)
                    console.log(errorMessage)
                    break
                case 'auth/password-does-not-meet-requirements':
                    let split1 = errorMessage.split("[")
                    let split2 = split1[1].split("]")
                    let errors = split2[0].split(", ")
                    resetPassErrors("correct")
                    errors.forEach((error) => {
                        let errorEle
                        switch (error) {
                            case "Password must contain at least 8 characters":
                                errorEle = document.getElementById("length")
                                break
                            case "Password must contain a lower case character":
                                errorEle = document.getElementById("lower")
                                break
                            case "Password must contain an upper case character":
                                errorEle = document.getElementById("upper")
                                break
                            case "Password must contain a numeric character":
                                errorEle = document.getElementById("number")
                                break
                            case "Password must contain a non-alphanumeric character":
                                errorEle = document.getElementById("special")                                
                        }

                        errorEle.classList.add("missing")
                        errorEle.classList.remove("correct")
                    }) 
                    console.log(errorCode)
                    console.log(errorMessage)
                    break
                default:    
                    console.log(errorCode)
                    console.log(errorMessage)
                    resetPassErrors("neutral")
            }
            accountCreated = false
            return
        });
    
    if (auth.currentUser && accountCreated) {
        console.log(auth.currentUser)
    } else {
        console.log("Failed to create account")
        return
    }

    if (accountType == "student") {
        await registerStudent(result)
    } else {
        await registerFaculty(result)
    }

}

async function passwordListener() {
    await isPassValid(document.getElementById("password").value)
}

async function isPassValid(pass) {
    const lengthEle = document.getElementById("length")
    const lowerEle = document.getElementById("lower")
    const upperEle = document.getElementById("upper")
    const numberEle = document.getElementById("number")
    const specialEle = document.getElementById("special")

    const specialCharRegex = /[^A-Za-z0-9]/
    const containsRegex = specialCharRegex.test(pass)

    await resetPassErrors("correct")
    
    if (pass.length < 8) {
        lengthEle.classList.remove("correct")
        lengthEle.classList.add("missing")
    }

    if (!(/[a-z]/.test(pass))) {
        lowerEle.classList.remove("correct")
        lowerEle.classList.add("missing")
    }

    if (!(/[A-Z]/.test(pass))) {
        upperEle.classList.remove("correct")
        upperEle.classList.add("missing")
    }

    if (!(/[0-9]/.test(pass))) {
        numberEle.classList.remove("correct")
        numberEle.classList.add("missing")
    }
    
    if (!containsRegex) {
        specialEle.classList.remove("correct")
        specialEle.classList.add("missing")
    }
}

async function resetPassErrors(status) {
    switch (status) {
        case "neutral":
            document.getElementById("length").classList.remove("missing")
            document.getElementById("lower").classList.remove("missing")
            document.getElementById("upper").classList.remove("missing")
            document.getElementById("number").classList.remove("missing")
            document.getElementById("special").classList.remove("missing")
            
            document.getElementById("length").classList.remove("correct")
            document.getElementById("lower").classList.remove("correct")
            document.getElementById("upper").classList.remove("correct")
            document.getElementById("number").classList.remove("correct")
            document.getElementById("special").classList.remove("correct")
            break
        case "correct":
            document.getElementById("length").classList.remove("missing")
            document.getElementById("lower").classList.remove("missing")
            document.getElementById("upper").classList.remove("missing")
            document.getElementById("number").classList.remove("missing")
            document.getElementById("special").classList.remove("missing")
            
            document.getElementById("length").classList.add("correct")
            document.getElementById("lower").classList.add("correct")
            document.getElementById("upper").classList.add("correct")
            document.getElementById("number").classList.add("correct")
            document.getElementById("special").classList.add("correct")
    }
}

function toggleStudentView() {
    const accountTypeSelect = document.getElementById("account-type")

    if (accountTypeSelect.value == "student") {
        document.getElementById("student-view").style.display = ""
        document.getElementById("faculty-email").disabled = false
        document.getElementById("faculty-email").required = true
    } else {
        document.getElementById("student-view").style.display = "none"
        document.getElementById("faculty-email").disabled = true
        document.getElementById("faculty-email").required = false
    }
}

async function isRNumberTaken(rNumber, accountType) {
    if (accountType == "student") {
        let studentRNumbers = rNumbersData['student'] // Access registered students
        let facultyRNumbers = rNumbersData['faculty'] // Access faculty members in system
    
        if (studentRNumbers.indexOf(rNumber) != -1 || facultyRNumbers.indexOf(rNumber) != -1) {
            return true
        }
    } else {
        let facultyRNumbers = rNumbersData['facultyRegistered'] // Access registered faculty members

        if (facultyRNumbers.indexOf(rNumber) != -1) {
            return true
        }
    }
    
    return false
}

async function validateEmail(email) { // Check if 
    if (document.getElementById("email").type != "email") { // Make sure it is testing email in html
        return false
    }

    email = email.toLowerCase()
    let indexOf = email.indexOf('@rollins.edu')
    if (indexOf != -1) {
        return true
    }
    return false
}

async function verifyUserEmail(e) {
    const emailErrorEle = document.getElementById("email-error")
    const facultyErrorEle = document.getElementById("faculty-error")
    const rErrorEle = document.getElementById("r-number-error")

    const email = e.target.value
    const isValid = await validateEmail(email)

    if (!isValid) {
        emailErrorEle.innerHTML = "Your email must be a valid Rollins email"
        emailErrorEle.classList.remove("hidden")
        return
    }

    emailErrorEle.innerHTML = ""
    emailErrorEle.classList.add("hidden")
}

async function confirmRNumbers(e) {
    const emailErrorEle = document.getElementById("email-error")
    const facultyErrorEle = document.getElementById("faculty-error")
    const rErrorEle = document.getElementById("r-number-error")

    const rNumber1 = document.getElementById("rnumber").value
    const rNumber2 = document.getElementById("confirm-rnumber").value

    const targetValue = e.target.value

    if (targetValue.charAt(0) != "R") {
        rErrorEle.innerHTML = "Rollins ID number must begin with R"
        rErrorEle.classList.remove("hidden")
        return
    }

    if(isNaN(+targetValue.slice(1)) || targetValue.slice(1).length != 8) {
        rErrorEle.innerHTML = "Rollins ID number must be valid"
        rErrorEle.classList.remove("hidden")
        return
    }

    if (rNumber1 == "" || rNumber2 == "") {
        rErrorEle.innerHTML = ""
        rErrorEle.classList.add("hidden")
        return
    }

    if (rNumber1.charAt(0) != "R" || rNumber2.charAt(0) != "R") {
        rErrorEle.innerHTML = "Rollins ID number must begin with R"
        rErrorEle.classList.remove("hidden")
        return
    }

    if(isNaN(+rNumber1.slice(1)) || isNaN(+rNumber2.slice(1)) || (rNumber1.slice(1).length != 8 || rNumber2.slice(1).length != 8)) {
        rErrorEle.innerHTML = "Rollins ID number must be valid"
        rErrorEle.classList.remove("hidden")
        return
    }

    if (rNumber1 != rNumber2) {
        rErrorEle.innerHTML = "Rollins ID numbers do not match"
        rErrorEle.classList.remove("hidden")
        return
    }

    rErrorEle.innerHTML = ""
    rErrorEle.classList.add("hidden")
}

async function validateFacultyRNumber(email) {
    const rNumber = document.getElementById("rnumber").value

    let result = {}

    if (email.toLowerCase() in facultyInfoData) {
        console.log(facultyInfoData)
        console.log(email.toLowerCase())
        console.log(facultyInfoData[email.toLowerCase()])
        let facultyInfo = facultyInfoData[email.toLowerCase()]
        if (facultyInfo['rNumber'] != rNumber) {
            result = {'validEmail': true, 'validRNumber': false}
        } else {
            result = {'validEmail': true, 'validRNumber': true}
        }
    } else {
        result = {'validEmail': false}
    }
    
    return result
}

async function validateFacultyEmail(emailStr) {
    // Confirm that the faculty email exists in "Faculty information" collection

    let result = {}

    if (emailStr.toLowerCase() in facultyInfoData) {
        let facultyInfo = facultyInfoData[emailStr.toLowerCase()]
        result = {'validEmail': true, 'facultyName': facultyInfo['name'], 'facultyRNumber': facultyInfo['rNumber']}
    } else {
        result = {'validEmail': false}
    }

    console.log(result)
    return result   
}

async function registerStudent(facultyResults) {
    const userName = document.getElementById("name").value
    const rNumber = document.getElementById("rnumber").value
    const facultyEmail = document.getElementById("faculty-email").value

    let studentRNumbers = rNumbersData['student'].slice()

    studentRNumbers.push(rNumber)

    const desiredDocData = {
        accountType: "Student",
        facultyEmail: facultyEmail,
        facultyName: facultyResults['facultyName'],
        facultyRNumber: facultyResults['facultyRNumber'],
        name: userName,
        rNumber: rNumber,
    }
    console.log(desiredDocData)
    
    await setDoc(doc(db, "ID collection", auth.currentUser.uid), desiredDocData)
    
    await updateDoc(rNumbersDocRef, {
        student: studentRNumbers
    })

    window.location = `${window.location.origin}/Pages/form.html`
}

async function registerFaculty(facultyResults) {
    const userName = document.getElementById("name").value
    const rNumber = document.getElementById("rnumber").value
    
    let facultyRNumbers = rNumbersData['facultyRegistered'].slice()

    facultyRNumbers.push(rNumber)

    const desiredDocData = {
        accountType: "Faculty",
        name: userName,
        rNumber: facultyResults['facultyRNumber'],
    }
    console.log(desiredDocData)
    await setDoc(doc(db, "ID collection", auth.currentUser.uid), desiredDocData)

    await updateDoc(rNumbersDocRef, {
        facultyRegistered: facultyRNumbers
    })

    window.location = `${window.location.origin}/Pages/form.html`
}