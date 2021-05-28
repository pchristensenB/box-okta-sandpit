
$(document).ready(function () {
    $("#myModal").toggle();
    $("#imagemodal").toggle();
    $("#popreg").on("click", function () {
        $('#imagepreview').attr('src', '/img/register.png');
        $('#imagemodal').modal('show'); // imagemodal is the id attribute assigned to the bootstrap modal, then i use the show function
    });
    $("#poplog").on("click", function () {
        $('#imagepreview').attr('src', '/img/login.png');
        $('#imagemodal').modal('show'); // imagemodal is the id attribute assigned to the bootstrap modal, then i use the show function
    });
    authClient = new OktaAuth({
        url: baseUrl,
        clientId: clientId,
        redirectUri: oktaRedirectURL
    })
    authClient.session.exists()
        .then(function (exists) {
            if (exists) {
                console.log("the user has a session")

                $("#loginLink").hide()
                $("#registerLink").hide()
                $(".view").hide();
                $(".load").html("<img src='https://pcboxdemo.github.io/load.gif'/>").show();

                authClient.token.getWithoutPrompt({
                    responseType: ['id_token', 'token'], // or array of types
                    scopes: ['openid', 'email', 'profile']
                })
                    .then(function (tokenOrTokens) {
                        console.dir(tokenOrTokens)
                        console.log("the id token is: " + tokenOrTokens[0].idToken)
                        console.log("the access token is: " + tokenOrTokens[1].accessToken)

                        showApp(tokenOrTokens[1].accessToken)

                    })
                    .catch(function (err) {
                        // handle OAuthError
                    })
            } else {
                console.log("the user is not logged in")
                var html = ""
                html += "<p style = 'margin-bottom: 250px'>Please click \"register\" to begin,"
                html += "<br>or log in if you already have an account.</p>"

                $("#mainMsg").html(html)
                $("#signoutLink").hide()
            }
        })
});


function showApp(accessToken) {

    console.log("getting ready to send the id token to /boxUI")

    $.post("/boxUI", { accessToken: accessToken }, function (json) {
        console.log("the message back is: " + JSON.stringify(json));
        var boxAccessToken = json.accessToken
        showBoxUI(boxAccessToken)
        $("#user").append("Okta User:" + json.userName).append("<br/>");
        $("#user").append("Okta Email:" + json.email).append("<br/>");
        $("#user").append("Okta ID:" + json.oktaId).append("<br/>");
        $("#user").append("Okta BoxID:" + json.appUserID).append("<br/>");
        $("#user").append("Box User ID:" + json.appUserID).append("<br/>");
        $("#user").append("Box external app user ID:" + json.extId).append("<br/>");
        $("#user").append("Box User Name:" + json.userName).append("<br/>");
        $("#user").append("Box User Login:" + json.login).append("<br/>");
    })
        .done(function (boxAccessToken) {
            $("#myModal").toggle();
            $(".view").hide();
        });
}
function renderWidget() {
    var oktaSignIn = new OktaSignIn({ baseUrl: baseUrl })
    $("#ui").html("")
    $("#myModal").modal()
    $("#okta-login-container").css("display", "block")
    oktaSignIn.renderEl(
        { el: '#okta-login-container' },
        function (res) {
            if (res.status === 'SUCCESS') { res.session.setCookieAndRedirect(oktaRedirectURL); }
        }
    )
}
function evaluateForm(type = "register") {
    $.post("/evaluateRegForm", $("#regForm").serialize(), function (json) {
        if (json.msg != "success") {
            $("#ui").html("sorry! " + json.msg)
        }
        else {
            var html = "<p>Thank you for registering, " + json.firstName + "!</p>"
            html += "<p>Please check your email to finish setting up your account.</p>"
            $("#ui").html(html)
        }
    })
}
function register() {
    var html = ""
    html += '<form id = "regForm" onsubmit="event.preventDefault(); evaluateForm(\'register\')">'
    html += '<div class="form-group"><label for="firstName">First name:</label><input type="text" class="form-control" id="firstName" name="firstName" required=""></div>'
    html += '<div class="form-group"><label for="lastName">Last name:</label><input type="text" class="form-control" id="lastName" name="lastName" required=""></div>'
    html += '<div class="form-group"><label for="email">Email:</label><input type="email" class="form-control" id="email" name="email" data-parsley-trigger="change" required=""></div>'
    html += '<input type = "submit">'
    html += '</form>'
    $("#modal-title-element").html("Register")
    $("#okta-login-container").hide();
    $("#ui").html(html)
    $("#myModal").modal()
}
function signOut() {
    authClient.signOut()
        .then(function () {
            console.log('successfully logged out')
            $("#signoutLink").hide()
            $("#loginLink").show()
            $("#registerLink").show()
            $("#app-container").hide()
            $(".load").hide();
            $(".view").show();

        })
        .fail(function (err) {
            console.error(err);
        });
}

//Shows the box content explorer
function showBoxUI(boxAccessToken) {
    var folderId = '0';
    var contentExplorer = new Box.ContentExplorer();
    contentExplorer.show(folderId, boxAccessToken, {
        container: '#app-container',
        logoUrl: 'box',
        contentPreviewProps: {
          contentSidebarProps: {
            detailsSidebarProps: {
              hasNotices: true,
              hasProperties: true,
              hasAccessStats: true,
              hasVersions: true
            },
            hasActivityFeed: true,
            hasSkills: true,
            hasMetadata: true
          }
        }
    })
    $("#app-container").height(600);
    var coll = document.getElementsByClassName("collapsible");
    $(".collapsible").show();
    for (var i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
                $("#userinfo").text("Show user info");
            } else {
                content.style.display = "block";
                $("#userinfo").text("Hide user info");
            }
        });
    }
    $("#app-container").show();
    $("#myModal").toggle();
    $(".load").hide();
}