Getting Repeaters Ready
//Code
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { getUser } from 'backend/data.jsw';
import wixData from 'wix-data';
import { session } from 'wix-storage';
import { local } from 'wix-storage';
let email = session.getItem("email");

$w.onReady(async function () {
    if (wixUsers.currentUser.loggedIn) {
        //email = await wixUsers.currentUser.getEmail()
        getRepeaterReady(email);
    } else {
        let url = "https://www.everythingweddings.co/";
        wixLocation.to(url);
    }
    wixUsers.onLogin((user) => {
        let url = wixLocation.url;
        wixLocation.to(url)
        getRepeaterReady(email)

        /*
        let userId = user.id;
        let userdetails;

        getUser(userId).then((result) => {
            userdetails = result;
            email = userdetails.loginEmail;
            session.setItem("email", email);
            console.log("user data at 28", userdetails);
            getRepeaterReady(email)
        })*/

    });
});

function getRepeaterReady(data_email) {
    wixData.query("weddingProjects")
        .eq("email", data_email)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                console.log("Data in wedding Projects at 41", results.items);
                $w("#myGif").expand();
                setTimeout(()=>{
                    $w("#repeaterWedding").expand();
                    $w("#repeaterWedding").data = results.items;   //see item below
                },2000)
                
            } else {
                console.log("No match found!");   // handle case where no matching items found
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });

}

export function repeaterWedding_itemReady($item, itemData) {
    $w("#myGif").collapse();
    $item("#txtGroom").text = itemData.groomName;
    $item("#txtBride").text = itemData.brideName;
    $item("#txtCeremonyDate").text = itemData.weddingDate;
    $item("#button86").onClick(() => {
        console.log(itemData);
        local.setItem("details", JSON.stringify(itemData)) // saved repeater item data in local storage in Json
    })
    $item("#btnDelete").onClick(() => {
        console.log("Deleting");
        wixData.remove("weddingProjects", itemData._id)
            .then((results) => {
                console.log(results + "item deleted");    //see item below
                let url = wixLocation.url;
                wixLocation.to(url)     // page reload
            })
            .catch((err) => {
                let errorMsg = err;
            });

    })
}

export function btnNewProject_click(event) {
    local.removeItem("details");  // Empty local storage as no data is passing
}



//multi-state code

import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { session } from 'wix-storage';
import { local } from 'wix-storage';
let email = session.getItem("email")

let isTheme, themeName;
let isVenue, venueName;
let isMood, imageUrl;
let isDate, weddingDate;
let url = "https://www.everythingweddings.co/blank";
let selectedcheckboxList;
let timeremained;
let checklists;
let today, date1, diffTime, diffDays, months;
let oldImage = "";
let currentState;
let score;
let dateInserted;
let passedDetails;

$w.onReady(function () {
    $w("#myimage").fitMode = 'fit';

    $w("#progressBarChecklist").targetValue = 100;

    if (wixUsers.currentUser.loggedIn) {
        console.log("")
    } else {
        wixLocation.to(url);
    }
    let weddinginfo = local.getItem("details")
    let pageurl = wixLocation.url;
    console.log(pageurl);
    passedDetails = JSON.parse(weddinginfo)
    console.log(passedDetails)
    if (weddinginfo == null || weddinginfo == undefined) {
        $w("#myimage").src = ""
        //getCheckListProgressReady($w("#datePicker1").value, null)
    } else {
        getValuesReady(passedDetails) // make values/fields ready 
        getCheckListProgressReady(passedDetails.weddingDate, passedDetails) // make progress bar and checklist ready

    }

    $w("#datePicker1").onChange(() => {
        console.log($w("#datePicker1").value.toLocaleDateString());
        weddingDate = $w("#datePicker1").value;
        console.log(weddingDate)
        getCheckListProgressReady(weddingDate, passedDetails)

    })

    $w('#btnUpload').onChange(() => {
        if ($w("#btnUpload").value.length > 0) { // Site visitor choose a file
            console.log("Uploading the file:");
            $w("#btnUpload").uploadFiles()
                .then((uploadedFiles) => {
                    uploadedFiles.forEach(uploadedFile => {
                        imageUrl = uploadedFile.fileUrl; // set image field url
                        $w("#myimage").expand();
                        $w("#myimage").src = imageUrl // set image source 
                    })
                    console.log("Upload successful.");
                })
                .catch((uploadError) => {
                    console.log(uploadError.errorDescription);

                });
        } else {
            $w("#myimage").expand();
            $w("#myimage").src = oldImage // back to old image
            imageUrl = oldImage
        }
    })

    $w("#boxBride").onClick(() => { // Second state
        $w("#myStateBox").changeState("state2");
    })
    $w("#boxGroom").onClick(() => { //Second state
        $w("#myStateBox").changeState("state2");
    })

    // Next buttons

    $w("#btnNext2").onClick(() => { // Go to third  state
        if ($w("#iptBrideName").valid && $w("#iptGroomName").valid) {
            console.log("In if NExt")
            $w("#myStateBox").changeState("state3");
        } else {
            setTimeout(() => {
                $w("#txtmessage2").expand();
            }, 500)
            setTimeout(() => {
                $w("#txtmessage2").collapse();
            }, 2000)
            console.log("Field empty")
        }

    })
    $w("#btnNext3").onClick(() => {
        if ($w("#datePicker1").valid && $w("#checkboxDontKnow").checked == false) {
            console.log("I am in If");
            $w("#myStateBox").changeState("state4");
        } else if ($w("#checkboxDontKnow").checked == true) {
            console.log("I am in else If");
            $w("#myStateBox").changeState("state4");
        } else {
            setTimeout(() => {
                $w("#txtmessage3").expand();
            }, 500)
            setTimeout(() => {
                $w("#txtmessage3").collapse();
            }, 2000)
            console.log("Something Wrong!");
        }

    })
    $w("#btnNext4").onClick(() => {
        if ($w("#radioGroupVenue").value == 'yes' && $w("#iptVenueName").value) {
            console.log("In if");
            $w("#myStateBox").changeState("state5");
        } else if ($w("#radioGroupVenue").value == 'no' && $w("#iptVenueName").value == '') {
            console.log("In else IF");
            $w("#myStateBox").changeState("state5");
        } else {
            setTimeout(() => {
                $w("#txtmessage4").expand();
            }, 500)
            setTimeout(() => {
                $w("#txtmessage4").collapse();
            }, 2000)
            console.log("Something missing!!")
        }

    })
    $w("#btnNext5").onClick(() => {
        if ($w("#radioGroup1").value) {
            console.log("In if");
            $w("#myStateBox").changeState("state6");
        } else {
            setTimeout(() => {
                $w("#txtmessage5").expand();
            }, 500)
            setTimeout(() => {
                $w("#txtmessage5").collapse();
            }, 2000)
            console.log("In ELse");
        }

    })
    $w("#btnNext6").onClick(() => {
        if ($w("#radioGroup2").value) {
            console.log("In if");
            $w("#myStateBox").changeState("state7");
        } else {
            setTimeout(() => {
                $w("#txtmessage6").expand();
            }, 500)
            setTimeout(() => {
                $w("#txtmessage6").collapse();
            }, 2000)
            console.log("In ELse");
        }

    })
    $w("#btnNext7").onClick(() => {
        if ($w("#radioGroupTheme").value == 'yes' && $w("#iptThemeName").value) {
            console.log("In if");
            $w("#myStateBox").changeState("state8");
        } else if ($w("#radioGroupTheme").value == 'no' && $w("#iptThemeName").value == '') {
            console.log("In else IF");
            $w("#myStateBox").changeState("state8");
        } else {
            setTimeout(() => {
                $w("#txtmessage7").expand();
            }, 500)
            setTimeout(() => {
                $w("#txtmessage7").collapse();
            }, 2000)
            console.log("Something missing!!")
        }

    })
    $w("#btnNext8").onClick(() => {
        if ($w("#radioGroup3").value) {
            console.log("In if");
            $w("#myStateBox").changeState("state9");
        } else {
            setTimeout(() => {
                $w("#txtmessage8").expand();
            }, 500)
            setTimeout(() => {
                $w("#txtmessage8").collapse();
            }, 2000)
            console.log("In ELse");
        }

    })
    $w("#btnNext9").onClick(() => {
        if ($w("#radioGroupmood").value == 'yes' && $w("#myimage").src != "") {
            console.log("In if");
            $w("#myStateBox").changeState("state10");
        } else if ($w("#radioGroupmood").value == 'no' && $w("#myimage").src == "") {
            console.log("In else if of images");
            $w("#myStateBox").changeState("state10");
        } else {
            setTimeout(() => {
                $w("#txtmessage9").expand();
            }, 500)
            setTimeout(() => {
                $w("#txtmessage9").collapse();
            }, 2000)
            console.log("Somethin went wrong dude!!");
        }

    })

    // Back Buttons 

    $w("#btnBack3").onClick(() => {
        $w("#myStateBox").changeState("state2");
    })
    $w("#btnBack4").onClick(() => {
        $w("#myStateBox").changeState("state3");
    })
    $w("#btnBack5").onClick(() => {
        $w("#myStateBox").changeState("state4");
    })
    $w("#btnBack6").onClick(() => {
        $w("#myStateBox").changeState("state5");
    })
    $w("#btnBack7").onClick(() => {
        $w("#myStateBox").changeState("state6");
    })
    $w("#btnBack8").onClick(() => {
        $w("#myStateBox").changeState("state7");
    })
    $w("#btnBack9").onClick(() => {
        $w("#myStateBox").changeState("state8");
    })
    $w("#btnBack10").onClick(() => {
        $w("#myStateBox").changeState("state9");
    })

    $w("#btnSubmit").onClick(() => {
        if (weddinginfo == null || weddinginfo == undefined) {
            console.log("in insertion")
            let toInsert = {
                "email": email,
                "brideName": $w("#iptBrideName").value,
                "groomName": $w("#iptGroomName").value,
                "isDate": $w("#checkboxDontKnow").checked,
                "weddingDate": $w("#datePicker1").value.toLocaleDateString(),
                "isVenue": $w("#radioGroupVenue").value,
                "venueName": $w("#iptVenueName").value,
                "type": $w("#radioGroup1").value,
                "guests": $w("#radioGroup2").value,
                "istheme": $w("#radioGroupTheme").value,
                "themeName": $w("#iptThemeName").value,
                "planner": $w("#radioGroup3").value,
                "isWeddingBoard": $w("#radioGroupmood").value,
                "weddingBoard": imageUrl,
                "checklists": $w("#checkboxCheckLists").value

            };

            wixData.insert("weddingProjects", toInsert) // inserting a new record 
                .then((results) => {
                    let item = results;
                    console.log("insert item in database-->", item); //see inserted item below
                    setTimeout(() => {
                        $w("#txtSubmitMessage").expand();
                    }, 500)
                    wixLocation.to(url)
                })
                .catch((err) => {
                    let errorMsg = err;
                    console.log("Error occured while insertion in database")
                });
        } else {
            console.log("in updation")
            let toUpdate = {
                "_id": passedDetails._id,
                "email": email,
                "brideName": $w("#iptBrideName").value,
                "groomName": $w("#iptGroomName").value,
                "isDate": $w("#checkboxDontKnow").checked,
                "weddingDate": $w("#datePicker1").value.toLocaleDateString(),
                "isVenue": $w("#radioGroupVenue").value,
                "venueName": $w("#iptVenueName").value,
                "type": $w("#radioGroup1").value,
                "guests": $w("#radioGroup2").value,
                "istheme": $w("#radioGroupTheme").value,
                "themeName": $w("#iptThemeName").value,
                "planner": $w("#radioGroup3").value,
                "isWeddingBoard": $w("#radioGroupmood").value,
                "weddingBoard": imageUrl,
                "checklists": $w("#checkboxCheckLists").value

            };

            wixData.update("weddingProjects", toUpdate) // updating an existing record 
                .then((results) => {
                    let item = results;
                    console.log("updated item in database-->", item); //see item below
                    wixLocation.to(url)
                })
                .catch((err) => {
                    let errorMsg = err;
                    console.log("Error occured while updation in database")
                });
        }
    })

});

export function radioGroupmood_change(event) { // for expanding and collpsing the wedding Mood option
    //isMood = $w("#radioGroupmood").value
    console.log($w("#radioGroupmood").value);
    if ($w("#radioGroupmood").value == 'yes') {
        $w("#btnUpload").expand();
        $w("#txtmessage").collapse();
    } else {
        imageUrl = ""
        $w("#myimage").src = ""
        $w("#btnUpload").collapse();
        $w("#txtmessage").expand();
    }
}

export function radioGroupVenue_change(event) { // for expanding and collpsing the venue option
    //isVenue = $w("#radioGroupVenue").value
    console.log($w("#radioGroupVenue").value);
    if ($w("#radioGroupVenue").value == 'yes') {
        $w("#iptVenueName").expand();
    } else {
        $w("#iptVenueName").value = ''
        $w("#iptVenueName").collapse();
    }
}

export function radioGroupTheme_change(event) { // for expanding and collpsing the Theme option
    //isTheme = $w("#radioGroupTheme").value
    console.log($w("#radioGroupTheme").value);
    if ($w("#radioGroupTheme").value == 'yes') {
        $w("#iptThemeName").expand();
    } else {
        $w("#iptThemeName").value = ''
        $w("#iptThemeName").collapse();
    }
}

export function checkboxDontKnow_change(event) {
    //isDate = $w("#checkboxDontKnow").checked
    console.log($w("#checkboxDontKnow").checked)
    if ($w("#checkboxDontKnow").checked) {
        $w("#datePicker1").disable();
        $w("#datePicker1").value = new Date();
        console.log("Checkbox date", $w("#datePicker1").value)
        getCheckListProgressReady($w("#datePicker1").value, passedDetails)
    } else {
        $w("#datePicker1").enable()
    }
}

async function getCheckLists(time) { // this function gets the checklists and moved to front side
    return await wixData.query("checklists")
        .eq('timeRemaining', time)
        .find()
        .then((results) => {
            console.log(results)
            if (results.items.length > 0) {
                console.log("In if")
                console.log(results.items) //see item below
                let myitems = results.items
                var desiredChecklists = myitems.map((value, index) => {
                    console.log(value)
                    let text = value.checklist
                    let obj = {}
                    obj['label'] = text
                    obj['value'] = text
                    return obj
                })
                return desiredChecklists
            } else {
                console.log("NO match found!!")
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });

}

export function checkboxCheckLists_change(event) { // Real-time Progress bar functionality
    //console.log($w("#checkboxCheckLists").value)
    let clicked = $w("#checkboxCheckLists").value
    console.log(clicked)
    score = Math.round((clicked.length / checklists.length) * 100);
    $w("#txtScore").text = score.toString() + " % Complete"; // Showing Percentage
    $w("#progressBarChecklist").value = score // Math.round((clicked.length / checklists.length) * 100);
}

function getValuesReady(details) { // This ready the fields 
    $w("#myStateBox").changeState("state2");
    $w("#iptBrideName").value = details.brideName
    $w("#iptGroomName").value = details.groomName

    $w("#checkboxDontKnow").checked = details.isDate
    console.log("in values raedy function")
    console.log(details.isDate, $w("#checkboxDontKnow").checked)
    //isDate = details.isDate
    if ($w("#checkboxDontKnow").checked) {
        $w("#datePicker1").disable();
        $w("#datePicker1").value = new Date(details.weddingDate)
    } else {
        $w("#datePicker1").enable();
        $w("#datePicker1").value = new Date(details.weddingDate)
        //weddingDate = details.weddingDate
    }

    $w("#radioGroupVenue").value = details.isVenue
    //isVenue = details.isVenue
    if (details.isVenue == 'yes') {
        $w("#iptVenueName").value = details.venueName
        //venueName = details.venueName
        $w("#iptVenueName").expand();
    }

    $w("#radioGroupTheme").value = details.istheme
    //isTheme = details.istheme
    if (details.istheme == 'yes') {
        //themeName = details.themeName
        $w("#iptThemeName").value = details.themeName
        $w("#iptThemeName").expand();
    }

    $w("#radioGroupmood").value = details.isWeddingBoard
    //isMood = details.isWeddingBoard
    if (details.isWeddingBoard == 'yes') {
        $w("#myimage").expand();
        $w("#btnUpload").expand();
        $w("#txtmessage").collapse();
    } else if (details.isWeddingBoard == 'no') {
        $w("#btnUpload").collapse();
        $w("#myimage").collapse();
        $w("#txtmessage").expand();
    }
    $w("#radioGroup1").value = details.type
    $w("#radioGroup2").value = details.guests
    $w("#radioGroup3").value = details.planner
    $w("#myimage").src = details.weddingBoard
    oldImage = details.weddingBoard
    imageUrl = details.weddingBoard
    //$w("#myimage").src = oldImage

    //"weddingBoard": imageUrl,
    //"checklists": selectedcheckboxList

}

function getCheckListProgressReady(passsedDate, details) { // It calculates time and ready the checklists
    today = new Date();
    console.log(today.toLocaleDateString());
    date1 = new Date(passsedDate)
    console.log("in get checklist function", passsedDate);
    diffTime = Math.abs(date1 - today);
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    months = Math.floor(diffDays * 0.032855);
    console.log(months + " months");
    console.log(diffDays + " days");
    if (months > 6) {
        timeremained = 'oneYear'
        $w("#txtNoChecklist").collapse();
        $w("#checkboxCheckLists").expand();
        showChecklist(timeremained, details)
    } else if (months > 3 && months <= 6) {
        timeremained = 'sixMonth'
        $w("#txtNoChecklist").collapse();
        $w("#checkboxCheckLists").expand();
        showChecklist(timeremained, details)

    } else if (months >= 0 && months <= 3) {
        timeremained = 'threeMonth'
        $w("#txtNoChecklist").collapse();
        $w("#checkboxCheckLists").expand();
        showChecklist(timeremained, details)
    } else {
        timeremained = 'notassigned'
        $w("#txtNoChecklist").expand();
        $w("#checkboxCheckLists").collapse();
        $w("#progressBarChecklist").value = 0;
    }

}

function showChecklist(time, details) {
    getCheckLists(time).then(output => {
        checklists = output
        console.log("checklist output-->", output)
        $w("#checkboxCheckLists").options = checklists

        if (details != null) {

            let savedInfo = details.checklists
            console.log("SAved checklist in array-->", savedInfo)
            let selected = [];
            checklists.forEach((elementout, indexout) => {
                console.log("in outer foreach");
                savedInfo.forEach((elementin, indexin) => {
                    console.log("In inner foreach");
                    if (elementout.value == elementin) {
                        selected.push(indexout)
                    }
                });
            });

            $w("#checkboxCheckLists").selectedIndices = selected;
            //$w("#progressBarChecklist").targetValue = 100;
            score = Math.round((selected.length / checklists.length) * 100);
            $w("#txtScore").text = score.toString() + " % Complete";
            $w("#progressBarChecklist").value = score //Math.round((selected.length / checklists.length) * 100);
        }
    })
}



// master js code


// The code in this file will load on every page of your site
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { getUser } from 'backend/data.jsw';
import { session } from 'wix-storage';
let email;

$w.onReady(async function () {
    wixUsers.onLogin((user) => {
        let islogged = user.loggedIn;
        let userId = user.id;
        if (islogged) {
            $w("#btnProjects").expand();
            getUser(userId).then((result) => {
                email = result.loginEmail;
                session.setItem("email", email);      
            })
        }
    })
    if (wixUsers.currentUser.loggedIn) {
        $w("#btnProjects").expand();
        email = await wixUsers.currentUser.getEmail()
        session.setItem("email", email);
    } else {
        $w("#btnProjects").collapse();
    }

});