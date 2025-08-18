function search() {
    var input, filter, ul, li;
    input = document.getElementById("myinput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("cont");
    li = ul.getElementsByTagName("a");
        for (i = 0; i < li.length; i++) {
            if (filter == li[i].id.toUpperCase() || filter == "") {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
}

function send(){
    alert("^-^ EMAIL SENT ^-^");
}

var attempt = 3; // Variable to count number of attempts.
// Below function Executes on click of login button.
function validate() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    if (username == "karthik77" && password == "karthik@123") {
        window.location.assign("index.html") // Redirecting to other page.
        return false;
    }
    else {
        attempt--;// Decrementing by one.
        alert("You have left " + attempt + " attempt;");
        // Disabling fields after 3 attempts.
        if (attempt == 0) {
            document.getElementById("username").disabled = true;
            document.getElementById("password").disabled = true;
            document.getElementById("submit").disabled = true;
            return false;
        }
    }
}



var btn = document.getElementById("btn");
btn.addEventListener('click', function (e) {
    e.preventDefault()
    alert("^-^ EMAIL SENT ^-^");
    var fname = document.getElementById("fname").value;
    var lname = document.getElementById("lname").value;
    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone-no").value
    var content = document.getElementById("content").value
    var body = 'Name : ' + fname +" "+ lname + '<br/>Email : ' + email + '<br/>Message : ' + content
    Email.send({
        Host: "smtp.elasticemail.com",
        Username: "karthikeyalucky5585@gmail.com",
        Password: "DF07296AAAE9162B6518AA1F5872B37F83DA",
        To: 'karthikeyaluckt5585@gmail.com',
        From: email,
        Subject: fname+" "+lname,
        Body: body
    }).then(
        alert("^-^ EMAIL SENT ^-^")
    );
})

const img=["img/gh.webp"];
const sname=["Golden Hour"];
const singer=["-JVKE"];
const music=["music/golden hour.mp3"];

function song(x){
    n=x-1;
    document.getElementById("songimg").src=img[n];
    document.getElementById("songname").innerHTML = sname[n];
    document.getElementById("singer").innerHTML = singer[n];
    document.getElementById("song").src = music[n];
}
