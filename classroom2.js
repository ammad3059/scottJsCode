// signup form code

import { assignRole } from 'backend/roles.jsw';
import { getUserByEmail } from 'backend/roles.jsw';
import wixData from 'wix-data';

let studentRoleid = '550ac399-7614-4b2c-a79f-326c6bda539f';
let teacherRoleId = 'cc79360b-ab1e-4991-95d7-100a3a89d47d';
let selected;

$w.onReady(function () {

});

export function radioGroup1_change(event) {
    selected = $w("#iptRadio").value;
    console.log(selected);
}

export function btnSignUp_click(event) {
    
}

/**
 *	Adds an event handler that fires when a visitor submits a Wix Form and it is successfully received by the server.
 */
export function registrationForm1_wixFormSubmitted() {
    let email = $w('#iptEmail').value;
    console.log(email);
    if (selected === 'Teacher') {
        var toInsert = {
        "roleId": teacherRoleId,
        "roleName": selected,
        "email": email,
        "isAssigned":false
    };
        
    } else if (selected === "Student") {
        var toInsert = {
        "roleId": studentRoleid,
        "roleName": selected,
        "email": email,
        "isAssigned":false
    };
        
    }
    wixData.insert("memberRoles", toInsert)
        .then((results) => {
            let item = results;
            console.log(results); //see item below
        })
        .catch((err) => {
            let errorMsg = err;
        });
}