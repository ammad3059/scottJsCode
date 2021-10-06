//Master Page Code
// The code in this file will load on every page of your site
import { getUser } from 'backend/roles.jsw';
import wixUsers from 'wix-users';
import wixData from 'wix-data';
import { assignRole } from 'backend/roles.jsw';
import {session} from 'wix-storage';
let email;
import wixLocation from 'wix-location';


$w.onReady(async function () {
    wixUsers.onLogin((user) => {
        let url = wixLocation.url;
        wixLocation.to(url)
        let userId = user.id; // "r5cme-6fem-485j-djre-4844c49"
        let isLoggedIn = user.loggedIn; // true
        let userRole = user.role;
        let userdetails ;

        getUser(userId).then( (result)=>{
            userdetails =  result;
            email=userdetails.loginEmail;
            session.setItem("email", email);
             console.log("user data at 13", userdetails);
             wixData.query("memberRoles")
            .eq("email",email )
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    console.log("data  in member roles at 21", results.items[0]); //see item below
                    let item = results.items[0]
                    //console.log(item.isAssigned);
                    if (item.isAssigned == false) {
                        assignRole(item.roleId, userId).then(() => {
                            updatedata(item._id, item.roleId, item.roleName, item.email)
                        })
                    } else {
                        checkUser();
                    }
                } else {
                    console.log("No match found!"); // handle case where no matching items found
                }
            })
            .catch((err) => {
                let errorMsg = err;
            });
        })
       
        
        
    });
    if(wixUsers.currentUser.loggedIn){
        email = await wixUsers.currentUser.getEmail()
        session.setItem("email", email);
        checkUser();
    }
});

function checkUser() {
    let user = wixUsers.currentUser;
    let isLoggedIn = user.loggedIn;
    if (isLoggedIn) {
        wixData.query("memberRoles")
            .eq("email", email)
            .find()
            .then((results) => {
                console.log('result', results);
                if (results.items.length > 0) {
                    console.log('if', results);
                    //console.log(results.items[0]); //see item below
                    let item = results.items[0]
                    let rolename = item.roleName;
                    if (rolename === "Teacher") {
                    console.log('if -> if', rolename);
                        $w("#groupTeacher").expand();
                        $w("#groupstudent").collapse();

                    } else if (rolename === "Student") {
                    console.log('if -> else if', rolename);
                        $w("#groupstudent").expand();
                        $w("#groupTeacher").collapse();

                    }else{
                        console.log('else Role name', rolename)
                    }


                } else {
                    console.log("No match found!"); // handle case where no matching items found
                }
            })
            .catch((err) => {
                let errorMsg = err;
            });
    }
}

function updatedata(id, roleid, rolename, email) {
    var toUpdate = {
        "_id": id,
        "roleId": roleid,
        "roleName": rolename,
        "email": email,
        "isAssigned": true
    };
    wixData.update("memberRoles", toUpdate)
        .then((results) => {
            let item = results;
            checkUser(); //see item below
        })
        .catch((err) => {
            let errorMsg = err;
        });

}

//videos code

// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

import wixUsers from 'wix-users';
import wixData from 'wix-data';
import {session} from 'wix-storage';



$w.onReady(function () {
    let emailnew = session.getItem("email");
    checkUser(emailnew);
});

function checkUser(email) {
    let user = wixUsers.currentUser;
    let isLoggedIn = user.loggedIn;
    
    if (isLoggedIn) {
        wixData.query("memberRoles")
            .eq("email", email)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    let item = results.items[0]
                    let rolename = item.roleName;
                    if (rolename == 'Teacher' || rolename=='Student') {
                        $w("#wixVodDevelop1").collapse();
                        console.log("found")
                        $w("#wixVodDevelop2").expand();
                      
                } else {
                    console.log("No match found!"); // handle case where no matching items found
                }
            }})
            .catch((err) => {
                let errorMsg = err;
            });
    } else {
        $w("#wixVodDevelop2").collapse();
            console.log(" not found")
        $w("#wixVodDevelop1").expand();
        
    }
    
}